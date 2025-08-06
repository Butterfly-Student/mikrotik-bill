"use client"

import { useState, useEffect } from "react"
import { FilterableTable, type TableColumn } from "@/components/mikrotik/reausable/table"
import { ReusableDialog } from "@/components/mikrotik/reausable/dialog"
import { ReusableForm, type FormField } from "@/components/mikrotik/reausable/form"
import { StatsCard } from "@/components/mikrotik/reausable/stats-card"
import { Wifi, DollarSign, Clock, Users } from "lucide-react"
import { toast } from "sonner"

interface HotspotProfile {
  id: number
  profile_name: string
  price: number
  sell_price: number
  validity_days: number
  session_limit: number | null
  upload_limit: number | null
  download_limit: number | null
  rate_limit: string | null
  mikrotik_profile: string | null
  radgroupcheck_id: number | null
  radgroupreply_id: number | null
  nas_id: number | null
  created_at: string
}


export default function HotspotProfilesPage() {
  const [profiles, setProfiles] = useState<HotspotProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<HotspotProfile | null>(null)

  // Fetch data
  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/mikrotik/radius/hotspot/profiles")
      if (response.ok) {
        const data = await response.json()
        setProfiles(data.data)
      }
    } catch (error) {
      console.error("Error fetching profiles:", error)
      toast.error("Gagal memuat data profil hotspot")
    } finally {
      setLoading(false)
    }
  }


  // Format file size
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-"
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Table columns
  const columns: TableColumn<HotspotProfile>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      className: "w-16",
    },
    {
      key: "profile_name",
      label: "Nama Profil",
      sortable: true,
      hideable: false,
    },
    {
      key: "price",
      label: "Harga Modal",
      sortable: true,
      render: (value) => formatCurrency(value),
    },
    {
      key: "sell_price",
      label: "Harga Jual",
      sortable: true,
      render: (value) => formatCurrency(value),
    },
    {
      key: "validity_days",
      label: "Masa Berlaku",
      sortable: true,
      render: (value) => `${value} hari`,
    },
    {
      key: "session_limit",
      label: "Batas Sesi",
      render: (value) => value ? `${value} sesi` : "Unlimited",
    },
    {
      key: "rate_limit",
      label: "Rate Limit",
      render: (value) => value || "-",
    },
    {
      key: "upload_limit",
      label: "Upload Limit",
      render: (value) => formatFileSize(value),
    },
    {
      key: "download_limit",
      label: "Download Limit",
      render: (value) => formatFileSize(value),
    },
    {
      key: "mikrotik_profile",
      label: "Profil Mikrotik",
      render: (value) => value || "-",
    },
    {
      key: "created_at",
      label: "Dibuat",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString("id-ID"),
    },
  ]

  // Form fields
  const formFields: FormField[] = [
    {
      name: "profile_name",
      label: "Nama Profil",
      type: "text",
      required: true,
      placeholder: "Masukkan nama profil",
    },
    {
      name: "price",
      label: "Harga Modal (IDR)",
      type: "number",
      required: true,
      placeholder: "0",
    },
    {
      name: "sell_price",
      label: "Harga Jual (IDR)",
      type: "number",
      required: true,
      placeholder: "0",
    },
    {
      name: "validity_days",
      label: "Masa Berlaku (Hari)",
      type: "number",
      required: true,
      placeholder: "30",
    },
    {
      name: "session_limit",
      label: "Batas Sesi",
      type: "number",
      placeholder: "Kosongkan untuk unlimited",
    },
    {
      name: "upload_limit",
      label: "Upload Limit (Bytes)",
      type: "number",
      placeholder: "Kosongkan untuk unlimited",
    },
    {
      name: "download_limit",
      label: "Download Limit (Bytes)",
      type: "number",
      placeholder: "Kosongkan untuk unlimited",
    },
    {
      name: "rate_limit",
      label: "Rate Limit",
      type: "text",
      placeholder: "Contoh: 1M/2M atau 512k/1M",
    },
    {
      name: "mikrotik_profile",
      label: "Profil Mikrotik",
      type: "text",
      placeholder: "Nama profil di Mikrotik",
    },
  ]

  // Action handlers
  const handleAdd = () => {
    setEditingProfile(null)
    setDialogOpen(true)
  }

  const handleEdit = (profile: HotspotProfile) => {
    setEditingProfile(profile)
    setDialogOpen(true)
  }

  const handleDelete = async (profile: HotspotProfile) => {
    try {
      const response = await fetch(`/api/hotspot/profiles/${profile.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Profil berhasil dihapus")
        fetchProfiles()
      } else {
        const error = await response.json()
        toast.error(error.message || "Gagal menghapus profil")
      }
    } catch (error) {
      console.error("Error deleting profile:", error)
      toast.error("Gagal menghapus profil")
    }
  }

  const handleBulkDelete = async (selectedProfiles: HotspotProfile[]) => {
    try {
      const deletePromises = selectedProfiles.map((profile) =>
        fetch(`/api/hotspot/profiles/${profile.id}`, { method: "DELETE" })
      )

      await Promise.all(deletePromises)
      toast.success(`${selectedProfiles.length} profil berhasil dihapus`)
      fetchProfiles()
    } catch (error) {
      console.error("Error bulk deleting profiles:", error)
      toast.error("Gagal menghapus profil")
    }
  }

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      const url = editingProfile
        ? `/api/hotspot/profiles/${editingProfile.id}`
        : "/api/mikrotik/radius/hotspot/profiles"
      const method = editingProfile ? "PUT" : "POST"

      // Convert string values to appropriate types
      const submitData = {
        ...data,
        price: parseInt(data.price) || 0,
        sell_price: parseInt(data.sell_price) || 0,
        validity_days: parseInt(data.validity_days),
        session_limit: data.session_limit ? parseInt(data.session_limit) : null,
        upload_limit: data.upload_limit ? parseInt(data.upload_limit) : null,
        download_limit: data.download_limit ? parseInt(data.download_limit) : null,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        toast.success(
          editingProfile ? "Profil berhasil diperbarui" : "Profil berhasil ditambahkan"
        )
        setDialogOpen(false)
        fetchProfiles()
      } else {
        const error = await response.json()
        toast.error(error.message || "Gagal menyimpan profil")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Gagal menyimpan profil")
    }
  }

  // Get initial form data for editing
  const getInitialData = () => {
    if (!editingProfile) return {}

    return {
      profile_name: editingProfile.profile_name,
      price: editingProfile.price.toString(),
      sell_price: editingProfile.sell_price.toString(),
      validity_days: editingProfile.validity_days.toString(),
      session_limit: editingProfile.session_limit?.toString() || "",
      upload_limit: editingProfile.upload_limit?.toString() || "",
      download_limit: editingProfile.download_limit?.toString() || "",
      rate_limit: editingProfile.rate_limit || "",
      mikrotik_profile: editingProfile.mikrotik_profile || "",
    }
  }
  console.log(profiles)
  // Stats
  const totalProfiles = profiles.length
  const totalRevenue = profiles.reduce((sum, profile) => sum + (profile.sell_price - profile.price), 0)
  const averageValidity = profiles.length > 0
    ? Math.round(profiles.reduce((sum, profile) => sum + profile.validity_days, 0) / profiles.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profil Hotspot</h1>
        <p className="text-muted-foreground">
          Kelola profil hotspot dan kebijakan akses pengguna
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Profil"
          value={totalProfiles}
          description="Profil hotspot terdaftar"
          icon={Wifi}
        />
        <StatsCard
          title="Total Keuntungan"
          value={formatCurrency(totalRevenue)}
          description="Dari semua profil"
          icon={DollarSign}
        />
        <StatsCard
          title="Rata-rata Masa Berlaku"
          value={`${averageValidity} hari`}
          description="Masa berlaku profil"
          icon={Clock}
        />
        <StatsCard
          title="Profil Aktif"
          value={profiles.filter(p => p.mikrotik_profile).length}
          description="Terhubung dengan Mikrotik"
          icon={Users}
        />
      </div>

      {/* Profiles Table */}
      <FilterableTable
        data={profiles}
        columns={columns}
        title="Daftar Profil Hotspot"
        loading={loading}
        searchPlaceholder="Cari profil..."
        emptyMessage="Belum ada profil hotspot"
        entityName="profil"
        enableBulkSelect={true}
        permissions={{
          view: "hotspot.read",
          write: "hotspot.read",
          delete: "hotspot.read",
        }}
        actions={{
          onAdd: handleAdd,
          onEdit: handleEdit,
          onDelete: handleDelete,
        }}
        filters={[
          {
            key: "validity_days",
            label: "Masa Berlaku",
            options: [
              { label: "1 Hari", value: "1" },
              { label: "7 Hari", value: "7" },
              { label: "30 Hari", value: "30" },
              { label: "90 Hari", value: "90" },
            ],
          },
        ]}
        onRefresh={fetchProfiles}
      />

      {/* Add/Edit Dialog */}
      <ReusableDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingProfile ? "Edit Profil Hotspot" : "Tambah Profil Hotspot"}
        description={
          editingProfile
            ? "Perbarui informasi profil hotspot"
            : "Buat profil hotspot baru untuk pengguna"
        }
      >
        <ReusableForm
          fields={formFields}
          onSubmit={handleSubmit}
          initialData={getInitialData()}
          submitLabel={editingProfile ? "Perbarui" : "Tambah"}
          cancelLabel="Batal"
          onCancel={() => setDialogOpen(false)}
        />
      </ReusableDialog>
    </div>
  )
}