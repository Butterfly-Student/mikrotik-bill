"use client"

import { useSession } from "next-auth/react"
import type { ReactNode } from "react"

interface PermissionGuardProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const { data: session, status } = useSession()

  // Enhanced debug logging
  if (process.env.NODE_ENV === "development") {
    console.log("PermissionGuard Debug:", {
      permission,
      status,
      sessionUser: session?.user,
      userPermissions: session?.user?.permissions,
      permissionsStructure: session?.user?.permissions?.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
      })),
      hasPermission: session?.user?.permissions?.some((p) => p.name === permission),
    })
  }

  if (status === "loading") {
    return <>{fallback}</>
  }

  if (!session?.user?.permissions) {
    console.warn("No permissions found in session for user:", session?.user?.email)
    return <>{fallback}</>
  }

  const hasPermission = session.user.permissions.some((p) => p.name === permission)

  if (!hasPermission) {
    console.log(
      `Permission denied: ${permission}. Available permissions:`,
      session.user.permissions.map((p) => p.name),
    )
    return <>{fallback}</>
  }

  return <>{children}</>
}
