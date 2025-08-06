"use client"

import { useState, useEffect, useMemo } from "react"
import { FilterableTable } from "@/components/mikrotik/reausable/table"
import { ReusableDialog } from "@/components/mikrotik/reausable/dialog"
import { ReusableForm } from "@/components/mikrotik/reausable/form"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  username: string
  password: string
  role: string
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([])
  const { toast } = useToast()

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/admin/roles")
      const json = await res.json()
      const options = json.map((role: any) => ({
        value: role.name,
        label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
      }))
      setRoleOptions(options)
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch roles", variant: "destructive" })
    }
  }

  console.log(selectedUsers)
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      const json = await res.json()
      setUsers(json || [])
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])


  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "username", label: "Username", sortable: true },
    { key: "role", label: "Role", sortable: true },
    { key: "createdAt", label: "Created At", sortable: true },
  ]

  const formFields = useMemo(() => [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "email", label: "Email", type: "email" as const, required: true },
    { name: "username", label: "Username", type: "text" as const, required: true },
    { name: "password", label: "Password", type: "password" as const, required: true },
    {
      name: "role",
      label: "Role",
      type: "select" as const,
      required: true,
      options: roleOptions,
    },
  ], [roleOptions])

  const mapToFormUser = (user: any): User => ({
    id: String(user.id),
    name: user.name,
    email: user.email,
    username: user.username,
    password: user.password,
    role: user.userRoles?.[0]?.role?.name ?? "",
    createdAt: user.createdAt,
  })


  const handleAdd = () => {
    setEditingUser(null)
    setDialogOpen(true)
  }

  const handleEdit = (user: any) => {
    const mappedUser = mapToFormUser(user)
    setEditingUser(mappedUser)
    setDialogOpen(true)
  }


  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return
    try {
      await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" })
      toast({ title: "Success", description: "User deleted successfully" })
      fetchUsers()
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" })
    }
  }

  const handleBulkDelete = (selectedUsers: User[]) => {
    console.log("Bulk delete users:", selectedUsers.map(u => u.name))
    const selectedIds = selectedUsers.map(u => u.id)
    setUsers(prev => prev.filter(user => !selectedIds.includes(user.id)))
    setSelectedUsers(new Set())
  }

  const handleSubmit = async (data: any) => {
    try {
      if (editingUser) {
        await fetch(`/api/admin/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        toast({ title: "Success", description: "User updated successfully" })
      } else {
        await fetch(`/api/admin/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        toast({ title: "Success", description: "User created successfully" })
      }
      setDialogOpen(false)
      setEditingUser(null)
    } catch (err) {
      toast({ title: "Error", description: "Failed to submit form", variant: "destructive" })
    }
  }

  const actions = [
    {
      label: "Edit",
      icon: Pencil,
      onClick: handleEdit,
      permission: "users.write",
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: handleDelete,
      permission: "users.delete",
      variant: "destructive" as const,
    },
  ]

  const bulkActions = [
    {
      label: "Delete Selected",
      icon: Trash2,
      onClick: handleBulkDelete,
      permission: "users.delete",
      variant: "destructive" as const,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <FilterableTable
        data={users}
        columns={columns}
        loading={loading}
        actions={actions}
        onAdd={handleAdd}
        onRefresh={fetchUsers}
        enableBulkSelect
        handleBulkDelete={handleBulkDelete}
        selectedItems={selectedUsers}
        onSelectedItemsChange={setSelectedUsers}
        permissions={{
          read: "users.view",
          write: "users.write",
          delete: "users.delete",
        }}
        rowIdField="id"
        entityName="user"
      />

      <ReusableDialog
        title={editingUser ? "Edit User" : "Add User"}
        description={editingUser ? "Update user information" : "Create a new user"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        showFooter={false}
        permissions={{
          read: "users.view",
          write: editingUser ? "users.update" : "users.create",
        }}
      >
        <ReusableForm
          fields={formFields}
          onSubmit={handleSubmit}
          initialData={editingUser || {}}
          submitText={editingUser ? "Update" : "Create"}
          permissions={{
            write: editingUser ? "users.write" : "users.write",
          }}
        />
      </ReusableDialog>
    </div>
  )
}
