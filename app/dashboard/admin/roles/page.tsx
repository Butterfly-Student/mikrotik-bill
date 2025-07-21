"use client"

import { useState, useEffect } from "react"
import { FilterableTable } from "@/components/reausable/table"
import { ReusableDialog } from "@/components/reausable/dialog"
import { ReusableForm } from "@/components/reausable/form"
import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Role {
  id: number
  name: string
  description: string | null
  createdAt: string
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/roles')
        if (!response.ok) throw new Error('Failed to fetch roles')
        const data = await response.json()
        setRoles(data)
      } catch (error) {
        console.error('Error fetching roles:', error)
        toast.error("Error",{
          description: "Failed to load roles",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [])

  const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { key: "createdAt", label: "Created At", sortable: true },
  ]

  const formFields = [
    { name: "name", label: "Name", type: "text" as const, required: true },
    { name: "description", label: "Description", type: "textarea" as const, required: true },
  ]

  const handleAdd = () => {
    setEditingRole(null)
    setDialogOpen(true)
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    setDialogOpen(true)
  }

  const handleDelete = async (role: Role) => {
    if (confirm(`Are you sure you want to delete ${role.name}?`)) {
      try {
        const response = await fetch(`/api/admin/roles/${role.id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete role')

        setRoles(roles.filter((r) => r.id !== role.id))
        toast("Role deleted successfully")
      } catch (error) {
        console.error('Error deleting role:', error)
        toast("Failed to delete role")
      }
    }
  }

  const handleBulkDelete = async (selectedRoles: Role[]) => {
    if (selectedRoles.length === 0) return

    if (confirm(`Are you sure you want to delete ${selectedRoles.length} roles?`)) {
      try {
        console.log(selectedRoles.map((data) => data))
        const deletePromises = selectedRoles.map(roleId =>
          fetch(`/api/admin/roles/${roleId.id}`, { method: 'DELETE' })
        )

        const responses = await Promise.all(deletePromises)
        const failed = responses.filter(r => !r.ok)

        if (failed.length > 0) {
          throw new Error(`Failed to delete ${failed.length} roles`)
        }

        const selectedIds = selectedRoles.map(u => u.id)
        setRoles(prev => prev.filter(role => !selectedIds.includes(role.id)))
        setSelectedRoles(new Set())
        toast(`${selectedRoles.length} roles deleted successfully`)
      } catch (error) {
        console.error('Error bulk deleting roles:', error)
        toast("Failed to delete some roles")
      }
    }
  }

  const handleSubmit = async (data: any) => {
    try {
      if (editingRole) {
        const response = await fetch(`/api/admin/roles/${editingRole.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error('Failed to update role')

        const updatedRole = await response.json()
        setRoles(roles.map((r) => (r.id === editingRole.id ? updatedRole : r)))
        toast("Role updated successfully")
      } else {
        const response = await fetch('/api/admin/roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        if (!response.ok) throw new Error('Failed to create role')

        const newRole = await response.json()
        setRoles([...roles, newRole])
        toast("Role created successfully")
      }

      setDialogOpen(false)
      setEditingRole(null)
    } catch (error) {
      console.error('Error submitting role:', error)
      toast("Something went wrong")
    }
  }

  const actions = [
    {
      label: "Edit",
      icon: Pencil,
      onClick: handleEdit,
      permission: "roles.write",
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: handleDelete,
      permission: "roles.delete",
      variant: "destructive" as const,
    },
  ]

  const bulkActions = [
    {
      label: "Delete Selected",
      icon: Trash2,
      onClick: handleBulkDelete,
      permission: "roles.delete",
      variant: "destructive" as const,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">Manage user roles and their permissions</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      <FilterableTable
        data={roles}
        columns={columns}
        loading={loading}
        enableBulkSelect
        handleBulkDelete={handleBulkDelete}
        selectedItems={selectedRoles}
        onSelectedItemsChange={setSelectedRoles}
        onAdd={handleAdd}
        actions={actions}
        permissions={{
          read: "roles.view",
          write: "roles.write",
          delete: "roles.delete",
        }}
      />

      <ReusableDialog
        trigger={<span style={{ display: 'none' }} />}
        title={editingRole ? "Edit Role" : "Add Role"}
        description={editingRole ? "Update role information" : "Create a new role"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        showFooter={false}
        permissions={{
          read: "roles.view",
          write: editingRole ? "roles.write" : "roles.write",
        }}
      >
        <ReusableForm
          fields={formFields}
          onSubmit={handleSubmit}
          className="outline-none border-none"
          initialData={editingRole || {}}
          submitText={editingRole ? "Update" : "Create"}
          permissions={{
            write: editingRole ? "roles.write" : "roles.write",
          }}
        />
      </ReusableDialog>

    </div>
  )
}
