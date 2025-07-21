"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"

interface Permission {
  id: number
  name: string
  description: string | null
  resource: string
  action: string
}

interface Role {
  id: number
  name: string
  description: string | null
  rolePermissions: Array<{
    permission: {
      id: number
      name: string
    }
  }>
}

interface RoleDialogProps {
  open: boolean
  onClose: (refresh?: boolean) => void
  role?: Role | null
}

export function RoleDialog({ open, onClose, role }: RoleDialogProps) {
  const [loading, setLoading] = useState(false)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissionIds: [] as number[],
  })

  useEffect(() => {
    if (open) {
      fetchPermissions()
      if (role) {
        setFormData({
          name: role.name,
          description: role.description || "",
          permissionIds: role.rolePermissions.map((rp) => rp.permission.id),
        })
      } else {
        setFormData({
          name: "",
          description: "",
          permissionIds: [],
        })
      }
    }
  }, [open, role])

  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/admin/permissions")
      if (response.ok) {
        const data = await response.json()
        setPermissions(data)
      }
    } catch (error) {
      console.error("Failed to fetch permissions:", error)
    }
  }

  console.log(permissions)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = role ? `/api/admin/roles/${role.id}` : "/api/admin/roles"
      const method = role ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onClose(true)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to save role")
      }
    } catch (error) {
      console.error("Failed to save role:", error)
      alert("Failed to save role")
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionChange = (permissionId: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: checked
        ? [...prev.permissionIds, permissionId]
        : prev.permissionIds.filter((id) => id !== permissionId),
    }))
  }

  // Group permissions by resource
  const groupedPermissions = permissions.reduce(
    (acc, permission) => {
      const resourceName = permission.resource.name
      if (!acc[resourceName]) {
        acc[resourceName] = []
      }
      acc[resourceName].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Create Role"}</DialogTitle>
          <DialogDescription>
            {role ? "Update role information and permissions" : "Create a new role with specific permissions"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Role Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label>Permissions</Label>
              <div className="space-y-4 max-h-60 overflow-y-auto border rounded-md p-3">
                {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                  <div key={resource} className="space-y-2">
                    <h4 className="font-medium text-sm capitalize">{resource}</h4>
                    <div className="grid grid-cols-1 gap-2 ml-4">
                      {resourcePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={formData.permissionIds.includes(permission.id)}
                            onCheckedChange={(checked) => handlePermissionChange(permission.id, checked as boolean)}
                          />
                          <Label htmlFor={`permission-${permission.id}`} className="text-sm">
                            {permission.name}
                            {permission.description && (
                              <span className="text-muted-foreground ml-1">- {permission.description}</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose()}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {role ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
