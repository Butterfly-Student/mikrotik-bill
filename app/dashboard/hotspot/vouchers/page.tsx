"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye, Wifi, Clock, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ReusableDialog } from "@/components/reausable/dialog"
import { ReusableForm, type FormField } from "@/components/reausable/form"
import { StatsCard } from "@/components/reausable/stats-card"
import { FilterableTable, type TableColumn } from "@/components/reausable/table"
import { json } from "stream/consumers"

interface Voucher {
  id: number
  name: string
  password: string
  profile: string
  status: "unused" | "used" | "expired"
  created_at: string
  expires_at?: string
  batch_name?: string
}

interface Profile {
  id: number
  name: string
}

export default function HotspotVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchVouchers()
    fetchProfiles()
  }, [])

  const fetchVouchers = async () => {
    try {
      const res = await fetch("/api/mikrotik/hotspot/vouchers")
      if (res.ok) {
        const data = await res.json()
        setVouchers(data.vouchers || [])
      }
    } catch (error) {
      console.error("Failed to fetch vouchers:", error)
      toast({
        title: "Error",
        description: "Failed to fetch vouchers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProfiles = async () => {
    try {
      const res = await fetch("/api/mikrotik/hotspot/profiles")
      if (res.ok) {
        const data = await res.json()
        setProfiles(data.profiles || [])
      }
    } catch (error) {
      console.error("Failed to fetch profiles:", error)
    }
  }

  // Form fields for voucher
  const voucherFormFields: FormField[] = [
    {
      name: "name",
      label: "Name",
      type: "text",
      required: true,
      placeholder: "Enter name",
      description: "Unique name for the voucher",
    },
    {
      name: "password",
      label: "Password",
      type: "text",
      required: true,
      placeholder: "Enter password",
      description: "Password for voucher access",
    },
    {
      name: "profile_id",
      label: "Profile",
      type: "select",
      required: true,
      options: profiles.map((profile) => ({
        label: profile.name,
        value: profile.id.toString(),
      })),
      description: "Select hotspot profile",
    },
    {
      name: "validity_days",
      label: "Validity (Days)",
      type: "number",
      required: true,
      placeholder: "30",
      description: "Number of days the voucher is valid",
    },
    {
      name: "batch_name",
      label: "Batch Name",
      type: "text",
      placeholder: "Optional batch name",
      description: "Group vouchers by batch name",
    },
  ]

  // Table columns
  const tableColumns: TableColumn<Voucher>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      hideable: false,
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "password",
      label: "Password",
      sortable: true,
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "profile",
      label: "Profile",
      sortable: true,
      filterable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      render: (value) => {
        const variants = {
          unused: { variant: "default" as const, label: "Unused", className: "bg-blue-100 text-blue-800" },
          used: { variant: "default" as const, label: "Used", className: "bg-green-100 text-green-800" },
          expired: { variant: "destructive" as const, label: "Expired", className: "" },
        }
        const config = variants[value as keyof typeof variants] || {
          variant: "outline" as const,
          label: value,
          className: "",
        }

        return (
          <Badge variant={config.variant} className={config.className}>
            {config.label}
          </Badge>
        )
      },
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString("id-ID"),
    },
    {
      key: "expires_at",
      label: "Expires",
      sortable: true,
      render: (value) => (value ? new Date(value).toLocaleDateString("id-ID") : "-"),
    },
    {
      key: "actions",
      label: "Actions",
      hideable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleViewVoucher(row)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleEditVoucher(row)
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteVoucher(row.id)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  // Table filters
  const tableFilters = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Unused", value: "unused" },
        { label: "Used", value: "used" },
        { label: "Expired", value: "expired" },
      ],
    },
    {
      key: "profile",
      label: "Profile",
      options: profiles.map((profile) => ({
        label: profile.name,
        value: profile.name,
      })),
    },
  ]

  const handleAddVoucher = async (data: any) => {
    try {
      const res = await fetch("/api/mikrotik/hotspot/vouchers", {
        method: "POST",
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast({
          title: "Berhasil",
          description: "Voucher berhasil dibuat",
        })
        setIsAddDialogOpen(false)
        fetchVouchers()
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal membuat voucher",
        variant: "destructive",
      })
    }
  }

  const handleEditVoucher = (voucher: Voucher) => {
    setEditingVoucher(voucher)
    setIsEditDialogOpen(true)
  }

  const handleUpdateVoucher = async (data: any) => {
    if (!editingVoucher) return

    try {
      const res = await fetch(`/api/mikrotik/hotspot/vouchers/${editingVoucher.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        toast({
          title: "Berhasil",
          description: "Voucher berhasil diperbarui",
        })
        setIsEditDialogOpen(false)
        setEditingVoucher(null)
        fetchVouchers()
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui voucher",
        variant: "destructive",
      })
    }
  }

  const handleDeleteVoucher = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus voucher ini?")) return

    try {
      const res = await fetch(`/api/mikrotik/hotspot/vouchers/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Berhasil",
          description: "Voucher berhasil dihapus",
        })
        fetchVouchers()
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus voucher",
        variant: "destructive",
      })
    }
  }

  const handleViewVoucher = (voucher: Voucher) => {
    toast({
      title: "Voucher Details",
      description: `Name: ${voucher.name}, Status: ${voucher.status}`,
    })
  }

  const handleRowClick = (row: Voucher) => {
    console.log("Voucher clicked:", row)
  }

  const handleExport = () => {
    // Create CSV content
    const headers = ["Name", "Password", "Profile", "Status", "Created", "Expires"]
    const csvContent = [
      headers.join(","),
      ...vouchers.map((voucher) =>
        [
          voucher.name,
          voucher.password,
          voucher.profile,
          voucher.status,
          new Date(voucher.created_at).toLocaleDateString(),
          voucher.expires_at ? new Date(voucher.expires_at).toLocaleDateString() : "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `vouchers-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Berhasil",
      description: "Data voucher berhasil diekspor",
    })
  }

  const handleRefresh = () => {
    fetchVouchers()
    toast({
      title: "Refresh",
      description: "Data voucher berhasil diperbarui",
    })
  }

  // Calculate stats
  const totalVouchers = vouchers.length
  const unusedVouchers = vouchers.filter((v) => v.status === "unused").length
  const usedVouchers = vouchers.filter((v) => v.status === "used").length
  const expiredVouchers = vouchers.filter((v) => v.status === "expired").length

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat data voucher...</p>
        </div>
      </div>
    )
  }

  console.log(editingVoucher)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hotspot Vouchers</h1>
          <p className="text-muted-foreground">Kelola voucher dan kode akses hotspot</p>
        </div>

        <ReusableDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Voucher
            </Button>
          }
          title="Tambah Voucher Baru"
          description="Buat voucher hotspot baru untuk pengguna"
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          size="md"
        >
          <ReusableForm fields={voucherFormFields} onSubmit={handleAddVoucher} submitText="Buat Voucher" />
        </ReusableDialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total Vouchers"
          value={totalVouchers}
          description="Total voucher yang dibuat"
          icon={Wifi}
          variant="default"
        />
        <StatsCard
          title="Belum Digunakan"
          value={unusedVouchers}
          description="Voucher yang belum digunakan"
          icon={Clock}
          variant="default"
          className="border-blue-200 bg-blue-50"
        />
        <StatsCard
          title="Sudah Digunakan"
          value={usedVouchers}
          description="Voucher yang sudah digunakan"
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Kadaluarsa"
          value={expiredVouchers}
          description="Voucher yang sudah kadaluarsa"
          icon={XCircle}
          variant="danger"
        />
      </div>

      {/* Vouchers Table */}
      <FilterableTable
        title={`Daftar Voucher (${vouchers.length})`}
        data={vouchers}
        columns={tableColumns}
        filters={tableFilters}
        onRowClick={handleRowClick}
        onExport={handleExport}
        onRefresh={handleRefresh}
        loading={loading}
        searchPlaceholder="Cari berdasarkan name atau batch..."
        emptyMessage="Tidak ada voucher ditemukan"
        pageSize={10}
      />

      {/* Edit Dialog */}
      <ReusableDialog
        trigger={<div />} // Hidden trigger since we control it programmatically
        title="Edit Voucher"
        description="Perbarui informasi voucher"
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        size="md"
      >
        <ReusableForm
          fields={voucherFormFields}
          onSubmit={handleUpdateVoucher}
          submitText="Perbarui Voucher"
          initialData={
            editingVoucher
              ? {
                name: editingVoucher.name,
                password: editingVoucher.password,
                profile: editingVoucher.profile, // You'll need to map this from profile
                validity_days: "30", // Default or calculate from expires_at
                batch_name: editingVoucher.batch_name || "",
              }
              : {}
          }
        />
      </ReusableDialog>
    </div>
  )
}
