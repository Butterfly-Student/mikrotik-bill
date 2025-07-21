"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search, RefreshCw, Activity, ZapOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PPPoEActiveUsersPage() {
  const [activeUsers, setActiveUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchActiveUsers()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      fetchActiveUsers()
    }, 10000) // Refresh every 10 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch("/api/mikrotik/pppoe/active")
      const data = await response.json()
      if (data.success) {
        setActiveUsers(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch active users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async (sessionId) => {
    try {
      const response = await fetch(`/api/mikrotik/pppoe/active/${sessionId}/disconnect`, {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "User disconnected successfully",
        })
        fetchActiveUsers()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to disconnect user",
        variant: "destructive",
      })
    }
  }

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B"
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const filteredUsers = activeUsers.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PPPoE Active Users</h1>
          <p className="text-muted-foreground">Monitor and manage active PPPoE sessions</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
            <Label htmlFor="auto-refresh">Auto Refresh</Label>
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin text-green-600" : "text-gray-400"}`} />
          </div>
          <Button onClick={fetchActiveUsers} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(activeUsers.reduce((sum, user) => sum + (user.bytes_out || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Download</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(activeUsers.reduce((sum, user) => sum + (user.bytes_in || 0), 0))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeUsers.length > 0
                ? formatDuration(activeUsers.reduce((sum, user) => sum + (user.uptime || 0), 0) / activeUsers.length)
                : "0h 0m"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search active users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Sessions ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Upload</TableHead>
                <TableHead>Download</TableHead>
                <TableHead>Rate Limit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.session_id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell className="font-mono">{user.address}</TableCell>
                  <TableCell>{formatDuration(user.uptime || 0)}</TableCell>
                  <TableCell>{formatBytes(user.bytes_out || 0)}</TableCell>
                  <TableCell>{formatBytes(user.bytes_in || 0)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>↑ {user.rate_limit_tx || "Unlimited"}</div>
                      <div>↓ {user.rate_limit_rx || "Unlimited"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDisconnect(user.session_id)}
                    >
                      <ZapOff className="h-4 w-4 mr-1" />
                      Disconnect
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {loading ? "Loading active sessions..." : "No active PPPoE sessions found"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
