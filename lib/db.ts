// import bcrypt from "bcryptjs"

// if (!process.env.DATABASE_URL) {
//   throw new Error("DATABASE_URL is not set")
// }

// export const sql = neon(process.env.DATABASE_URL)

// export interface User {
//   id: number
//   email: string
//   username: string
//   password: string
//   name: string | null
//   image: string | null
//   email_verified: Date | null
//   created_at: Date
//   updated_at: Date
// }

// export interface Role {
//   id: number
//   name: string
//   description: string | null
//   created_at: Date
// }

// export interface Permission {
//   id: number
//   name: string
//   description: string | null
//   resource: string
//   action: string
//   created_at: Date
// }

// export interface Project {
//   id: number
//   name: string
//   description: string | null
//   icon: string
//   url: string | null
//   owner_id: number
//   created_at: Date
//   updated_at: Date
// }

// export interface UserWithRoles extends Omit<User, "password"> {
//   roles: Role[]
//   permissions: Permission[]
// }

// // Database helper functions
// export async function getUserById(id: number): Promise<UserWithRoles | null> {
//   const users = await sql`
//     SELECT 
//       u.id, u.email, u.username, u.name, u.image, u.email_verified, u.created_at, u.updated_at,
//       COALESCE(
//         JSON_AGG(
//           DISTINCT jsonb_build_object(
//             'id', r.id,
//             'name', r.name,
//             'description', r.description,
//             'created_at', r.created_at
//           )
//         ) FILTER (WHERE r.id IS NOT NULL), 
//         '[]'
//       ) as roles,
//       COALESCE(
//         JSON_AGG(
//           DISTINCT jsonb_build_object(
//             'id', p.id,
//             'name', p.name,
//             'description', p.description,
//             'resource', p.resource,
//             'action', p.action,
//             'created_at', p.created_at
//           )
//         ) FILTER (WHERE p.id IS NOT NULL), 
//         '[]'
//       ) as permissions
//     FROM users u
//     LEFT JOIN user_roles ur ON u.id = ur.user_id
//     LEFT JOIN roles r ON ur.role_id = r.id
//     LEFT JOIN role_permissions rp ON r.id = rp.role_id
//     LEFT JOIN permissions p ON rp.permission_id = p.id
//     WHERE u.id = ${id}
//     GROUP BY u.id, u.email, u.username, u.name, u.image, u.email_verified, u.created_at, u.updated_at
//   `

//   return users[0] || null
// }

// export async function getUserByEmail(email: string): Promise<UserWithRoles | null> {
//   const users = await sql`
//     SELECT 
//       u.id, u.email, u.username, u.name, u.image, u.email_verified, u.created_at, u.updated_at,
//       COALESCE(
//         JSON_AGG(
//           DISTINCT jsonb_build_object(
//             'id', r.id,
//             'name', r.name,
//             'description', r.description,
//             'created_at', r.created_at
//           )
//         ) FILTER (WHERE r.id IS NOT NULL), 
//         '[]'
//       ) as roles,
//       COALESCE(
//         JSON_AGG(
//           DISTINCT jsonb_build_object(
//             'id', p.id,
//             'name', p.name,
//             'description', p.description,
//             'resource', p.resource,
//             'action', p.action,
//             'created_at', p.created_at
//           )
//         ) FILTER (WHERE p.id IS NOT NULL), 
//         '[]'
//       ) as permissions
//     FROM users u
//     LEFT JOIN user_roles ur ON u.id = ur.user_id
//     LEFT JOIN roles r ON ur.role_id = r.id
//     LEFT JOIN role_permissions rp ON r.id = rp.role_id
//     LEFT JOIN permissions p ON rp.permission_id = p.id
//     WHERE u.email = ${email}
//     GROUP BY u.id, u.email, u.username, u.name, u.image, u.email_verified, u.created_at, u.updated_at
//   `

//   return users[0] || null
// }

// export async function getUserByUsername(username: string): Promise<User | null> {
//   const users = await sql`SELECT * FROM users WHERE username = ${username}`
//   return users[0] || null
// }

// export async function createUser(email: string, username: string, password: string, name: string): Promise<User> {
//   const hashedPassword = await bcrypt.hash(password, 10)

//   const users = await sql`
//     INSERT INTO users (email, username, password, name)
//     VALUES (${email}, ${username}, ${hashedPassword}, ${name})
//     RETURNING *
//   `

//   const newUser = users[0]

//   // Assign default user role
//   await assignRoleToUser(newUser.id, "user")

//   return newUser
// }

// export async function assignRoleToUser(userId: number, roleName: string) {
//   await sql`
//     INSERT INTO user_roles (user_id, role_id)
//     SELECT ${userId}, r.id
//     FROM roles r
//     WHERE r.name = ${roleName}
//     ON CONFLICT (user_id, role_id) DO NOTHING
//   `
// }

// export async function getUserProjects(userId: number): Promise<Project[]> {
//   return await sql`
//     SELECT * FROM projects 
//     WHERE owner_id = ${userId}
//     ORDER BY created_at DESC
//   `
// }

// export async function createProject(
//   name: string,
//   description: string | null,
//   ownerId: number,
//   icon = "Folder",
// ): Promise<Project> {
//   const projects = await sql`
//     INSERT INTO projects (name, description, owner_id, icon, url)
//     VALUES (${name}, ${description}, ${ownerId}, ${icon}, '#')
//     RETURNING *
//   `
//   return projects[0]
// }

// export async function hasPermission(userId: number, permission: string): Promise<boolean> {
//   const result = await sql`
//     SELECT 1
//     FROM users u
//     JOIN user_roles ur ON u.id = ur.user_id
//     JOIN roles r ON ur.role_id = r.id
//     JOIN role_permissions rp ON r.id = rp.role_id
//     JOIN permissions p ON rp.permission_id = p.id
//     WHERE u.id = ${userId} AND p.name = ${permission}
//     LIMIT 1
//   `
//   return result.length > 0
// }
