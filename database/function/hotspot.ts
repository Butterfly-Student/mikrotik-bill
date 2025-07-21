import { eq, and, isNull, desc, asc, sql, count, sum } from "drizzle-orm";
import {
	radacct,
	radcheck,
	radgroupcheck,
	radgroupreply,
	radreply,
	radusergroup,
	hotspotProfile,
	hotspotGroup,
	hotspotUser,
	hotspotBatch,
	hotspotUserBatch,
	hotspotSession,
	type HotspotProfile,
	type NewHotspotProfile,
	type HotspotGroup,
	type NewHotspotGroup,
	type HotspotUser,
	type NewHotspotUser,
	type HotspotBatch,
	type NewHotspotBatch,
	type HotspotSession,
	type NewHotspotSession,
} from "@/database/schema/mikrotik";
import * as schema from "@/database/schema/mikrotik";
import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "@/lib/db/index";



// ========================================
// HOTSPOT PROFILE FUNCTIONS
// ========================================

export class HotspotProfileService {
	private db = drizzle(pool, { schema });

	// Create profile with FreeRADIUS integration
	async createProfile(profileData: NewHotspotProfile): Promise<HotspotProfile> {
		return await this.db.transaction(async (tx) => {
			// Create radgroupreply entry for rate limit (menggunakan radgroupreply untuk group attributes)
			let radgroupreply_rate_id: number | null = null;
			if (profileData.rate_limit) {
				const [radGroupReplyRate] = await tx
					.insert(radgroupreply)
					.values({
						GroupName: profileData.profile_name, // Gunakan 'groupname' bukan 'GroupName'
						Attribute: "Mikrotik-Rate-Limit",
						op: "=", // Gunakan "=" untuk reply attributes
						Value: profileData.rate_limit,
					})
					.returning();
				radgroupreply_rate_id = radGroupReplyRate.id;
			}

			// Create radgroupreply entry for session timeout
			let radgroupreply_session_id: number | null = null;
			if (profileData.session_limit) {
				const [radGroupReplySession] = await tx
					.insert(radgroupreply)
					.values({
						GroupName: profileData.profile_name, // Gunakan 'groupname' bukan 'GroupName'
						Attribute: "Session-Timeout",
						op: "=", // Gunakan "=" untuk reply attributes
						Value: profileData.session_limit.toString(),
					})
					.returning();
				radgroupreply_session_id = radGroupReplySession.id;
			}

			// Create hotspot profile
			const [profile] = await tx
				.insert(hotspotProfile)
				.values({
					...profileData,
					radgroupcheck_id: null, // Tidak menggunakan radgroupcheck untuk profile
					radgroupreply_id: radgroupreply_rate_id || radgroupreply_session_id,
				})
				.returning();

			return profile;
		});
	}

	// Get all profiles with FreeRADIUS data
	async getProfiles(): Promise<HotspotProfile[]> {
		return await this.db
			.select()
			.from(hotspotProfile)
			.orderBy(asc(hotspotProfile.id));
	}

	// Get profile by ID with relations
	async getProfileById(id: number): Promise<HotspotProfile | null> {
		const [profile] = await this.db
			.select()
			.from(hotspotProfile)
			.where(eq(hotspotProfile.id, id));
		return profile || null;
	}

