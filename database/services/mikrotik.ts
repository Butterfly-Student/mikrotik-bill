
import {
	hotspotProfile,
	hotspotGroup,
	hotspotUser,
	hotspotBatch,
	hotspotUserBatch,
	hotspotSession,
	hotspotUserAuth,
	radcheck,
	radreply,
	radgroupcheck,
	radgroupreply,
	radusergroup,
	nas,
	type NewHotspotProfile,
	type NewHotspotGroup,
	type NewHotspotUser,
	type NewHotspotBatch,
	type HotspotProfile,
	type HotspotGroup,
	type HotspotUser,
	type HotspotBatch,
} from "@/database/schema/mikrotik";
import { db } from "@/lib/db/index";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

// ========================================
// HOTSPOT PROFILE FUNCTIONS
// ========================================

export class HotspotProfileService {
	static async create(data: Omit<NewHotspotProfile, "id" | "created_at">) {
		return await db.transaction(async (tx) => {
			try {
				// Create group check attributes for the profile
				const groupCheckData = [];
				if (data.session_limit) {
					groupCheckData.push({
						GroupName: data.profile_name,
						Attribute: "Max-All-Session",
						op: "==" as const,
						Value: data.session_limit.toString(),
					});
				}
				if (data.upload_limit) {
					groupCheckData.push({
						GroupName: data.profile_name,
						Attribute: "Max-Octets-Upload",
						op: "==" as const,
						Value: data.upload_limit.toString(),
					});
				}
				if (data.download_limit) {
					groupCheckData.push({
						GroupName: data.profile_name,
						Attribute: "Max-Octets-Download",
						op: "==" as const,
						Value: data.download_limit.toString(),
					});
				}
				if (data.validity_days) {
					groupCheckData.push({
						GroupName: data.profile_name,
						Attribute: "Access-Period",
						op: "==" as const,
						Value: `${data.validity_days}D`,
					});
				}

				// Create group reply attributes for the profile
				const groupReplyData = [];
				if (data.rate_limit) {
					groupReplyData.push({
						GroupName: data.profile_name,
						Attribute: "Mikrotik-Rate-Limit",
						op: "=" as const,
						Value: data.rate_limit,
					});
				}
				if (data.mikrotik_profile) {
					groupReplyData.push({
						GroupName: data.profile_name,
						Attribute: "Mikrotik-Group",
						op: "=" as const,
						Value: data.mikrotik_profile,
					});
				}

				// Insert group check attributes
				let radgroupcheck_id = null;
				if (groupCheckData.length > 0) {
					const [checkResult] = await tx
						.insert(radgroupcheck)
						.values(groupCheckData[0])
						.returning();
					radgroupcheck_id = checkResult.id;

					// Insert remaining check attributes
					if (groupCheckData.length > 1) {
						await tx.insert(radgroupcheck).values(groupCheckData.slice(1));
					}
				}

				// Insert group reply attributes
				let radgroupreply_id = null;
				if (groupReplyData.length > 0) {
					const [replyResult] = await tx
						.insert(radgroupreply)
						.values(groupReplyData[0])
						.returning();
					radgroupreply_id = replyResult.id;

					// Insert remaining reply attributes
					if (groupReplyData.length > 1) {
						await tx.insert(radgroupreply).values(groupReplyData.slice(1));
					}
				}

				// Create hotspot profile
				const [profile] = await tx
					.insert(hotspotProfile)
					.values({
						...data,
						radgroupcheck_id,
						radgroupreply_id,
					})
					.returning();

				return profile;
			} catch (error) {
				throw new Error(`Failed to create hotspot profile: ${error.message}`);
			}
		});
	}

