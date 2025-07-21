import { eq, and, isNull, desc, asc, sql, count, sum } from "drizzle-orm";
import {
	radacct,
	radcheck,
	radgroupcheck,
	radgroupreply,
	radreply,
	radusergroup,

} from "@/database/schema/mikrotik";
import * as schema from "@/database/schema/mikrotik";
import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "@/lib/db/index";
import { NewPppoeGroup, NewPppoeProfile, NewPppoeUser, pppoeGroup, PppoeGroup, pppoeProfile, PppoeProfile, pppoeUser, PppoeUser } from "../schema/mikrotik/pppoe";

// ========================================
// PPPOE PROFILE FUNCTIONS
// ========================================

export class PppoeProfileService {
	private db = drizzle(pool, { schema });

	// Create profile with FreeRADIUS integration
	async createProfile(profileData: NewPppoeProfile): Promise<PppoeProfile> {
		return await this.db.transaction(async (tx) => {
			// Create radgroupcheck entries
			const radGroupCheckEntries = [
				{
					GroupName: profileData.profile_name,
					Attribute: "Simultaneous-Use",
					op: "==",
					Value: profileData.simultaneous_use?.toString() || "1",
				},
				...(profileData.session_timeout ? [{
					GroupName: profileData.profile_name,
					Attribute: "Session-Timeout",
					op: "==",
					Value: profileData.session_timeout.toString(),
				}] : []),
				...(profileData.idle_timeout ? [{
					GroupName: profileData.profile_name,
					Attribute: "Idle-Timeout",
					op: "==",
					Value: profileData.idle_timeout.toString(),
				}] : []),
			];

			const [radGroupCheck] = await tx
				.insert(radgroupcheck)
				.values(radGroupCheckEntries)
				.returning();

			// Create radgroupreply entries
			const radGroupReplyEntries = [
				{
					GroupName: profileData.profile_name,
					Attribute: "Framed-Protocol",
					op: "=",
					Value: "PPP",
				},
				{
					GroupName: profileData.profile_name,
					Attribute: "Service-Type",
					op: "=",
					Value: "Framed-User",
				},
				...(profileData.download_speed && profileData.upload_speed ? [{
					GroupName: profileData.profile_name,
					Attribute: "Mikrotik-Rate-Limit",
					op: "=",
					Value: `${profileData.upload_speed}k/${profileData.download_speed}k`,
				}] : []),
				...(profileData.pool_name ? [{
					GroupName: profileData.profile_name,
					Attribute: "Framed-Pool",
					op: "=",
					Value: profileData.pool_name,
				}] : []),
				...(profileData.dns_primary ? [{
					GroupName: profileData.profile_name,
					Attribute: "Framed-DNS-Primary-Server",
					op: "=",
					Value: profileData.dns_primary,
				}] : []),
				...(profileData.dns_secondary ? [{
					GroupName: profileData.profile_name,
					Attribute: "Framed-DNS-Secondary-Server",
					op: "=",
					Value: profileData.dns_secondary,
				}] : []),
			];

			const [radGroupReply] = await tx
				.insert(radgroupreply)
				.values(radGroupReplyEntries)
				.returning();

			// Create pppoe profile
			const [profile] = await tx
				.insert(pppoeProfile)
				.values({
					...profileData,
					radgroupcheck_id: radGroupCheck.id,
					radgroupreply_id: radGroupReply.id,
				})
				.returning();

			return profile;
		});
	}

	// Get all profiles
	async getProfiles(): Promise<PppoeProfile[]> {
		return await this.db
			.select()
			.from(pppoeProfile)
			.orderBy(asc(pppoeProfile.id));
	}

	// Get profile by ID
	async getProfileById(id: number): Promise<PppoeProfile | null> {
		const [profile] = await this.db
			.select()
			.from(pppoeProfile)
			.where(eq(pppoeProfile.id, id));
		return profile || null;
	}