	// Update profile with FreeRADIUS sync
	async updateProfile(
		id: number,
		updateData: Partial<NewHotspotProfile>
	): Promise<HotspotProfile> {
		return await this.db.transaction(async (tx) => {
			const [existingProfile] = await tx
				.select()
				.from(hotspotProfile)
				.where(eq(hotspotProfile.id, id));
			if (!existingProfile) throw new Error("Profile not found");

			// Update radgroupreply for rate limit
			if (updateData.rate_limit) {
				// Cari existing radgroupreply untuk rate limit
				const [existingRateLimit] = await tx
					.select()
					.from(radgroupreply)
					.where(and(
						eq(radgroupreply.GroupName, existingProfile.profile_name),
						eq(radgroupreply.Attribute, "Mikrotik-Rate-Limit")
					));

				if (existingRateLimit) {
					await tx
						.update(radgroupreply)
						.set({ Value: updateData.rate_limit })
						.where(eq(radgroupreply.id, existingRateLimit.id));
				} else {
					// Buat entry baru jika belum ada
					await tx
						.insert(radgroupreply)
						.values({
							GroupName: existingProfile.profile_name,
							Attribute: "Mikrotik-Rate-Limit",
							op: "=",
							Value: updateData.rate_limit,
						});
				}
			}

			// Update radgroupreply for session timeout
			if (updateData.session_limit) {
				const [existingSessionLimit] = await tx
					.select()
					.from(radgroupreply)
					.where(and(
						eq(radgroupreply.GroupName, existingProfile.profile_name),
						eq(radgroupreply.Attribute, "Session-Timeout")
					));

				if (existingSessionLimit) {
					await tx
						.update(radgroupreply)
						.set({ Value: updateData.session_limit.toString() })
						.where(eq(radgroupreply.id, existingSessionLimit.id));
				} else {
					await tx
						.insert(radgroupreply)
						.values({
							GroupName: existingProfile.profile_name,
							Attribute: "Session-Timeout",
							op: "=",
							Value: updateData.session_limit.toString(),
						});
				}
			}

			// Update hotspot profile
			const [updatedProfile] = await tx
				.update(hotspotProfile)
				.set(updateData)
				.where(eq(hotspotProfile.id, id))
				.returning();

			return updatedProfile;
		});
	}

	// Delete profile with FreeRADIUS cleanup
	async deleteProfile(id: number): Promise<void> {
		await this.db.transaction(async (tx) => {
			const [profile] = await tx
				.select()
				.from(hotspotProfile)
				.where(eq(hotspotProfile.id, id));
			if (!profile) throw new Error("Profile not found");

			// Delete related FreeRADIUS entries in radgroupreply
			await tx
				.delete(radgroupreply)
				.where(eq(radgroupreply.GroupName, profile.profile_name));

			// Delete profile
			await tx.delete(hotspotProfile).where(eq(hotspotProfile.id, id));
		});
	}
}

// ========================================
// HOTSPOT GROUP FUNCTIONS
// ========================================

export class HotspotGroupService {
	private db = drizzle(pool, { schema });

	async createGroup(groupData: NewHotspotGroup): Promise<HotspotGroup> {
		return await this.db.transaction(async (tx) => {
			// Create radgroupreply entry dari profile jika ada
			let radgroupreply_id: number | null = null;
			if (groupData.profile_id) {
				const [profile] = await tx
					.select()
					.from(hotspotProfile)
					.where(eq(hotspotProfile.id, groupData.profile_id));
				
				if (profile) {
					// Copy rate limit dari profile ke group
					if (profile.rate_limit) {
						const [radGroupReply] = await tx
							.insert(radgroupreply)
							.values({
								GroupName: groupData.group_name, // Gunakan 'groupname'
								Attribute: "Mikrotik-Rate-Limit",
								op: "=", // Gunakan "=" untuk reply
								Value: profile.rate_limit,
							})
							.returning();
						radgroupreply_id = radGroupReply.id;
					}
					
					// Copy session timeout dari profile ke group
					if (profile.session_limit) {
						await tx
							.insert(radgroupreply)
							.values({
								GroupName: groupData.group_name,
								Attribute: "Session-Timeout",
								op: "=",
								Value: profile.session_limit.toString(),
							});
					}
				}
			}

			const [group] = await tx
				.insert(hotspotGroup)
				.values({
					...groupData,
					radgroupcheck_id: null, // Tidak menggunakan radgroupcheck
					radgroupreply_id,
				})
				.returning();

			return group;
		});
	}

	async getGroups(): Promise<HotspotGroup[]> {
		return await this.db
			.select()
			.from(hotspotGroup)
			.orderBy(asc(hotspotGroup.id));
	}

	async getGroupById(id: number): Promise<HotspotGroup | null> {
		const [group] = await this.db
			.select()
			.from(hotspotGroup)
			.where(eq(hotspotGroup.id, id));
		return group || null;
	}

	async updateGroup(
		id: number,
		updateData: Partial<NewHotspotGroup>
	): Promise<HotspotGroup> {
		const [updatedGroup] = await this.db
			.update(hotspotGroup)
			.set(updateData)
			.where(eq(hotspotGroup.id, id))
			.returning();

		return updatedGroup;
	}