	static async update(
		id: number,
		data: Partial<Omit<NewHotspotProfile, "id" | "created_at">>
	) {
		return await db.transaction(async (tx) => {
			try {
				// Get existing profile
				const [existingProfile] = await tx
					.select()
					.from(hotspotProfile)
					.where(eq(hotspotProfile.id, id));
				if (!existingProfile) {
					throw new Error("Profile not found");
				}

				// Update group check attributes if needed
				if (
					data.session_limit !== undefined ||
					data.upload_limit !== undefined ||
					data.download_limit !== undefined ||
					data.validity_days !== undefined
				) {
					if (existingProfile.radgroupcheck_id) {
						// Update existing group check
						const groupName = data.profile_name || existingProfile.profile_name;
						await tx
							.update(radgroupcheck)
							.set({ GroupName: groupName })
							.where(eq(radgroupcheck.GroupName, existingProfile.profile_name));
					}
				}

				// Update group reply attributes if needed
				if (
					data.rate_limit !== undefined ||
					data.mikrotik_profile !== undefined
				) {
					if (existingProfile.radgroupreply_id) {
						// Update existing group reply
						const groupName = data.profile_name || existingProfile.profile_name;
						await tx
							.update(radgroupreply)
							.set({ GroupName: groupName })
							.where(eq(radgroupreply.GroupName, existingProfile.profile_name));
					}
				}

				// Update hotspot profile
				const [updatedProfile] = await tx
					.update(hotspotProfile)
					.set(data)
					.where(eq(hotspotProfile.id, id))
					.returning();

				return updatedProfile;
			} catch (error) {
				throw new Error(`Failed to update hotspot profile: ${error.message}`);
			}
		});
	}

	static async delete(id: number) {
		return await db.transaction(async (tx) => {
			try {
				// Get profile with relations
				const [profile] = await tx
					.select()
					.from(hotspotProfile)
					.where(eq(hotspotProfile.id, id));
				if (!profile) {
					throw new Error("Profile not found");
				}

				// Delete related FreeRADIUS entries
				if (profile.radgroupcheck_id) {
					await tx
						.delete(radgroupcheck)
						.where(eq(radgroupcheck.GroupName, profile.profile_name));
				}
				if (profile.radgroupreply_id) {
					await tx
						.delete(radgroupreply)
						.where(eq(radgroupreply.GroupName, profile.profile_name));
				}

				// Delete profile
				await tx.delete(hotspotProfile).where(eq(hotspotProfile.id, id));

				return { success: true };
			} catch (error) {
				throw new Error(`Failed to delete hotspot profile: ${error.message}`);
			}
		});
	}

	static async getAll() {
		return await db.query.hotspotProfile.findMany({
			with: {
				radgroupcheck: true,
				radgroupreply: true,
				nas: true,
			},
		});
	}

	static async getById(id: number) {
		return await db.query.hotspotProfile.findFirst({
			where: eq(hotspotProfile.id, id),
			with: {
				radgroupcheck: true,
				radgroupreply: true,
				nas: true,
				users: true,
				groups: true,
			},
		});
	}
}

// ========================================
// HOTSPOT GROUP FUNCTIONS
// ========================================

export class HotspotGroupService {
	static async create(data: Omit<NewHotspotGroup, "id" | "created_at">) {
		return await db.transaction(async (tx) => {
			try {
				// Create group check entry
				const [groupCheck] = await tx
					.insert(radgroupcheck)
					.values({
						GroupName: data.group_name,
						Attribute: "Auth-Type",
						op: "==" as const,
						Value: "Accept",
					})
					.returning();

				// Create group reply entry
				const [groupReply] = await tx
					.insert(radgroupreply)
					.values({
						GroupName: data.group_name,
						Attribute: "Service-Type",
						op: "=" as const,
						Value: "Framed-User",
					})
					.returning();

				// Create hotspot group
				const [group] = await tx
					.insert(hotspotGroup)
					.values({
						...data,
						radgroupcheck_id: groupCheck.id,
						radgroupreply_id: groupReply.id,
					})
					.returning();

				return group;
			} catch (error) {
				throw new Error(`Failed to create hotspot group: ${error.message}`);
			}
		});
	}