	// Update profile with FreeRADIUS sync
	async updateProfile(
		id: number,
		updateData: Partial<NewPppoeProfile>
	): Promise<PppoeProfile> {
		return await this.db.transaction(async (tx) => {
			const [existingProfile] = await tx
				.select()
				.from(pppoeProfile)
				.where(eq(pppoeProfile.id, id));
			if (!existingProfile) throw new Error("Profile not found");

			// Update radgroupcheck entries
			await tx
				.delete(radgroupcheck)
				.where(eq(radgroupcheck.GroupName, existingProfile.profile_name));

			const radGroupCheckEntries = [
				{
					GroupName: updateData.profile_name || existingProfile.profile_name,
					Attribute: "Simultaneous-Use",
					op: "==",
					Value: updateData.simultaneous_use?.toString() || existingProfile.simultaneous_use?.toString() || "1",
				},
				...((updateData.session_timeout || existingProfile.session_timeout) ? [{
					GroupName: updateData.profile_name || existingProfile.profile_name,
					Attribute: "Session-Timeout",
					op: "==",
					Value: (updateData.session_timeout || existingProfile.session_timeout)?.toString(),
				}] : []),
				...((updateData.idle_timeout || existingProfile.idle_timeout) ? [{
					GroupName: updateData.profile_name || existingProfile.profile_name,
					Attribute: "Idle-Timeout",
					op: "==",
					Value: (updateData.idle_timeout || existingProfile.idle_timeout)?.toString(),
				}] : []),
			];

			await tx.insert(radgroupcheck).values(radGroupCheckEntries);

			// Update radgroupreply entries
			await tx
				.delete(radgroupreply)
				.where(eq(radgroupreply.GroupName, existingProfile.profile_name));

			const radGroupReplyEntries = [
				{
					GroupName: updateData.profile_name || existingProfile.profile_name,
					Attribute: "Framed-Protocol",
					op: "=",
					Value: "PPP",
				},
				{
					GroupName: updateData.profile_name || existingProfile.profile_name,
					Attribute: "Service-Type",
					op: "=",
					Value: "Framed-User",
				},
				...((updateData.download_speed || existingProfile.download_speed) &&
				(updateData.upload_speed || existingProfile.upload_speed)
					? [
							{
								GroupName:
									updateData.profile_name || existingProfile.profile_name,
								Attribute: "Mikrotik-Rate-Limit",
								op: "=",
								Value: `${
									updateData.upload_speed || existingProfile.upload_speed
								}k/${
									updateData.download_speed || existingProfile.download_speed
								}k`,
							},
					  ]
					: []),
				...(updateData.pool_name || existingProfile.pool_name
					? [
							{
								GroupName:
									updateData.profile_name || existingProfile.profile_name,
								Attribute: "Framed-Pool",
								op: "=",
								Value: (updateData.pool_name || existingProfile.pool_name) ?? undefined,
							},
					  ]
					: []),
				...(updateData.dns_primary || existingProfile.dns_primary
					? [
							{
								GroupName:
									updateData.profile_name || existingProfile.profile_name,
								Attribute: "Framed-DNS-Primary-Server",
								op: "=",
								Value: (updateData.dns_primary || existingProfile.dns_primary) ?? undefined,
							},
					  ]
					: []),
				...(updateData.dns_secondary || existingProfile.dns_secondary
					? [
							{
								GroupName:
									updateData.profile_name || existingProfile.profile_name,
								Attribute: "Framed-DNS-Secondary-Server",
								op: "=",
								Value:
									(updateData.dns_secondary || existingProfile.dns_secondary) ??
									undefined,
							},
					  ]
					: []),
			];

			await tx.insert(radgroupreply).values(radGroupReplyEntries);

			// Update pppoe profile
			const [updatedProfile] = await tx
				.update(pppoeProfile)
				.set(updateData)
				.where(eq(pppoeProfile.id, id))
				.returning();

			return updatedProfile;
		});
	}

	// Delete profile with FreeRADIUS cleanup
	async deleteProfile(id: number): Promise<void> {
		await this.db.transaction(async (tx) => {
			const [profile] = await tx
				.select()
				.from(pppoeProfile)
				.where(eq(pppoeProfile.id, id));
			if (!profile) throw new Error("Profile not found");

			// Delete related FreeRADIUS entries
			await tx
				.delete(radgroupcheck)
				.where(eq(radgroupcheck.GroupName, profile.profile_name));

			await tx
				.delete(radgroupreply)
				.where(eq(radgroupreply.GroupName, profile.profile_name));

			// Delete profile
			await tx.delete(pppoeProfile).where(eq(pppoeProfile.id, id));
		});
	}
}

// ========================================
// PPPOE GROUP FUNCTIONS
// ========================================

export class PppoeGroupService {
	private db = drizzle(pool, { schema });