	async deleteGroup(id: number): Promise<void> {
		await this.db.transaction(async (tx) => {
			const [group] = await tx
				.select()
				.from(hotspotGroup)
				.where(eq(hotspotGroup.id, id));
			if (!group) throw new Error("Group not found");

			// Delete related FreeRADIUS entries
			await tx
				.delete(radgroupreply)
				.where(eq(radgroupreply.GroupName, group.group_name));

			await tx.delete(hotspotGroup).where(eq(hotspotGroup.id, id));
		});
	}
}

// ========================================
// HOTSPOT USER FUNCTIONS
// ========================================

export class HotspotUserService {
	private db = drizzle(pool, { schema });

	// Create user with full FreeRADIUS integration
	async createUser(userData: NewHotspotUser): Promise<HotspotUser> {
		return await this.db.transaction(async (tx) => {
			// Create radcheck entry for password authentication
			const [radCheck] = await tx
				.insert(radcheck)
				.values({
					UserName: userData.username, // Gunakan 'username' bukan 'UserName'
					Attribute: "Cleartext-Password", // Gunakan 'attribute' bukan 'Attribute'
					op: ":=", // Gunakan ":=" untuk check items
					Value: userData.password, // Gunakan 'value' bukan 'Value'
				})
				.returning();

			// Create radreply entry for session attributes (jika perlu per-user override)
			let radreply_id: number | null = null;
			if (userData.profile_id) {
				const [profile] = await tx
					.select()
					.from(hotspotProfile)
					.where(eq(hotspotProfile.id, userData.profile_id));
				
				// Hanya buat radreply jika ada kebutuhan override per-user
				// Biasanya attributes diambil dari radgroupreply via radusergroup
			}

			// Create radusergroup entry
			let radusergroup_id: number | null = null;
			if (userData.group_id) {
				const [group] = await tx
					.select()
					.from(hotspotGroup)
					.where(eq(hotspotGroup.id, userData.group_id));
				if (group) {
					const [radUserGroup] = await tx
						.insert(radusergroup)
						.values({
							UserName: userData.username, // Gunakan 'username' bukan 'UserName'
							GroupName: group.group_name, // Gunakan 'groupname' bukan 'GroupName'
							priority: 0, // Default priority 0
						})
						.returning();
					radusergroup_id = radUserGroup.id;
				}
			}

			// Calculate expiration date
			let expired_at: Date | null = null;
			if (userData.profile_id) {
				const [profile] = await tx
					.select()
					.from(hotspotProfile)
					.where(eq(hotspotProfile.id, userData.profile_id));
				if (profile && profile.validity_days) {
					expired_at = new Date();
					expired_at.setDate(expired_at.getDate() + profile.validity_days);
				}
			}

			// Create hotspot user
			const [user] = await tx
				.insert(hotspotUser)
				.values({
					...userData,
					radcheck_id: radCheck.id,
					radreply_id,
					radusergroup_id,
					expired_at,
				})
				.returning();

			return user;
		});
	}

	async getUsers(
		limit: number = 100,
		offset: number = 0
	): Promise<HotspotUser[]> {
		return await this.db
			.select()
			.from(hotspotUser)
			.limit(limit)
			.offset(offset)
			.orderBy(desc(hotspotUser.created_at));
	}

	async getUserById(id: number): Promise<HotspotUser | null> {
		const [user] = await this.db
			.select()
			.from(hotspotUser)
			.where(eq(hotspotUser.id, id));
		return user || null;
	}

	async getUserByUsername(username: string): Promise<HotspotUser | null> {
		const [user] = await this.db
			.select()
			.from(hotspotUser)
			.where(eq(hotspotUser.username, username));
		return user || null;
	}

