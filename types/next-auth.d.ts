declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      username: string
      image?: string | null
      roles: Role[]
      permissions: Permission[]
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    username: string
    image?: string | null
    roles?: Role[]
    permissions?: Permission[]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
  }
}

export interface User {
  id: number
  email: string
  username: string
  password: string
  name: string | null
  image: string | null
  email_verified: Date | null
  created_at: Date
  updated_at: Date
}

export interface Role {
  id: number
  name: string
  description: string | null
  created_at: Date
}

export interface Permission {
  id: number
  name: string
  description: string | null
  resource: string
  action: string
  created_at: Date
}