	async createGroup(groupData: NewPppoeGroup): Promise<PppoeGroup> {
		return await this.db.transaction(async (tx) => {
			// Create radgroupreply entries from profile if exists
			let radgroupreply_id: number | null = null;
			if (groupData.id) {
				const [profile] = await tx
					.select()
					.from(pppoeProfile)
					.where(eq(pppoeProfile.id, groupData.id));
				
				if (profile) {
					// Copy attributes from profile to group
					const radGroupReplyEntries = [
						{
							GroupName: groupData.group_name,
							Attribute: "Framed-Protocol",
							op: "=",
							Value: "PPP",
						},
						{
							GroupName: groupData.group_name,
							Attribute: "Service-Type",
							op: "=",
							Value: "Framed-User",
						},
						...(profile.download_speed && profile.upload_speed ? [{
							GroupName: groupData.group_name,
							Attribute: "Mikrotik-Rate-Limit",
							op: "=",
							Value: `${profile.upload_speed}k/${profile.download_speed}k`,
						}] : []),
						...(profile.pool_name ? [{
							GroupName: groupData.group_name,
							Attribute: "Framed-Pool",
							op: "=",
							Value: profile.pool_name,
						}] : []),
					];

					const [radGroupReply] = await tx
						.insert(radgroupreply)
						.values(radGroupReplyEntries)
						.returning();
					radgroupreply_id = radGroupReply.id;
				}
			}

			const [group] = await tx
				.insert(pppoeGroup)
				.values({
					...groupData,
					radgroupcheck_id: null,
					radgroupreply_id,
				})
				.returning();

			return group;
		});
	}

	async getGroups(): Promise<PppoeGroup[]> {
		return await this.db
			.select()
			.from(pppoeGroup)
			.orderBy(asc(pppoeGroup.id));
	}

	async getGroupById(id: number): Promise<PppoeGroup | null> {
		const [group] = await this.db
			.select()
			.from(pppoeGroup)
			.where(eq(pppoeGroup.id, id));
		return group || null;
	}

	async updateGroup(
		id: number,
		updateData: Partial<NewPppoeGroup>
	): Promise<PppoeGroup> {
		const [updatedGroup] = await this.db
			.update(pppoeGroup)
			.set(updateData)
			.where(eq(pppoeGroup.id, id))
			.returning();

		return updatedGroup;
	}

	async deleteGroup(id: number): Promise<void> {
		await this.db.transaction(async (tx) => {
			const [group] = await tx
				.select()
				.from(pppoeGroup)
				.where(eq(pppoeGroup.id, id));
			if (!group) throw new Error("Group not found");

			// Delete related FreeRADIUS entries
			await tx
				.delete(radgroupreply)
				.where(eq(radgroupreply.GroupName, group.group_name));

			await tx.delete(pppoeGroup).where(eq(pppoeGroup.id, id));
		});
	}
}

// ========================================
// PPPOE USER FUNCTIONS
// ========================================

export class PppoeUserService {
	private db = drizzle(pool, { schema });

	// Create user with full FreeRADIUS integration
	async createUser(userData: NewPppoeUser): Promise<PppoeUser> {
		return await this.db.transaction(async (tx) => {
			// Create radcheck entries
			const radCheckEntries = [
				{
					UserName: userData.username,
					Attribute: "Cleartext-Password",
					op: ":=",
					Value: userData.password,
				},
				...(userData.static_ip ? [{
					UserName: userData.username,
					Attribute: "Framed-IP-Address",
					op: ":=",
					Value: userData.static_ip,
				}] : []),
				...(userData.mac_address ? [{
					UserName: userData.username,
					Attribute: "Calling-Station-Id",
					op: "==",
					Value: userData.mac_address,
				}] : []),
			];

			const [radCheck] = await tx
				.insert(radcheck)
				.values(radCheckEntries)
				.returning();

			// Create radreply entries
			const radReplyEntries = [
				{
					UserName: userData.username,
					Attribute: "Service-Type",
					op: "=",
					Value: "Framed-User",
				},
				{
					UserName: userData.username,
					Attribute: "Framed-Protocol",
					op: "=",
					Value: "PPP",
				},
			];

			// Add profile-specific attributes if no group is assigned
			if (userData.profile_id && !userData.group_id) {
				const [profile] = await tx
					.select()
					.from(pppoeProfile)
					.where(eq(pppoeProfile.id, userData.profile_id));
				
				if (profile && profile.download_speed && profile.upload_speed) {
					radReplyEntries.push({
						UserName: userData.username,
						Attribute: "Mikrotik-Rate-Limit",
						op: "=",
						Value: `${profile.upload_speed}k/${profile.download_speed}k`,
					});
				}
			}

			const [radReply] = await tx
				.insert(radreply)
				.values(radReplyEntries)
				.returning();

			// Create radusergroup entry
			let radusergroup_id: number | null = null;
			if (userData.group_id) {
				const [group] = await tx
					.select()
					.from(pppoeGroup)
					.where(eq(pppoeGroup.id, userData.group_id));
				if (group) {
					const [radUserGroup] = await tx
						.insert(radusergroup)
						.values({
							UserName: userData.username,
							GroupName: group.group_name,
							priority: 1,
						})
						.returning();
					radusergroup_id = radUserGroup.id;
				}
			} else if (userData.profile_id) {
				const [profile] = await tx
					.select()
					.from(pppoeProfile)
					.where(eq(pppoeProfile.id, userData.profile_id));
				if (profile) {
					const [radUserGroup] = await tx
						.insert(radusergroup)
						.values({
							UserName: userData.username,
							GroupName: profile.profile_name,
							priority: 1,
						})
						.returning();
					radusergroup_id = radUserGroup.id;
				}
			}


			// Create pppoe user
			const [user] = await tx
				.insert(pppoeUser)
				.values({
					...userData,
					radcheck_id: radCheck.id,
					radreply_id: radReply.id,
					radusergroup_id,
				})
				.returning();

			return user;
		});
	}