	async updateUser(
		id: number,
		updateData: Partial<NewHotspotUser>
	): Promise<HotspotUser> {
		return await this.db.transaction(async (tx) => {
			const [existingUser] = await tx
				.select()
				.from(hotspotUser)
				.where(eq(hotspotUser.id, id));
			if (!existingUser) throw new Error("User not found");

			// Update radcheck if password changed
			if (updateData.password && existingUser.radcheck_id) {
				await tx
					.update(radcheck)
					.set({ Value: updateData.password }) // Gunakan 'value'
					.where(eq(radcheck.id, existingUser.radcheck_id));
			}

			// Update username in radcheck if username changed
			if (updateData.username && existingUser.radcheck_id) {
				await tx
					.update(radcheck)
					.set({ UserName: updateData.username })
					.where(eq(radcheck.id, existingUser.radcheck_id));
			}

			// Update username in radusergroup if username changed
			if (updateData.username && existingUser.radusergroup_id) {
				await tx
					.update(radusergroup)
					.set({ UserName: updateData.username })
					.where(eq(radusergroup.id, existingUser.radusergroup_id));
			}

			// Update user
			const [updatedUser] = await tx
				.update(hotspotUser)
				.set(updateData)
				.where(eq(hotspotUser.id, id))
				.returning();

			return updatedUser;
		});
	}

	async deleteUser(id: number): Promise<void> {
		await this.db.transaction(async (tx) => {
			const [user] = await tx
				.select()
				.from(hotspotUser)
				.where(eq(hotspotUser.id, id));
			if (!user) throw new Error("User not found");

			// Delete related FreeRADIUS entries
			if (user.radcheck_id) {
				await tx.delete(radcheck).where(eq(radcheck.id, user.radcheck_id));
			}
			if (user.radreply_id) {
				await tx.delete(radreply).where(eq(radreply.id, user.radreply_id));
			}
			if (user.radusergroup_id) {
				await tx
					.delete(radusergroup)
					.where(eq(radusergroup.id, user.radusergroup_id));
			}

			// Delete user
			await tx.delete(hotspotUser).where(eq(hotspotUser.id, id));
		});
	}

	// Get active users
	async getActiveUsers(): Promise<HotspotUser[]> {
		return await this.db
			.select()
			.from(hotspotUser)
			.where(eq(hotspotUser.status, "active"))
			.orderBy(desc(hotspotUser.created_at));
	}

	// Get expired users
	async getExpiredUsers(): Promise<HotspotUser[]> {
		return await this.db
			.select()
			.from(hotspotUser)
			.where(eq(hotspotUser.status, "expired"))
			.orderBy(desc(hotspotUser.expired_at));
	}
}

// ========================================
// BATCH VOUCHER FUNCTIONS
// ========================================

export class HotspotBatchService {
	private db = drizzle(pool, { schema });

	// Generate random string for voucher
	private generateRandomString(length: number, characters: string): string {
		let result = "";
		for (let i = 0; i < length; i++) {
			result += characters.charAt(
				Math.floor(Math.random() * characters.length)
			);
		}
		return result;
	}

	// Create batch and generate vouchers
	async createBatch(
		batchData: NewHotspotBatch,
		quantity: number
	): Promise<{
		batch: HotspotBatch;
		users: HotspotUser[];
	}> {
		return await this.db.transaction(async (tx) => {
			// Create batch
			const [batch] = await tx
				.insert(hotspotBatch)
				.values({
					...batchData,
					total_generated: quantity,
				})
				.returning();

			// Generate vouchers
			const users: HotspotUser[] = [];
			const userService = new HotspotUserService();

			for (let i = 0; i < quantity; i++) {
				const username = batchData.prefix
					? `${batchData.prefix}${this.generateRandomString(
							batchData.length || 6,
							batchData.characters || "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
					  )}`
					: this.generateRandomString(
							batchData.length || 6,
							batchData.characters || "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
					  );

				const password =
					batchData.password_mode === "same_as_username"
						? username
						: this.generateRandomString(
								batchData.length || 6,
								batchData.characters || "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
						  );

				// Create user with FreeRADIUS integration
				const userData: NewHotspotUser = {
					username,
					password,
					profile_id: batchData.profile_id,
					group_id: batchData.group_id,
					status: batchData.disable ? "inactive" : "active",
					comment: batchData.comment,
					shared_users: batchData.shared_users || 1,
				};

				const user = await userService.createUser(userData);
				users.push(user);

				// Link user to batch
				await tx.insert(hotspotUserBatch).values({
					user_id: user.id,
					batch_id: batch.id,
				});
			}

			return { batch, users };
		});
	}

	async getBatches(): Promise<HotspotBatch[]> {
		return await this.db
			.select()
			.from(hotspotBatch)
			.orderBy(desc(hotspotBatch.created_at));
	}

