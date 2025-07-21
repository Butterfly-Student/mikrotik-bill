"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"
import { PermissionGuard } from "@/components/rbca-guard"
import { RoleGuard } from "@/components/rbca-guard"
import { Users, FolderOpen, Settings, BarChart3, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const user = session.user
  const userRoles = user.roles?.map((r) => r.name) || []
  const userPermissions = user.permissions?.map((p) => p.name) || []

  console.log("User", userPermissions)

  return (

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* Welcome Section */}
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back, {user.name}!</CardTitle>
                <CardDescription>Here's what's happening with your account today.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <div className="text-sm text-muted-foreground">Roles:</div>
                  {userRoles.length > 0 ? (
                    userRoles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">No roles assigned</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Grid */}
          <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PermissionGuard permission="projects.view">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Projects</CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+2 from last month</p>
                </CardContent>
              </Card>
            </PermissionGuard>

            <PermissionGuard permission="users.read">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">+1 from last week</p>
                </CardContent>
              </Card>
            </PermissionGuard>

            <PermissionGuard permission="analytics.view">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Analytics</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
            </PermissionGuard>

            <PermissionGuard permission="settings.view">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Settings</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Active</div>
                  <p className="text-xs text-muted-foreground">All systems operational</p>
                </CardContent>
              </Card>
            </PermissionGuard>
          </div>

          {/* Admin Section */}
          <RoleGuard roles={["admin", "manager"]}>
            <Card>
              <CardHeader>
                <CardTitle>Admin Panel</CardTitle>
                <CardDescription>Administrative functions and system management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  You have administrative access to manage users, roles, and system settings.
                </div>
              </CardContent>
            </Card>
          </RoleGuard>

          {/* Permissions Debug (only for development) */}
          <Card>
            <CardHeader>
              <CardTitle>Debug: Your Permissions</CardTitle>
              <CardDescription>This section shows your current permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <strong>Roles:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userRoles.length > 0 ? (
                      userRoles.map((role) => (
                        <Badge key={role} variant="outline">
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">No roles</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <strong>Permissions:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {userPermissions.length > 0 ? (
                      userPermissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline">No permissions</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="min-h-[50vh] flex-1 rounded-xl bg-muted/50 p-4">
            <div className="text-center text-muted-foreground">
              <h3 className="text-lg font-semibold mb-2">Dashboard Content</h3>
              <p>This is where your main dashboard content would go.</p>
            </div>
          </div>
        </div>

 
  )
}