	static async update(
		id: number,
		data: Partial<Omit<NewHotspotGroup, "id" | "created_at">>
	) {
		return await db.transaction(async (tx) => {
			try {
				const [existingGroup] = await tx
					.select()
					.from(hotspotGroup)
					.where(eq(hotspotGroup.id, id));
				if (!existingGroup) {
					throw new Error("Group not found");
				}

				// Update group name in FreeRADIUS tables if changed
				if (data.group_name && data.group_name !== existingGroup.group_name) {
					await tx
						.update(radgroupcheck)
						.set({ GroupName: data.group_name })
						.where(eq(radgroupcheck.GroupName, existingGroup.group_name));

					await tx
						.update(radgroupreply)
						.set({ GroupName: data.group_name })
						.where(eq(radgroupreply.GroupName, existingGroup.group_name));
				}

				// Update hotspot group
				const [updatedGroup] = await tx
					.update(hotspotGroup)
					.set(data)
					.where(eq(hotspotGroup.id, id))
					.returning();

				return updatedGroup;
			} catch (error) {
				throw new Error(`Failed to update hotspot group: ${error.message}`);
			}
		});
	}

	static async delete(id: number) {
		return await db.transaction(async (tx) => {
			try {
				const [group] = await tx
					.select()
					.from(hotspotGroup)
					.where(eq(hotspotGroup.id, id));
				if (!group) {
					throw new Error("Group not found");
				}

				// Delete related FreeRADIUS entries
				await tx
					.delete(radgroupcheck)
					.where(eq(radgroupcheck.GroupName, group.group_name));
				await tx
					.delete(radgroupreply)
					.where(eq(radgroupreply.GroupName, group.group_name));

				// Delete group
				await tx.delete(hotspotGroup).where(eq(hotspotGroup.id, id));

				return { success: true };
			} catch (error) {
				throw new Error(`Failed to delete hotspot group: ${error.message}`);
			}
		});
	}

	static async getAll() {
		return await db.query.hotspotGroup.findMany({
			with: {
				defaultProfile: true,
				radgroupcheck: true,
				radgroupreply: true,
			},
		});
	}

	static async getById(id: number) {
		return await db.query.hotspotGroup.findFirst({
			where: eq(hotspotGroup.id, id),
			with: {
				defaultProfile: true,
				radgroupcheck: true,
				radgroupreply: true,
				users: true,
			},
		});
	}
}

// ========================================
// HOTSPOT USER FUNCTIONS
// ========================================

export class HotspotUserService {
	static async create(data: Omit<NewHotspotUser, "id" | "created_at">) {
		return await db.transaction(async (tx) => {
			try {
				// Create user check entry (password)
				const [userCheck] = await tx
					.insert(radcheck)
					.values({
						UserName: data.username,
						Attribute: "Cleartext-Password",
						op: "==" as const,
						Value: data.password,
					})
					.returning();

				// Create user reply entry (basic attributes)
				const [userReply] = await tx
					.insert(radreply)
					.values({
						UserName: data.username,
						Attribute: "Service-Type",
						op: "=" as const,
						Value: "Framed-User",
					})
					.returning();

				// Create user group mapping if group_id is provided
				let radusergroup_id = null;
				if (data.group_id) {
					const [group] = await tx
						.select()
						.from(hotspotGroup)
						.where(eq(hotspotGroup.id, data.group_id));
					if (group) {
						const [userGroup] = await tx
							.insert(radusergroup)
							.values({
								UserName: data.username,
								GroupName: group.group_name,
								priority: 1,
							})
							.returning();
						radusergroup_id = userGroup.id;
					}
				}

				// Set expiration date if profile has validity_days
				let expired_at = data.expired_at;
				if (data.profile_id && !expired_at) {
					const [profile] = await tx
						.select()
						.from(hotspotProfile)
						.where(eq(hotspotProfile.id, data.profile_id));
					if (profile && profile.validity_days) {
						expired_at = new Date();
						expired_at.setDate(expired_at.getDate() + profile.validity_days);
					}
				}

				// Create hotspot user
				const [user] = await tx
					.insert(hotspotUser)
					.values({
						...data,
						radcheck_id: userCheck.id,
						radreply_id: userReply.id,
						radusergroup_id,
						expired_at,
					})
					.returning();

				return user;
			} catch (error) {
				throw new Error(`Failed to create hotspot user: ${error.message}`);
			}
		});
	}

