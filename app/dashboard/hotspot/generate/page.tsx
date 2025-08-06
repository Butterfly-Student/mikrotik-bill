"use client"

import { useState, useEffect } from "react"
import { ActionItem, FilterableTable, type TableColumn } from "@/components/mikrotik/reausable/table"
import { ReusableDialog } from "@/components/mikrotik/reausable/dialog"
import { ReusableForm, type FormField } from "@/components/mikrotik/reausable/form"
import { StatsCard } from "@/components/mikrotik/reausable/stats-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Plus, Download, FileText, Printer, Zap, Eye, Users, Clock, List, Package, Edit, Trash2, PrinterIcon } from "lucide-react"
import { toast } from "sonner"
import { useMikrotikSwitcher } from "@/hooks/use-mikrotik-switcher"

interface Profile {
  id: number
  profile_name: string
  validity_days: number
  price: number
  sell_price: number
  type: string
  is_active: boolean
}

interface Router {
  id: number
  name: string
  ip_address: string
  is_active: boolean
}

interface VoucherBatch {
  id: number
  router_id: number
  profile_id: number | null
  batch_name: string
  generation_config: any
  total_generated: number
  comment: string | null
  status: string
  is_active: boolean
  created_at: string
  created_by: number | null
  // Generation config properties
  length?: number
  prefix?: string | null
  characters?: string
  password_mode?: string
  // Relations
  profile?: Profile
  profile_name?: string
}

interface Voucher {
  id: number
  username: string
  password: string
  profile: string
  validity: string
  used: boolean
  status: string
  created_at: string
}

