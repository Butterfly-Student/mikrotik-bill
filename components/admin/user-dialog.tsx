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
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"

interface Role {
  id: number
  name: string
  description: string | null
}

interface User {
  id: number
  email: string
  username: string
  name: string | null
  userRoles: Array<{
    role: {
      id: number
      name: string
    }
  }>
}

interface UserDialogProps {
  open: boolean
  onClose: (refresh?: boolean) => void
  user?: User | null
}

export function UserDialog({ open, onClose, user }: UserDialogProps) {
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    roleIds: [] as number[],
  })

  useEffect(() => {
    if (open) {
      fetchRoles()
      if (user) {
        setFormData({
          name: user.name || "",
          email: user.email,
          username: user.username,
          password: "",
          roleIds: user.userRoles.map((ur) => ur.role.id),
        })
      } else {
        setFormData({
          name: "",
          email: "",
          username: "",
          password: "",
          roleIds: [],
        })
      }
    }
  }, [open, user])

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/admin/roles")
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error("Failed to fetch roles:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = user ? `/api/admin/users/${user.id}` : "/api/admin/users"
      const method = user ? "PUT" : "POST"

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
        alert(error.error || "Failed to save user")
      }
    } catch (error) {
      console.error("Failed to save user:", error)
      alert("Failed to save user")
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = (roleId: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      roleIds: checked ? [...prev.roleIds, roleId] : prev.roleIds.filter((id) => id !== roleId),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {user ? "Update user information and roles" : "Create a new user account"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password {user && "(leave empty to keep current)"}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!user}
              />
            </div>
            <div className="grid gap-2">
              <Label>Roles</Label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={formData.roleIds.includes(role.id)}
                      onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                    />
                    <Label htmlFor={`role-${role.id}`} className="text-sm">
                      {role.name}
                      {role.description && <span className="text-muted-foreground ml-1">- {role.description}</span>}
                    </Label>
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
              {user ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