	static async update(
		id: number,
		data: Partial<Omit<NewHotspotUser, "id" | "created_at">>
	) {
		return await db.transaction(async (tx) => {
			try {
				const [existingUser] = await tx
					.select()
					.from(hotspotUser)
					.where(eq(hotspotUser.id, id));
				if (!existingUser) {
					throw new Error("User not found");
				}

				// Update password in radcheck if changed
				if (data.password && existingUser.radcheck_id) {
					await tx
						.update(radcheck)
						.set({ Value: data.password })
						.where(eq(radcheck.id, existingUser.radcheck_id));
				}

				// Update username in FreeRADIUS tables if changed
				if (data.username && data.username !== existingUser.username) {
					if (existingUser.radcheck_id) {
						await tx
							.update(radcheck)
							.set({ UserName: data.username })
							.where(eq(radcheck.id, existingUser.radcheck_id));
					}
					if (existingUser.radreply_id) {
						await tx
							.update(radreply)
							.set({ UserName: data.username })
							.where(eq(radreply.id, existingUser.radreply_id));
					}
					if (existingUser.radusergroup_id) {
						await tx
							.update(radusergroup)
							.set({ UserName: data.username })
							.where(eq(radusergroup.id, existingUser.radusergroup_id));
					}
				}

				// Update group mapping if group_id changed
				if (
					data.group_id !== undefined &&
					data.group_id !== existingUser.group_id
				) {
					if (existingUser.radusergroup_id) {
						// Delete old group mapping
						await tx
							.delete(radusergroup)
							.where(eq(radusergroup.id, existingUser.radusergroup_id));
					}

					// Create new group mapping if group_id is provided
					if (data.group_id) {
						const [group] = await tx
							.select()
							.from(hotspotGroup)
							.where(eq(hotspotGroup.id, data.group_id));
						if (group) {
							const [userGroup] = await tx
								.insert(radusergroup)
								.values({
									UserName: data.username || existingUser.username,
									GroupName: group.group_name,
									priority: 1,
								})
								.returning();
							data.radusergroup_id = userGroup.id;
						}
					}
				}

				// Update hotspot user
				const [updatedUser] = await tx
					.update(hotspotUser)
					.set(data)
					.where(eq(hotspotUser.id, id))
					.returning();

				return updatedUser;
			} catch (error) {
				throw new Error(`Failed to update hotspot user: ${error.message}`);
			}
		});
	}

	static async delete(id: number) {
		return await db.transaction(async (tx) => {
			try {
				const [user] = await tx
					.select()
					.from(hotspotUser)
					.where(eq(hotspotUser.id, id));
				if (!user) {
					throw new Error("User not found");
				}

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

				return { success: true };
			} catch (error) {
				throw new Error(`Failed to delete hotspot user: ${error.message}`);
			}
		});
	}

	static async getAll(filters?: {
		status?: string;
		group_id?: number;
		profile_id?: number;
	}) {
		let whereClause = undefined;

		if (filters) {
			const conditions = [];
			if (filters.status) {
				conditions.push(eq(hotspotUser.status, filters.status));
			}
			if (filters.group_id) {
				conditions.push(eq(hotspotUser.group_id, filters.group_id));
			}
			if (filters.profile_id) {
				conditions.push(eq(hotspotUser.profile_id, filters.profile_id));
			}

			if (conditions.length > 0) {
				whereClause = and(...conditions);
			}
		}

		return await db.query.hotspotUser.findMany({
			where: whereClause,
			with: {
				profile: true,
				group: true,
				radcheck: true,
				radreply: true,
				radusergroup: true,
			},
			orderBy: desc(hotspotUser.created_at),
		});
	}

	static async getById(id: number) {
		return await db.query.hotspotUser.findFirst({
			where: eq(hotspotUser.id, id),
			with: {
				profile: true,
				group: true,
				radcheck: true,
				radreply: true,
				radusergroup: true,
				sessions: true,
				authLogs: true,
			},
		});
	}

	static async getByUsername(username: string) {
		return await db.query.hotspotUser.findFirst({
			where: eq(hotspotUser.username, username),
			with: {
				profile: true,
				group: true,
				radcheck: true,
				radreply: true,
				radusergroup: true,
			},
		});
	}

