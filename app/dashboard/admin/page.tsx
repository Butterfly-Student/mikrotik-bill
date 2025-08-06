"use client"

import { useState, useEffect } from "react"
import { FilterableTable, type TableColumn } from "@/components/mikrotik/reausable/table"
import { ReusableDialog } from "@/components/mikrotik/reausable/dialog"
import { ReusableForm, type FormField } from "@/components/mikrotik/reausable/form"
import { StatsCard } from "@/components/mikrotik/reausable/stats-card"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Shield, Activity } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: number
  email: string
  username: string
  name: string | null
  createdAt: string
  roles: Array<{
    id: number
    name: string
  }>
}

interface Role {
  id: number
  name: string
  description: string | null
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  // Fetch data
  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Gagal memuat data pengguna")
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await fetch("/api/admin/roles")
      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
    }
  }

  // Table columns
  const columns: TableColumn<User>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      className: "w-16",
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      hideable: false,
    },
    {
      key: "username",
      label: "Username",
      sortable: true,
    },
    {
      key: "name",
      label: "Nama",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      key: "roles",
      label: "Roles",
      render: (roles: User["roles"]) => (
        <div className="flex gap-1 flex-wrap">
          {roles.map((role) => (
            <Badge key={role.id} variant="secondary">
              {role.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Dibuat",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString("id-ID"),
    },
  ]

  // Form fields
  const formFields: FormField[] = [
    {
      name: "email",
      label: "Email",
      type: "email",
      required: true,
      placeholder: "user@example.com",
    },
    {
      name: "username",
      label: "Username",
      type: "text",
      required: true,
      placeholder: "username",
    },
    {
      name: "name",
      label: "Nama Lengkap",
      type: "text",
      placeholder: "Nama lengkap pengguna",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      required: !editingUser,
      placeholder: editingUser ? "Kosongkan jika tidak ingin mengubah" : "Password",
    },
    {
      name: "roleIds",
      label: "Roles",
      type: "multiselect",
      required: true,
      options: roles.map((role) => ({
        label: role.name,
        value: role.id.toString(),
      })),
    },
  ]

  // Action handlers
  const handleAdd = () => {
    setEditingUser(null)
    setDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setDialogOpen(true)
  }

  const handleDelete = async (user: User) => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Pengguna berhasil dihapus")
        fetchUsers()
      } else {
        toast.error("Gagal menghapus pengguna")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Gagal menghapus pengguna")
    }
  }

  const handleBulkDelete = async (selectedUsers: User[]) => {
    try {
      const deletePromises = selectedUsers.map((user) => fetch(`/api/admin/users/${user.id}`, { method: "DELETE" }))

      await Promise.all(deletePromises)
      toast.success(`${selectedUsers.length} pengguna berhasil dihapus`)
      fetchUsers()
    } catch (error) {
      console.error("Error bulk deleting users:", error)
      toast.error("Gagal menghapus pengguna")
    }
  }

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users"
      const method = editingUser ? "PUT" : "POST"

      // Convert roleIds to numbers
      const submitData = {
        ...data,
        roleIds: data.roleIds?.map((id: string) => Number.parseInt(id)) || [],
      }

      // Remove password if empty for edit
      if (editingUser && !submitData.password) {
        delete submitData.password
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        toast.success(editingUser ? "Pengguna berhasil diperbarui" : "Pengguna berhasil ditambahkan")
        setDialogOpen(false)
        fetchUsers()
      } else {
        const error = await response.json()
        toast.error(error.message || "Gagal menyimpan pengguna")
      }
    } catch (error) {
      console.error("Error saving user:", error)
      toast.error("Gagal menyimpan pengguna")
    }
  }

  // Get initial form data for editing
  const getInitialData = () => {
    if (!editingUser) return {}

    return {
      email: editingUser.email,
      username: editingUser.username,
      name: editingUser.name || "",
      roleIds: editingUser.roles.map((role) => role.id.toString()),
    }
  }

  // Stats
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.roles.length > 0).length
  const adminUsers = users.filter((user) => user.roles.some((role) => role.name === "admin")).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">Kelola pengguna dan peran mereka dalam sistem</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Pengguna" value={totalUsers} description="Semua pengguna terdaftar" icon={Users} />
        <StatsCard
          title="Pengguna Aktif"
          value={activeUsers}
          description="Pengguna dengan role"
          icon={Activity}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard title="Administrator" value={adminUsers} description="Pengguna dengan akses admin" icon={Shield} />
        <StatsCard
          title="Pengguna Baru"
          value={5}
          description="Minggu ini"
          icon={UserPlus}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Users Table */}
      <FilterableTable
        data={users}
        columns={columns}
        title="Daftar Pengguna"
        loading={loading}
        searchPlaceholder="Cari pengguna..."
        emptyMessage="Belum ada pengguna terdaftar"
        entityName="pengguna"
        enableBulkSelect={true}
        permissions={{
          read: "users.view",
          write: "users.write",
          delete: "users.delete",
        }}
        actions={{
          onAdd: handleAdd,
          onEdit: handleEdit,
          onDelete: handleDelete,
          onBulkDelete: handleBulkDelete,
        }}
        actionLabels={{
          add: "Tambah Pengguna",
          edit: "Edit Pengguna",
          delete: "Hapus Pengguna",
          bulkDelete: "Hapus Pengguna Terpilih",
        }}
        filters={[
          {
            key: "roles",
            label: "Role",
            options: roles.map((role) => ({
              label: role.name,
              value: role.name,
            })),
          },
        ]}
        onRefresh={fetchUsers}
      />

      {/* Add/Edit Dialog */}
      <ReusableDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingUser ? "Edit Pengguna" : "Tambah Pengguna"}
        description={editingUser ? "Perbarui informasi pengguna" : "Tambahkan pengguna baru ke sistem"}
      >
        <ReusableForm
          fields={formFields}
          onSubmit={handleSubmit}
          initialData={getInitialData()}
          submitLabel={editingUser ? "Perbarui" : "Tambah"}
          cancelLabel="Batal"
          onCancel={() => setDialogOpen(false)}
        />
      </ReusableDialog>
    </div>
  )
}
