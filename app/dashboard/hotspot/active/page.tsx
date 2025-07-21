"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, RefreshCw, Users, Upload, Download, Clock, Settings, Play, Pause } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ReusableDialog } from "@/components/reausable/dialog"
import { StatsCard } from "@/components/reausable/stats-card"
import { FilterableTable, type TableColumn } from "@/components/reausable/table"
import { Label } from "@/components/ui/label"
import { TableControlsConfig } from "@/components/reausable/table-control"

interface ActiveSession {
  id: string
  user: string
  address: string
  macAddress: string
  uptime: number
  bytesIn: number
  bytesOut: number
  loginTime: string
  profile?: string
  status: "connected" | "idle"
}

export default function HotspotActiveSessionsPage() {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5)
  const [pageSize, setPageSize] = useState(10)
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null)
  const [isDisconnectDialogOpen, setIsDisconnectDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchActiveSessions()
  }, [])

  // Auto refresh effect
  useEffect(() => {
    if (!isAutoRefresh) return

    const interval = setInterval(() => {
      fetchActiveSessions()
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [isAutoRefresh, refreshInterval])

  const fetchActiveSessions = async () => {
    try {
      const res = await fetch("/api/mikrotik/hotspot/active")
      if (res.ok) {
        const data = await res.json()
        setActiveSessions(data.sessions || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch active sessions",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to fetch active sessions:", error)
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async (session: ActiveSession) => {
    setSelectedSession(session)
    setIsDisconnectDialogOpen(true)
  }

  const confirmDisconnect = async () => {
    if (!selectedSession) return

    try {
      const res = await fetch(`/api/mikrotik/hotspot/active/${selectedSession.id}/disconnect`, {
        method: "POST",
      })

      if (res.ok) {
        toast({
          title: "Berhasil",
          description: `User ${selectedSession.user} berhasil didisconnect`,
        })
        fetchActiveSessions()
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
        description: "Gagal disconnect user",
        variant: "destructive",
      })
    } finally {
      setIsDisconnectDialogOpen(false)
      setSelectedSession(null)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const parseUptime = (uptime: string): number => {
    const regex = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/
    const match = uptime.match(regex)

    if (!match) return 0

    const hours = parseInt(match[1] || '0', 10)
    const minutes = parseInt(match[2] || '0', 10)
    const seconds = parseInt(match[3] || '0', 10)

    return hours * 3600 + minutes * 60 + seconds
  }
  

  // Table columns
  const tableColumns: TableColumn<ActiveSession>[] = [
    {
      key: "user",
      label: "Username",
      sortable: true,
      hideable: false,
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: "address",
      label: "IP Address",
      sortable: true,
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "macAddress",
      label: "MAC Address",
      sortable: true,
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: "uptime",
      label: "Session Time",
      sortable: true,
      render: (value) => value,
    },
    {
      key: "bytesOut",
      label: "Upload",
      sortable: true,
      render: (value) => formatBytes(value),
    },
    {
      key: "bytesIn",
      label: "Download",
      sortable: true,
      render: (value) => formatBytes(value),
    },
    {
      key: "loginTime",
      label: "Login Time",
      sortable: true,
      render: (value) => new Date(value).toLocaleString("id-ID"),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      render: (value) => (
        <Badge className="bg-green-100 text-green-800">
          <Wifi className="h-3 w-3 mr-1" />
          {value === "connected" ? "Connected" : "Idle"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      hideable: false,
      render: (_, row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            handleDisconnect(row)
          }}
          className="text-red-600 hover:text-red-700"
        >
          <WifiOff className="h-4 w-4" />
        </Button>
      ),
    },
  ]

  // Table filters
  const tableFilters = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Connected", value: "connected" },
        { label: "Idle", value: "idle" },
      ],
    },
  ]

  // Controls configuration
  const controlsConfig: TableControlsConfig = {
    title: "Session Monitoring Controls",
    icon: Settings,
    columns: 4,
    controls: [
      {
        type: "switch",
        key: "auto-refresh",
        label: "Auto Refresh",
        value: isAutoRefresh,
        onChange: setIsAutoRefresh,
        icon: isAutoRefresh ? Play : Pause,
      },
      {
        type: "select",
        key: "refresh-interval",
        label: "Refresh Interval",
        value: refreshInterval,
        onChange: setRefreshInterval,
        description: "How often to refresh session data",
        options: [
          { label: "5 seconds", value: "5" },
          { label: "10 seconds", value: "10" },
          { label: "30 seconds", value: "30" },
          { label: "1 minute", value: "60" },
        ],
      },
      {
        type: "select",
        key: "page-size",
        label: "Items per Page",
        value: pageSize,
        onChange: setPageSize,
        description: "Number of sessions to display per page",
        options: [
          { label: "10 items", value: "10" },
          { label: "25 items", value: "25" },
          { label: "50 items", value: "50" },
          { label: "100 items", value: "100" },
        ],
      },
      {
        type: "custom",
        key: "connection-status",
        label: "Connection",
        render: () => (
          <div className="space-y-2">
            <Label>Mikrotik Status</Label>
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${loading ? "bg-yellow-500" : "bg-green-500"}`} />
              <span className="text-sm">{loading ? "Connecting..." : "Connected"}</span>
            </div>
          </div>
        ),
      },
    ],
  }

  const handleRowClick = (session: ActiveSession) => {
    toast({
      title: "Session Details",
      description: `User: ${session.user}, IP: ${session.address}, Uptime: ${formatDuration(session.uptime)}`,
    })
  }

  const handleExport = () => {
    const headers = [
      "Username",
      "IP Address",
      "MAC Address",
      "Profile",
      "Session Time",
      "Upload",
      "Download",
      "Login Time",
      "Status",
    ]
    const csvContent = [
      headers.join(","),
      ...activeSessions.map((session) =>
        [
          session.user,
          session.address,
          session.macAddress,
          session.profile || "",
          formatDuration(session.uptime),
          formatBytes(session.bytesOut),
          formatBytes(session.bytesIn),
          new Date(session.loginTime).toLocaleString(),
          session.status,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `active-sessions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Berhasil",
      description: "Data sesi aktif berhasil diekspor",
    })
  }

  const handleRefresh = () => {
    fetchActiveSessions()
    toast({
      title: "Refresh",
      description: "Data sesi aktif berhasil diperbarui",
    })
  }

  // Calculate stats
  const totalSessions = activeSessions.length
  const totalUpload = activeSessions.reduce((sum, s) => sum + (s.bytesOut || 0), 0)
  const totalDownload = activeSessions.reduce((sum, s) => sum + (s.bytesIn || 0), 0)
  const avgSessionTime =
    totalSessions > 0 ? activeSessions.reduce((sum, s) => sum + (parseUptime(`${s.uptime}`) || 0), 0) / totalSessions : 0

  if (loading && activeSessions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Memuat data sesi aktif...</p>
        </div>
      </div>
    )
  }
  console.log(activeSessions)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Active Hotspot Sessions</h1>
          <p className="text-muted-foreground">Monitor dan kelola sesi pengguna hotspot yang aktif</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Active Sessions"
          value={totalSessions}
          description="Sesi pengguna yang aktif"
          icon={Users}
          variant="success"
          trend={totalSessions > 0 ? { value: 100, label: "online", isPositive: true } : undefined}
        />
        <StatsCard
          title="Total Upload"
          value={formatBytes(totalUpload)}
          description="Total data yang diupload"
          icon={Upload}
          variant="default"
        />
        <StatsCard
          title="Total Download"
          value={formatBytes(totalDownload)}
          description="Total data yang didownload"
          icon={Download}
          variant="default"
        />
        <StatsCard
          title="Avg Session Time"
          value={formatDuration(Math.floor(avgSessionTime))}
          description="Rata-rata waktu sesi"
          icon={Clock}
          variant="default"
        />
      </div>

      {/* Active Sessions Table */}
      <FilterableTable
        title={`Active Sessions (${activeSessions.length})`}
        data={activeSessions}
        columns={tableColumns}
        filters={tableFilters}
        controls={controlsConfig}
        onRowClick={handleRowClick}
        onExport={handleExport}
        onRefresh={handleRefresh}
        loading={loading}
        searchPlaceholder="Cari berdasarkan username atau IP address..."
        emptyMessage="Tidak ada sesi aktif ditemukan"
        pageSize={pageSize}
      />

      {/* Disconnect Confirmation Dialog */}
      <ReusableDialog
        trigger={<div />} // Hidden trigger since we control it programmatically
        title="Disconnect User"
        description={`Apakah Anda yakin ingin memutuskan koneksi user "${selectedSession?.user}"?`}
        open={isDisconnectDialogOpen}
        onOpenChange={setIsDisconnectDialogOpen}
        showFooter={true}
        confirmText="Disconnect"
        cancelText="Batal"
        confirmVariant="destructive"
        onConfirm={confirmDisconnect}
        onCancel={() => {
          setIsDisconnectDialogOpen(false)
          setSelectedSession(null)
        }}
        size="sm"
      >
        <div className="space-y-4">
          {selectedSession && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Username:</span>
                <span>{selectedSession.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">IP Address:</span>
                <span className="font-mono">{selectedSession.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Session Time:</span>
                <span>{formatDuration(selectedSession.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Data Usage:</span>
                <span>
                  ↑ {formatBytes(selectedSession.bytesOut)} / ↓ {formatBytes(selectedSession.bytesIn)}
                </span>
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            User akan kehilangan koneksi internet dan harus login ulang untuk mengakses hotspot.
          </p>
        </div>
      </ReusableDialog>
    </div>
  )
}