	static async updateStatus(
		id: number,
		status: "active" | "inactive" | "expired"
	) {
		return await db
			.update(hotspotUser)
			.set({ status })
			.where(eq(hotspotUser.id, id))
			.returning();
	}
}

// ========================================
// BATCH VOUCHER FUNCTIONS
// ========================================

export class HotspotBatchService {
	static async create(data: Omit<NewHotspotBatch, "id" | "created_at">) {
		return await db.transaction(async (tx) => {
			try {
				// Create batch
				const [batch] = await tx.insert(hotspotBatch).values(data).returning();
				return batch;
			} catch (error) {
				throw new Error(`Failed to create hotspot batch: ${error.message}`);
			}
		});
	}

	static async generateVouchers(batchId: number, count: number) {
		return await db.transaction(async (tx) => {
			try {
				// Get batch details
				const [batch] = await tx
					.select()
					.from(hotspotBatch)
					.where(eq(hotspotBatch.id, batchId));
				if (!batch) {
					throw new Error("Batch not found");
				}

				const generatedUsers = [];
				const characters =
					batch.characters || "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

				for (let i = 0; i < count; i++) {
					// Generate username
					let username = batch.prefix || "";
					for (let j = 0; j < (batch.length || 6); j++) {
						username += characters.charAt(
							Math.floor(Math.random() * characters.length)
						);
					}

					// Generate password
					let password = username; // Default: same as username
					if (batch.password_mode === "random") {
						password = "";
						for (let j = 0; j < (batch.length || 6); j++) {
							password += characters.charAt(
								Math.floor(Math.random() * characters.length)
							);
						}
					}

					// Check if username already exists
					const [existingUser] = await tx
						.select()
						.from(hotspotUser)
						.where(eq(hotspotUser.username, username));

					if (existingUser) {
						i--; // Retry with different username
						continue;
					}

					// Create user check entry
					const [userCheck] = await tx
						.insert(radcheck)
						.values({
							UserName: username,
							Attribute: "Cleartext-Password",
							op: "==" as const,
							Value: password,
						})
						.returning();

					// Create user reply entry
					const [userReply] = await tx
						.insert(radreply)
						.values({
							UserName: username,
							Attribute: "Service-Type",
							op: "=" as const,
							Value: "Framed-User",
						})
						.returning();

					// Create user group mapping if group_id is provided
					let radusergroup_id = null;
					if (batch.group_id) {
						const [group] = await tx
							.select()
							.from(hotspotGroup)
							.where(eq(hotspotGroup.id, batch.group_id));
						if (group) {
							const [userGroup] = await tx
								.insert(radusergroup)
								.values({
									UserName: username,
									GroupName: group.group_name,
									priority: 1,
								})
								.returning();
							radusergroup_id = userGroup.id;
						}
					}

					// Set expiration date if profile has validity_days
					let expired_at = undefined;
					if (batch.profile_id) {
						const [profile] = await tx
							.select()
							.from(hotspotProfile)
							.where(eq(hotspotProfile.id, batch.profile_id));
						if (profile && profile.validity_days) {
							expired_at = new Date();
							expired_at.setDate(expired_at.getDate() + profile.validity_days);
						}
					}

					// Create hotspot user
					const [user] = await tx
						.insert(hotspotUser)
						.values({
							username,
							password,
							profile_id: batch.profile_id,
							group_id: batch.group_id,
							status: "active",
							comment: batch.comment,
							shared_users: batch.shared_users,
							radcheck_id: userCheck.id,
							radreply_id: userReply.id,
							radusergroup_id,
							expired_at,
						})
						.returning();

					// Link user to batch
					await tx.insert(hotspotUserBatch).values({
						user_id: user.id,
						batch_id: batchId,
					});

					generatedUsers.push({
						...user,
						plain_password: password, // Include plain password for voucher printing
					});
				}

				// Update batch total_generated count
				await tx
					.update(hotspotBatch)
					.set({
						total_generated: sql`${hotspotBatch.total_generated} + ${count}`,
					})
					.where(eq(hotspotBatch.id, batchId));

				return generatedUsers;
			} catch (error) {
				throw new Error(`Failed to generate vouchers: ${error.message}`);
			}
		});
	}