	async getUsers(
		limit: number = 100,
		offset: number = 0
	): Promise<PppoeUser[]> {
		return await this.db
			.select()
			.from(pppoeUser)
			.limit(limit)
			.offset(offset)
			.orderBy(desc(pppoeUser.created_at));
	}

	async getUserById(id: number): Promise<PppoeUser | null> {
		const [user] = await this.db
			.select()
			.from(pppoeUser)
			.where(eq(pppoeUser.id, id));
		return user || null;
	}

	async getUserByUsername(username: string): Promise<PppoeUser | null> {
		const [user] = await this.db
			.select()
			.from(pppoeUser)
			.where(eq(pppoeUser.username, username));
		return user || null;
	}

	async updateUser(
		id: number,
		updateData: Partial<NewPppoeUser>
	): Promise<PppoeUser> {
		return await this.db.transaction(async (tx) => {
			const [existingUser] = await tx
				.select()
				.from(pppoeUser)
				.where(eq(pppoeUser.id, id));
			if (!existingUser) throw new Error("User not found");

			// Update radcheck entries
			if (updateData.password && existingUser.radcheck_id) {
				await tx
					.update(radcheck)
					.set({ Value: updateData.password })
					.where(and(
						eq(radcheck.UserName, existingUser.username),
						eq(radcheck.Attribute, "Cleartext-Password")
					));
			}

			// Update username in FreeRADIUS tables if username changed
			if (updateData.username && updateData.username !== existingUser.username) {
				await tx
					.update(radcheck)
					.set({ UserName: updateData.username })
					.where(eq(radcheck.UserName, existingUser.username));

				await tx
					.update(radreply)
					.set({ UserName: updateData.username })
					.where(eq(radreply.UserName, existingUser.username));

				await tx
					.update(radusergroup)
					.set({ UserName: updateData.username })
					.where(eq(radusergroup.UserName, existingUser.username));
			}

			// Update pppoe user
			const [updatedUser] = await tx
				.update(pppoeUser)
				.set(updateData)
				.where(eq(pppoeUser.id, id))
				.returning();

			return updatedUser;
		});
	}

	async deleteUser(id: number): Promise<void> {
		await this.db.transaction(async (tx) => {
			const [user] = await tx
				.select()
				.from(pppoeUser)
				.where(eq(pppoeUser.id, id));
			if (!user) throw new Error("User not found");

			// Delete related FreeRADIUS entries
			await tx.delete(radcheck).where(eq(radcheck.UserName, user.username));
			await tx.delete(radreply).where(eq(radreply.UserName, user.username));
			await tx.delete(radusergroup).where(eq(radusergroup.UserName, user.username));

			// Delete user
			await tx.delete(pppoeUser).where(eq(pppoeUser.id, id));
		});
	}

	// Get active users
	async getActiveUsers(): Promise<PppoeUser[]> {
		return await this.db
			.select()
			.from(pppoeUser)
			.where(eq(pppoeUser.status, "active"))
			.orderBy(desc(pppoeUser.created_at));
	}

}
