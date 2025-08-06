// Note: This version replaces PermissionDialog with ReusableDialog + ReusableForm

"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PermissionGuard } from "@/components/rbca-guard"
import { ReusableDialog } from "@/components/mikrotik/reausable/dialog"
import { ReusableForm, type FormField } from "@/components/mikrotik/reausable/form"

interface Permission {
  id: number
  name: string
  description: string | null
  createdAt: string
  resource: {
    id: number
    name: string
    description: string | null
  }
  action: {
    id: number
    name: string
    description: string | null
  }
}

export default function PermissionsPage() {
  const { data: session } = useSession()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/admin/permissions")
      if (response.ok) {
        const data = await response.json()
        setPermissions(data)
      } else {
        console.error("Failed to fetch permissions:", response.status, response.statusText)
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      const method = editingPermission ? "PUT" : "POST"
      const url = editingPermission
        ? `/api/admin/permissions/${editingPermission.id}`
        : "/api/admin/permissions"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to save permission")

      await fetchPermissions()
      setDialogOpen(false)
      setEditingPermission(null)
    } catch (error) {
      alert("Error saving permission")
      console.error(error)
    }
  }

  const handleDeletePermission = async (permissionId: number) => {
    if (confirm("Are you sure you want to delete this permission?")) {
      try {
        const response = await fetch(`/api/admin/permissions/${permissionId}`, { method: "DELETE" })
        if (!response.ok) throw new Error("Failed to delete permission")
        fetchPermissions()
      } catch (error) {
        alert("Failed to delete permission")
        console.error(error)
      }
    }
  }

  const formFields: FormField[] = [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
  ]

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const resourceName = permission.resource.name
    if (!acc[resourceName]) acc[resourceName] = []
    acc[resourceName].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Permission Management</CardTitle>
            <CardDescription>View and manage system permissions</CardDescription>
          </div>
          <PermissionGuard permission="permissions.write">
            <Button onClick={() => {
              setEditingPermission(null)
              setDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" /> Add Permission
            </Button>
          </PermissionGuard>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading permissions...</div>
          ) : permissions.length === 0 ? (
            <div className="text-center py-4">No permissions found</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([resource, list]) => (
                <div key={resource} className="space-y-3">
                  <h3 className="text-lg font-semibold capitalize">{resource} Permissions</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Permission</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell className="font-medium">{permission.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{permission.action.name}</Badge>
                          </TableCell>
                          <TableCell>{permission.description || "-"}</TableCell>
                          <TableCell>{new Date(permission.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <PermissionGuard permission="permissions.write">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingPermission(permission)
                                    setDialogOpen(true)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </PermissionGuard>
                              <PermissionGuard permission="permissions.delete">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeletePermission(permission.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </PermissionGuard>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ReusableDialog
        title={editingPermission ? "Edit Permission" : "Add Permission"}
        description="Fill in the permission details"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        showFooter={false}
        permissions={{
          read: "permissions.view",
          write: editingPermission ? "permissions.write" : "permissions.write",
        }}
        trigger={<span style={{ display: 'none' }} />}
      >
        <ReusableForm
          title="Permission Form"
          fields={formFields}
          initialData={editingPermission || {}}
          onSubmit={handleSubmit}
          submitText={editingPermission ? "Update" : "Create"}
          permissions={{ write: editingPermission ? "permissions.write" : "permissions.write" }}
        />
      </ReusableDialog>
    </div>
  )
}