	static async delete(id: number) {
		return await db.transaction(async (tx) => {
			try {
				// Get batch with users
				const batch = await tx.query.hotspotBatch.findFirst({
					where: eq(hotspotBatch.id, id),
					with: {
						users: {
							with: {
								user: true,
							},
						},
					},
				});

				if (!batch) {
					throw new Error("Batch not found");
				}

				// Delete all users in this batch
				for (const userBatch of batch.users) {
					await HotspotUserService.delete(userBatch.user.id);
				}

				// Delete batch
				await tx.delete(hotspotBatch).where(eq(hotspotBatch.id, id));

				return { success: true };
			} catch (error) {
				throw new Error(`Failed to delete batch: ${error.message}`);
			}
		});
	}

	static async getAll() {
		return await db.query.hotspotBatch.findMany({
			with: {
				profile: true,
				group: true,
			},
			orderBy: desc(hotspotBatch.created_at),
		});
	}

	static async getById(id: number) {
		return await db.query.hotspotBatch.findFirst({
			where: eq(hotspotBatch.id, id),
			with: {
				profile: true,
				group: true,
				users: {
					with: {
						user: true,
					},
				},
			},
		});
	}

	static async getBatchUsers(batchId: number) {
		const batchUsers = await db.query.hotspotUserBatch.findMany({
			where: eq(hotspotUserBatch.batch_id, batchId),
			with: {
				user: {
					with: {
						profile: true,
						group: true,
					},
				},
			},
		});

		return batchUsers.map((bu) => bu.user);
	}
}

// ========================================
// SESSION MANAGEMENT FUNCTIONS
// ========================================

export class HotspotSessionService {
	static async getActiveSessions() {
		return await db.query.hotspotSession.findMany({
			where: eq(hotspotSession.active, 1),
			with: {
				user: true,
				nas: true,
			},
			orderBy: desc(hotspotSession.startTime),
		});
	}

	static async getSessionsByUser(userId: number) {
		return await db.query.hotspotSession.findMany({
			where: eq(hotspotSession.hotspot_user_id, userId),
			with: {
				radacct: true,
				nas: true,
			},
			orderBy: desc(hotspotSession.startTime),
		});
	}

	static async disconnectSession(sessionId: number) {
		return await db
			.update(hotspotSession)
			.set({
				active: 0,
				stopTime: new Date(),
				terminateCause: "Admin-Reset",
			})
			.where(eq(hotspotSession.id, sessionId))
			.returning();
	}
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

export class HotspotUtilityService {
	static async syncWithRadius() {
		// Sync users with expired status
		const expiredUsers = await db
			.select()
			.from(hotspotUser)
			.where(
				and(
					eq(hotspotUser.status, "active"),
					sql`${hotspotUser.expired_at} < NOW()`
				)
			);

		for (const user of expiredUsers) {
			await HotspotUserService.updateStatus(user.id, "expired");
		}

		return { syncedUsers: expiredUsers.length };
	}

	static async getStatistics() {
		const [totalUsers] = await db
			.select({ count: sql<number>`count(*)` })
			.from(hotspotUser);

		const [activeUsers] = await db
			.select({ count: sql<number>`count(*)` })
			.from(hotspotUser)
			.where(eq(hotspotUser.status, "active"));

		const [expiredUsers] = await db
			.select({ count: sql<number>`count(*)` })
			.from(hotspotUser)
			.where(eq(hotspotUser.status, "expired"));

		const [activeSessions] = await db
			.select({ count: sql<number>`count(*)` })
			.from(hotspotSession)
			.where(eq(hotspotSession.active, 1));

		return {
			totalUsers: totalUsers.count,
			activeUsers: activeUsers.count,
			expiredUsers: expiredUsers.count,
			activeSessions: activeSessions.count,
		};
	}
}

// ========================================
// EXPORT ALL SERVICES
// ========================================

// export {
// 	HotspotProfileService,
// 	HotspotGroupService,
// 	HotspotUserService,
// 	HotspotBatchService,
// 	HotspotSessionService,
// 	HotspotUtilityService,
// };