	async getBatchById(id: number): Promise<HotspotBatch | null> {
		const [batch] = await this.db
			.select()
			.from(hotspotBatch)
			.where(eq(hotspotBatch.id, id));
		return batch || null;
	}

	// Get batch users
	async getBatchUsers(batchId: number): Promise<HotspotUser[]> {
		return await this.db
			.select({
				id: hotspotUser.id,
				username: hotspotUser.username,
				password: hotspotUser.password,
				status: hotspotUser.status,
				created_at: hotspotUser.created_at,
				expired_at: hotspotUser.expired_at,
				profile_id: hotspotUser.profile_id,
				group_id: hotspotUser.group_id,
				comment: hotspotUser.comment,
				shared_users: hotspotUser.shared_users,
				radcheck_id: hotspotUser.radcheck_id,
				radreply_id: hotspotUser.radreply_id,
				radusergroup_id: hotspotUser.radusergroup_id,
			})
			.from(hotspotUser)
			.innerJoin(hotspotUserBatch, eq(hotspotUser.id, hotspotUserBatch.user_id))
			.where(eq(hotspotUserBatch.batch_id, batchId))
			.orderBy(asc(hotspotUser.created_at));
	}

	async updateBatch(
		id: number,
		updateData: Partial<NewHotspotBatch>
	): Promise<HotspotBatch> {
		const [updatedBatch] = await this.db
			.update(hotspotBatch)
			.set(updateData)
			.where(eq(hotspotBatch.id, id))
			.returning();

		return updatedBatch;
	}

	async deleteBatch(id: number, deleteUsers: boolean = false): Promise<void> {
		await this.db.transaction(async (tx) => {
			if (deleteUsers) {
				// Get all users in this batch
				const batchUsers = await tx
					.select()
					.from(hotspotUserBatch)
					.where(eq(hotspotUserBatch.batch_id, id));

				// Delete each user (with FreeRADIUS cleanup)
				const userService = new HotspotUserService();
				for (const batchUser of batchUsers) {
					await userService.deleteUser(batchUser.user_id);
				}
			}

			// Delete batch-user relationships
			await tx
				.delete(hotspotUserBatch)
				.where(eq(hotspotUserBatch.batch_id, id));

			// Delete batch
			await tx.delete(hotspotBatch).where(eq(hotspotBatch.id, id));
		});
	}

	// Get batch statistics
	async getBatchStats(batchId: number): Promise<{
		total_users: number;
		active_users: number;
		inactive_users: number;
		expired_users: number;
		online_users: number;
	}> {
		const stats = await this.db
			.select({
				total_users: count(),
				active_users: count(
					sql`CASE WHEN ${hotspotUser.status} = 'active' THEN 1 END`
				),
				inactive_users: count(
					sql`CASE WHEN ${hotspotUser.status} = 'inactive' THEN 1 END`
				),
				expired_users: count(
					sql`CASE WHEN ${hotspotUser.status} = 'expired' THEN 1 END`
				),
			})
			.from(hotspotUser)
			.innerJoin(hotspotUserBatch, eq(hotspotUser.id, hotspotUserBatch.user_id))
			.where(eq(hotspotUserBatch.batch_id, batchId));

		// Get online users count
		const onlineUsers = await this.db
			.select({
				online_users: count(),
			})
			.from(hotspotSession)
			.innerJoin(
				hotspotUser,
				eq(hotspotSession.hotspot_user_id, hotspotUser.id)
			)
			.innerJoin(hotspotUserBatch, eq(hotspotUser.id, hotspotUserBatch.user_id))
			.where(
				and(
					eq(hotspotUserBatch.batch_id, batchId),
					eq(hotspotSession.active, 1),
					isNull(hotspotSession.stopTime)
				)
			);

		return {
			total_users: stats[0]?.total_users || 0,
			active_users: stats[0]?.active_users || 0,
			inactive_users: stats[0]?.inactive_users || 0,
			expired_users: stats[0]?.expired_users || 0,
			online_users: onlineUsers[0]?.online_users || 0,
		};
	}
}

// ========================================
// SESSION MANAGEMENT FUNCTIONS
// ========================================

// export class HotspotSessionService {
// 	private db = drizzle(pool, { schema });