export default function GenerateVoucherPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [batches, setBatches] = useState<VoucherBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<VoucherBatch | null>(null)
  const [showTemplate, setShowTemplate] = useState(false)
  const [templateVouchers, setTemplateVouchers] = useState<Voucher[]>([])
  const { routers } = useMikrotikSwitcher()

  // Fetch data
  useEffect(() => {
    fetchProfiles()
    fetchBatches()
  }, [])

  console.log("GenerateVoucherPage rendered", batches)

  const fetchProfiles = async () => {
    try {
      const response = await fetch("/api/mikrotik/hotspot/profiles")
      if (response.ok) {
        const data = await response.json()
        setProfiles(data.data)
      }
    } catch (error) {
      console.error("Error fetching profiles:", error)
      toast.error("Gagal memuat data profil")
    }
  }


  const fetchBatches = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/mikrotik/hotspot/batches")
      if (response.ok) {
        const data = await response.json()
        console.log("Fetching batches from API", data)

        setBatches(data.data)
      }
    } catch (error) {
      console.error("Error fetching batches:", error)
      toast.error("Gagal memuat data batch")
    } finally {
      setLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Generate print HTML content
  const generatePrintHTML = (vouchers: Voucher[], batchName: string) => {
    const printStyles = `
      <style>
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
          }
          .print-header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .voucher-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5mm;
            page-break-inside: avoid;
          }
          .voucher-card {
            border: 2px solid #000;
            padding: 8px;
            text-align: center;
            page-break-inside: avoid;
            background: white;
          }
          .voucher-title {
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 5px;
          }
          .voucher-index {
            font-size: 10px;
            color: #666;
            margin-bottom: 5px;
          }
          .voucher-label {
            font-size: 10px;
            margin-bottom: 3px;
          }
          .voucher-code {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 5px;
            letter-spacing: 1px;
          }
          .voucher-details {
            font-size: 9px;
            color: #333;
          }
          .no-print {
            display: none !important;
          }
        }
        @media screen {
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          .voucher-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
          }
          .voucher-card {
            border: 2px solid #000;
            padding: 15px;
            text-align: center;
            background: white;
          }
          .voucher-title {
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 8px;
          }
          .voucher-index {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
          }
          .voucher-label {
            font-size: 12px;
            margin-bottom: 5px;
          }
          .voucher-code {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 8px;
            letter-spacing: 1px;
          }
          .voucher-details {
            font-size: 11px;
            color: #333;
          }
          .control-buttons {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
          }
          .control-buttons button {
            margin-left: 10px;
            padding: 10px 20px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
          }
          .control-buttons button:hover {
            background: #0056b3;
          }
        }
      </style>
    `

    const voucherCards = vouchers.map((voucher, index) => `
      <div class="voucher-card">
        <div class="voucher-title">HOTSPOT VOUCHER</div>
        <div class="voucher-index">[${index + 1}]</div>
        <div class="voucher-label">Username</div>
        <div class="voucher-code">${voucher.username}</div>
        <div class="voucher-label">Password</div>
        <div class="voucher-code">${voucher.password}</div>
        <div class="voucher-details">
          ${voucher.validity} - ${voucher.profile}
        </div>
      </div>
    `).join('')

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Voucher Print - ${batchName}</title>
          ${printStyles}
        </head>
        <body>
          <div class="control-buttons no-print">
            <button onclick="window.print()">Print</button>
            <button onclick="window.close()">Close</button>
          </div>
          
          <div class="print-header">
            <h1>HOTSPOT VOUCHERS</h1>
            <h2>Batch: ${batchName}</h2>
            <p>Total Vouchers: ${vouchers.length}</p>
            <p>Generated on: ${new Date().toLocaleString('id-ID')}</p>
          </div>
          
          <div class="voucher-grid">
            ${voucherCards}
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `
  }

  // Handle print function
  const handlePrint = async (batch: VoucherBatch) => {
    try {
      toast.info("Memuat voucher untuk print...")

      const response = await fetch(`/api/mikrotik/hotspot/batches/${batch.id}/vouchers`)
      if (response.ok) {
        const vouchersData = await response.json()
        const vouchers = vouchersData.data

        const printHTML = generatePrintHTML(vouchers, batch.batch_name)
        const printWindow = window.open('', '_blank')

        if (printWindow) {
          printWindow.document.write(printHTML)
          printWindow.document.close()
          printWindow.focus()
          toast.success("Halaman print telah dibuka di tab baru")
        } else {
          toast.error("Gagal membuka tab baru. Pastikan popup blocker tidak aktif.")
        }
      } else {
        throw new Error('Failed to load vouchers for printing')
      }
    } catch (error) {
      console.error('Error preparing print:', error)
      toast.error("Gagal mempersiapkan print: " + (error as Error).message)
    }
  }

  // Table columns
  const columns: TableColumn<VoucherBatch>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      className: "w-16",
    },
    {
      key: "batch_name",
      label: "Nama Batch",
      sortable: true,
      hideable: false,
    },
    {
      key: "profile_name",
      label: "Profil",
      render: (_, batch) => batch.profile_name || "-",
    },
    {
      key: "total_generated",
      label: "Total Generated",
      sortable: true,
      render: (value) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: "length",
      label: "Panjang",
      render: (_, batch) => `${batch.generation_config.length || 6} karakter`,
    },
    {
      key: "prefix",
      label: "Prefix",
      render: (_, batch) => batch.generation_config.prefix || "-",
    },
    {
      key: "password_mode",
      label: "Mode Password",
      render: (_, batch) => (
        <Badge variant={batch.generation_config.password_mode === "same_as_username" ? "default" : "secondary"}>
          {batch.generation_config.password_mode === "same_as_username" ? "Same as Username" : "Random"}
        </Badge>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (value) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
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
      name: "router_id",
      label: "Router",
      type: "select",
      required: true,
      options: routers.map(r => ({ value: r.id.toString(), label: `${r.name} (${r.ip_address})` })),
    },
    {
      name: "batch_name",
      label: "Nama Batch",
      type: "text",
      required: true,
      placeholder: "Masukkan nama batch",
    },
    {
      name: "profile_id",
      label: "Profil (Opsional)",
      type: "select",
      options: profiles.map(p => ({ value: p.id.toString(), label: p.profile_name })),
    },
    {
      name: "total_generated",
      label: "Jumlah Generate",
      type: "number",
      required: true,
      placeholder: "10",
      min: 1,
      max: 10000,
    },
    {
      name: "length",
      label: "Panjang Username",
      type: "select",
      required: true,
      options: [
        { value: "4", label: "4 karakter" },
        { value: "6", label: "6 karakter" },
        { value: "8", label: "8 karakter" },
        { value: "10", label: "10 karakter" },
        { value: "12", label: "12 karakter" },
      ],
    },
    {
      name: "prefix",
      label: "Prefix",
      type: "text",
      placeholder: "FH",
    },
    {
      name: "characters",
      label: "Karakter yang Digunakan",
      type: "text",
      placeholder: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
      defaultValue: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
    },
    {
      name: "password_mode",
      label: "Mode Password",
      type: "select",
      required: true,
      options: [
        { value: "same_as_username", label: "Same as Username" },
        { value: "random", label: "Random" },
      ],
      defaultValue: "same_as_username",
    },
    {
      name: "comment",
      label: "Komentar",
      type: "textarea",
      placeholder: "Masukkan komentar (opsional)",
    },
  ]

  const customActions: ActionItem<VoucherBatch>[] = [
    {
      label: "Lihat",
      icon: Eye,
      onClick: (batch) => {
        handleViewTemplate(batch)
      },
      permission: "hotspot.vouchers.view",
      variant: "ghost"
    },
    {
      label: "Export PDF",
      icon: Download,
      onClick: (batch) => {
        handleExportBatch(batch, "pdf");
      },
      permission: "hotspot.vouchers.view",
      variant: "default"
    },
    {
      label: "Print",
      icon: PrinterIcon,
      onClick: (batch) => {
        handlePrint(batch);
      },
      permission: "hotspot.vouchers.view",
      variant: "default"
    },
    {
      label: "Edit",
      icon: Edit,
      onClick: (batch) => {
        handleEdit(batch);
      },
      permission: "hotspot.vouchers.edit",
      variant: "default"
    },
    {
      label: "Hapus",
      icon: Trash2,
      onClick: (batch) => {
        handleDelete(batch)
      },
      permission: "hotspot.vouchers.delete",
      variant: "destructive",
      className: "text-red-600"
    }
  ]

  // Action handlers
  const handleAdd = () => {
    setEditingBatch(null)
    setDialogOpen(true)
  }

  const handleEdit = (batch: VoucherBatch) => {
    setEditingBatch(batch)
    setDialogOpen(true)
  }

  const handleDelete = async (batch: VoucherBatch) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus batch "${batch.batch_name}" beserta semua voucher-nya?`)) {
      return
    }

    try {
      const response = await fetch(`/api/mikrotik/hotspot/batches/${batch.id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Batch berhasil dihapus")
        fetchBatches()
      } else {
        const error = await response.json()
        toast.error(error.message || "Gagal menghapus batch")
      }
    } catch (error) {
      console.error("Error deleting batch:", error)
      toast.error("Gagal menghapus batch")
    }
  }

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      setGenerating(true)
      setProgress(0)

      const url = editingBatch
        ? `/api/mikrotik/hotspot/batches/${editingBatch.id}`
        : "/api/mikrotik/hotspot/batches"
      const method = editingBatch ? "PUT" : "POST"

      // Convert string values to appropriate types
      const submitData = {
        ...data,
        router_id: parseInt(data.router_id),
        profile_id: data.profile_id ? parseInt(data.profile_id) : null,
        total_generated: parseInt(data.total_generated) || 0,
        length: parseInt(data.length) || 6,
        characters: data.characters || "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
        password_mode: data.password_mode || "same_as_username",
        created_by: 1, // You might want to get this from user context
      }

      // Simulate progress for generation
      if (!editingBatch) {
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 10
          })
        }, 200)
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        const result = await response.json()

        if (!editingBatch && result.data?.vouchers) {
          // Show generated vouchers
          setTemplateVouchers(result.data.vouchers)
          setShowTemplate(true)
        }

        toast.success(
          editingBatch ? "Batch berhasil diperbarui" : `Batch berhasil dibuat dengan ${result.data?.vouchers?.length || 0} voucher`
        )
        setDialogOpen(false)
        fetchBatches()
        setProgress(100)

        setTimeout(() => {
          setProgress(0)
          setGenerating(false)
        }, 1000)
      } else {
        const error = await response.json()
        toast.error(error.message || "Gagal menyimpan batch")
        setGenerating(false)
        setProgress(0)
      }
    } catch (error) {
      console.error("Error saving batch:", error)
      toast.error("Gagal menyimpan batch")
      setGenerating(false)
      setProgress(0)
    }
  }

  const handleViewTemplate = async (batch: VoucherBatch) => {
    try {
      toast.info("Memuat voucher...")
      const response = await fetch(`/api/mikrotik/hotspot/batches/${batch.id}/vouchers`)
      if (response.ok) {
        const vouchers = await response.json()
        setTemplateVouchers(vouchers.data.slice(0, 40)) // Show first 40 for template
        setShowTemplate(true)
      } else {
        throw new Error('Failed to load vouchers for template')
      }
    } catch (error) {
      console.error('Error loading vouchers for template:', error)
      toast.error('Error loading vouchers for template: ' + (error as Error).message)
    }
  }

  const handleExportBatch = async (batch: VoucherBatch, format: string) => {
    try {
      toast.info("Mengexport voucher...")
      const response = await fetch(`/api/mikrotik/hotspot/batches/${batch.id}/vouchers`)
      if (response.ok) {
        const vouchers = await response.json()

        if (format === 'pdf') {
          setTemplateVouchers(vouchers.data)
          setShowTemplate(true)
        } else {
          // CSV export
          const csvContent = [
            'Username,Password,Profile,Validity,Status',
            ...vouchers.data.map((v: Voucher) =>
              `${v.username},${v.password},${v.profile},${v.validity},${v.used ? 'Used' : 'Unused'}`
            )
          ].join('\n')

          const blob = new Blob([csvContent], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `vouchers-${batch.batch_name}.csv`
          a.click()
          URL.revokeObjectURL(url)
          toast.success("Voucher berhasil diexport ke CSV")
        }
      }
    } catch (error) {
      console.error("Error exporting batch:", error)
      toast.error("Gagal export batch")
    }
  }

  // Get initial form data for editing
  const getInitialData = () => {
    if (!editingBatch) return {
      length: "6",
      characters: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
      password_mode: "same_as_username"
    }

    return {
      router_id: editingBatch.router_id?.toString() || "",
      batch_name: editingBatch.batch_name,
      profile_id: editingBatch.profile_id?.toString() || "",
      total_generated: editingBatch.total_generated.toString(),
      length: editingBatch.length?.toString() || "6",
      prefix: editingBatch.prefix || "",
      characters: editingBatch.characters || "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
      password_mode: editingBatch.password_mode || "same_as_username",
      comment: editingBatch.comment || "",
    }
  }

  // Stats
  const totalBatches = batches.length
  const totalGenerated = batches.reduce((sum, batch) => sum + batch.total_generated, 0)
  const activeBatches = batches.filter(b => b.is_active).length
  const totalRevenue = batches.reduce((sum, batch) => {
    const profile = profiles.find(p => p.id === batch.profile_id)
    return sum + (profile ? profile.sell_price * batch.total_generated : 0)
  }, 0)

  const VoucherTemplate = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Preview Voucher ({templateVouchers.length} voucher)</h2>
            <div className="flex gap-2">
              <Button onClick={() => handlePrint({
                id: 0,
                batch_name: 'Preview',
                router_id: 0,
                profile_id: null,
                generation_config: {},
                total_generated: templateVouchers.length,
                comment: null,
                status: 'active',
                is_active: true,
                created_at: new Date().toISOString(),
                created_by: null
              })}>
                <Printer className="h-4 w-4 mr-2" />
                Print All
              </Button>
              <Button variant="outline" onClick={() => setShowTemplate(false)}>
                Close
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 print:gap-2">
            {templateVouchers.slice(0, 40).map((voucher, index) => (
              <div key={voucher.id} className="border-2 border-black p-3 print:p-2">
                <div className="text-center">
                  <div className="font-bold text-lg mb-2 print:text-sm">HOTSPOT VOUCHER</div>
                  <div className="text-sm mb-2 text-gray-600 print:text-xs">[{index + 1}]</div>
                  <div className="text-sm mb-2 print:text-xs">Username</div>
                  <div className="font-bold text-lg mb-1 print:text-sm">{voucher.username}</div>
                  <div className="text-sm mb-2 print:text-xs">Password</div>
                  <div className="font-bold text-lg mb-1 print:text-sm">{voucher.password}</div>
                  <div className="text-sm print:text-xs">
                    {voucher.validity} - {voucher.profile}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {templateVouchers.length > 40 && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-center">
              <p className="text-sm text-gray-600">
                Menampilkan 40 voucher pertama dari {templateVouchers.length} total voucher.
                Gunakan Print All untuk mencetak semua voucher.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (showTemplate) {
    return <VoucherTemplate />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Vouchers</h1>
        <p className="text-muted-foreground">
          Generate voucher hotspot dalam batch untuk akses pengguna
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Batch"
          value={totalBatches}
          description="Batch yang telah dibuat"
          icon={Package}
        />
        <StatsCard
          title="Total Voucher"
          value={totalGenerated}
          description="Voucher yang digenerate"
          icon={FileText}
        />
        <StatsCard
          title="Batch Aktif"
          value={activeBatches}
          description="Batch yang sedang aktif"
          icon={Zap}
        />
        <StatsCard
          title="Total Potensi"
          value={formatCurrency(totalRevenue)}
          description="Potensi pendapatan"
          icon={Users}
        />
      </div>

      {/* Generate Progress */}
      {generating && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating vouchers...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batches Table */}
      <FilterableTable
        data={batches}
        columns={columns}
        title="Daftar Batch Voucher"
        loading={loading}
        searchPlaceholder="Cari batch..."
        emptyMessage="Belum ada batch voucher"
        entityName="batch"
        enableBulkSelect={true}
        permissions={{
          view: "hotspot.read",
          write: "hotspot.read",
          delete: "hotspot.read",
        }}
        onAdd={handleAdd}
        actions={customActions}
        filters={[
          {
            key: "password_mode",
            label: "Mode Password",
            options: [
              { label: "Same as Username", value: "same_as_username" },
              { label: "Random", value: "random" },
            ],
          },
          {
            key: "is_active",
            label: "Status",
            options: [
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ],
          },
        ]}
        onRefresh={fetchBatches}
      />

      {/* Add/Edit Dialog */}
      <ReusableDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingBatch ? "Edit Batch Voucher" : "Generate Batch Voucher"}
        description={
          editingBatch
            ? "Perbarui informasi batch voucher"
            : "Buat batch voucher baru dan generate voucher secara otomatis"
        }
      >
        <ReusableForm
          fields={formFields}
          onSubmit={handleSubmit}
          initialData={getInitialData()}
          submitLabel={editingBatch ? "Perbarui" : "Generate"}
          cancelLabel="Batal"
          onCancel={() => setDialogOpen(false)}
          loading={generating}
        />
      </ReusableDialog>
    </div>
  )
}