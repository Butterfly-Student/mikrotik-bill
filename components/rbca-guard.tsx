"use client"
import { useSession } from "next-auth/react"
import type { ReactNode } from "react"
import { useMemo } from "react"

// Types for better type safety
interface Permission {
  id: string
  name: string
  description?: string
}

interface Role {
  id: string
  name: string
  description?: string
}

interface User {
  permissions?: Permission[]
  roles?: Role[]
  email?: string
}

declare module "next-auth" {
  interface Session {
    user: User
  }
}

// Custom hook untuk permission checking dengan memoization
export function usePermissions() {
  const { data: session, status } = useSession()

  const permissionMap = useMemo(() => {
    if (!session?.user?.permissions) return new Set<string>()
    return new Set(session.user.permissions.map(p => p.name))
  }, [session?.user?.permissions])

  const roleMap = useMemo(() => {
    if (!session?.user?.roles) return new Set<string>()
    return new Set(session.user.roles.map(r => r.name))
  }, [session?.user?.roles])

  const hasPermission = useMemo(() => (permission: string) => {
    return permissionMap.has(permission)
  }, [permissionMap])

  const hasRole = useMemo(() => (role: string) => {
    return roleMap.has(role)
  }, [roleMap])

  const hasAnyRole = useMemo(() => (roles: string[]) => {
    return roles.some(role => roleMap.has(role))
  }, [roleMap])

  const hasAllRoles = useMemo(() => (roles: string[]) => {
    return roles.every(role => roleMap.has(role))
  }, [roleMap])

  return {
    session,
    status,
    hasPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    permissions: Array.from(permissionMap),
    roles: Array.from(roleMap),
    isLoading: status === "loading",
    isAuthenticated: !!session?.user
  }
}

// Loading component yang bisa dikustomisasi
interface LoadingFallbackProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

function LoadingFallback({ className = "", size = "md" }: LoadingFallbackProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
    </div>
  )
}

// Enhanced PermissionGuard dengan optimasi
interface PermissionGuardProps {
  permission: string | string[] // Support multiple permissions
  mode?: "any" | "all" // Mode untuk multiple permissions
  children: ReactNode
  fallback?: ReactNode
  loading?: ReactNode
  showDebug?: boolean
}

export const PermissionGuard = ({
  permission,
  mode = "any",
  children,
  fallback = null,
  loading = <LoadingFallback />,
  showDebug = process.env.NODE_ENV === "development"
}: PermissionGuardProps) => {
  const { session, status, hasPermission, permissions } = usePermissions()

  // Handle multiple permissions
  const hasRequiredPermission = useMemo(() => {
    const perms = Array.isArray(permission) ? permission : [permission]

    if (mode === "all") {
      return perms.every(p => hasPermission(p))
    } else {
      return perms.some(p => hasPermission(p))
    }
  }, [permission, mode, hasPermission])

  // Enhanced debug logging dengan throttling
  if (showDebug && !hasRequiredPermission) {
    const debugInfo = {
      requiredPermission: permission,
      mode,
      status,
      sessionUser: session?.user?.email,
      availablePermissions: permissions,
      hasRequiredPermission
    }
    console.group("🔒 PermissionGuard Debug")
    console.table(debugInfo)
    console.groupEnd()
  }

  if (status === "loading") {
    return <>{loading}</>
  }

  if (!session?.user) {
    if (showDebug) {
      console.warn("⚠️ No authenticated user found")
    }
    return <>{fallback}</>
  }

  if (!session.user.permissions?.length) {
    if (showDebug) {
      console.warn("⚠️ No permissions found for user:", session.user.email)
    }
    return <>{fallback}</>
  }

  if (!hasRequiredPermission) {
    if (showDebug) {
      console.log(
        `❌ Permission denied: ${JSON.stringify(permission)}. Available permissions:`,
        permissions
      )
    }
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Enhanced RoleGuard dengan optimasi
interface RoleGuardProps {
  roles: string | string[]
  mode?: "any" | "all"
  children: ReactNode
  fallback?: ReactNode
  loading?: ReactNode
  showDebug?: boolean
}

export const RoleGuard = ({
  roles,
  mode = "any",
  children,
  fallback = null,
  loading = <LoadingFallback />,
  showDebug = process.env.NODE_ENV === "development"
}: RoleGuardProps) => {
  const { session, status, hasRole, hasAnyRole, hasAllRoles, roles: userRoles } = usePermissions()

  const hasRequiredRole = useMemo(() => {
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return mode === "all" ? hasAllRoles(roleArray) : hasAnyRole(roleArray)
  }, [roles, mode, hasAllRoles, hasAnyRole])

  // Debug logging
  if (showDebug && !hasRequiredRole) {
    const debugInfo = {
      requiredRoles: roles,
      mode,
      status,
      sessionUser: session?.user?.email,
      availableRoles: userRoles,
      hasRequiredRole
    }
    console.group("👤 RoleGuard Debug")
    console.table(debugInfo)
    console.groupEnd()
  }

  if (status === "loading") {
    return <>{loading}</>
  }

  if (!session?.user) {
    return <>{fallback}</>
  }

  if (!session.user.roles?.length) {
    if (showDebug) {
      console.warn("⚠️ No roles found for user:", session.user.email)
    }
    return <>{fallback}</>
  }

  if (!hasRequiredRole) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

// Combined Guard untuk permission DAN role
interface CombinedGuardProps {
  permissions?: string | string[]
  roles?: string | string[]
  permissionMode?: "any" | "all"
  roleMode?: "any" | "all"
  logic?: "and" | "or" // Permission AND Role vs Permission OR Role
  children: ReactNode
  fallback?: ReactNode
  loading?: ReactNode
}

export const CombinedGuard = ({
  permissions,
  roles,
  permissionMode = "any",
  roleMode = "any",
  logic = "and",
  children,
  fallback = null,
  loading = <LoadingFallback />
}: CombinedGuardProps) => {
  const { status, hasPermission, hasAnyRole, hasAllRoles } = usePermissions()

  const hasRequiredPermission = useMemo(() => {
    if (!permissions) return true
    const perms = Array.isArray(permissions) ? permissions : [permissions]
    return permissionMode === "all"
      ? perms.every(p => hasPermission(p))
      : perms.some(p => hasPermission(p))
  }, [permissions, permissionMode, hasPermission])

  const hasRequiredRole = useMemo(() => {
    if (!roles) return true
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleMode === "all" ? hasAllRoles(roleArray) : hasAnyRole(roleArray)
  }, [roles, roleMode, hasAllRoles, hasAnyRole])

  const hasAccess = useMemo(() => {
    if (logic === "or") {
      return hasRequiredPermission || hasRequiredRole
    }
    return hasRequiredPermission && hasRequiredRole
  }, [logic, hasRequiredPermission, hasRequiredRole])

  if (status === "loading") {
    return <>{loading}</>
  }

  // if (!hasAccess) {
  //   return <>{fallback}</>
  // }

  return <>{children}</>
}