// 	// Get active sessions
// 	async getActiveSessions(): Promise<HotspotSession[]> {
// 		return await this.db
// 			.select()
// 			.from(hotspotSession)
// 			.where(and(eq(hotspotSession.active, 1), isNull(hotspotSession.stopTime)))
// 			.orderBy(desc(hotspotSession.startTime));
// 	}

// 	// Get user sessions
// 	async getUserSessions(userId: number): Promise<HotspotSession[]> {
// 		return await this.db
// 			.select()
// 			.from(hotspotSession)
// 			.where(eq(hotspotSession.hotspot_user_id, userId))
// 			.orderBy(desc(hotspotSession.startTime));
// 	}

// 	// Get session by ID
// 	async getSessionById(id: number): Promise<HotspotSession | null> {
// 		const [session] = await this.db
// 			.select()
// 			.from(hotspotSession)
// 			.where(eq(hotspotSession.id, id));
// 		return session || null;
// 	}

// 	// Create session from radacct
// 	async createSessionFromRadacct(radacctId: number): Promise<HotspotSession> {
// 		return await this.db.transaction(async (tx) => {
// 			// Get radacct data
// 			const [radacctData] = await tx
// 				.select()
// 				.from(radacct)
// 				.where(eq(radacct.RadAcctId, radacctId));
// 			if (!radacctData) throw new Error("RadAcct record not found");

// 			// Find corresponding hotspot user
// 			const [hotspotUserData] = await tx
// 				.select()
// 				.from(hotspotUser)
// 				.where(eq(hotspotUser.username, radacctData.UserName || ""));

// 			// Create session
// 			const [session] = await tx
// 				.insert(hotspotSession)
// 				.values({
// 					username: radacctData.UserName || "",
// 					acctSessionId: radacctData.AcctSessionId,
// 					acctUniqueId: radacctData.AcctUniqueId,
// 					nasIpAddress: radacctData.NASIPAddress,
// 					framedIpAddress: radacctData.FramedIPAddress,
// 					callingStationId: radacctData.CallingStationId,
// 					startTime: radacctData.AcctStartTime,
// 					updateTime: radacctData.AcctUpdateTime,
// 					stopTime: radacctData.AcctStopTime,
// 					inputOctets: radacctData.AcctInputOctets,
// 					outputOctets: radacctData.AcctOutputOctets,
// 					sessionTime: radacctData.AcctSessionTime,
// 					terminateCause: radacctData.AcctTerminateCause,
// 					active: radacctData.AcctStopTime ? 0 : 1,
// 					serviceCategory: "hotspot",
// 					radacct_id: radacctId,
// 					hotspot_user_id: hotspotUserData?.id || null,
// 				})
// 				.returning();

// 			return session;
// 		});
// 	}

// 	// Update session
// 	async updateSession(
// 		id: number,
// 		updateData: Partial<NewHotspotSession>
// 	): Promise<HotspotSession> {
// 		const [updatedSession] = await this.db
// 			.update(hotspotSession)
// 			.set(updateData)
// 			.where(eq(hotspotSession.id, id))
// 			.returning();

// 		return updatedSession;
// 	}

// 	// Terminate session
// 	async terminateSession(
// 		id: number,
// 		terminateCause: string = "User-Request"
// 	): Promise<HotspotSession> {
// 		const [terminatedSession] = await this.db
// 			.update(hotspotSession)
// 			.set({
// 				stopTime: new Date(),
// 				terminateCause,
// 				active: 0,
// 			})
// 			.where(eq(hotspotSession.id, id))
// 			.returning();

// 		return terminatedSession;
// 	}

// 	// Get session statistics
// 	async getSessionStats(userId?: number): Promise<{
// 		total_sessions: number;
// 		active_sessions: number;
// 		total_upload: number;
// 		total_download: number;
// 		total_duration: number;
// 	}> {
// 		const baseQuery = this.db
// 			.select({
// 				total_sessions: count(),
// 				active_sessions: count(
// 					sql`CASE WHEN ${hotspotSession.active} = 1 THEN 1 END`
// 				),
// 				total_upload: sum(hotspotSession.inputOctets),
// 				total_download: sum(hotspotSession.outputOctets),
// 				total