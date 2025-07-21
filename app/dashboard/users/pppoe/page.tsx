"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Search, Filter, Download, Upload, Edit, Trash2, Activity, RefreshCw } from "lucide-react"

export default function PPPoEUsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [activeUsers, setActiveUsers] = useState([
    {
      id: 1,
      username: "pppoe_user01",
      password: "pass123",
      profile: "PPPoE 10GB",
      staticIP: "10.10.10.5",
      interface: "pppoe-out1",
      status: "online",
      uptime: "2h 15m",
      dataUsed: "1.2 GB",
      uploadSpeed: "512 Kbps",
      downloadSpeed: "2048 Kbps",
      lastLogin: "2024-01-10 13:15",
      createdBy: "admin",
      isActive: true,
    },
    {
      id: 2,
      username: "pppoe_user02",
      password: "pass456",
      profile: "PPPoE Unlimited",
      staticIP: null,
      interface: "pppoe-out2",
      status: "online",
      uptime: "5h 30m",
      dataUsed: "3.8 GB",
      uploadSpeed: "1024 Kbps",
      downloadSpeed: "4096 Kbps",
      lastLogin: "2024-01-10 09:45",
      createdBy: "reseller1",
      isActive: true,
    },
    {
      id: 3,
      username: "pppoe_user03",
      password: "pass789",
      profile: "PPPoE 10GB",
      staticIP: "10.10.10.7",
      interface: null,
      status: "offline",
      uptime: "0m",
      dataUsed: "8.5 GB",
      uploadSpeed: "0 Kbps",
      downloadSpeed: "0 Kbps",
      lastLogin: "2024-01-09 18:30",
      createdBy: "admin",
      isActive: false,
    },
  ])

  const profiles = ["PPPoE 10GB", "PPPoE Unlimited", "PPPoE 5GB", "PPPoE Business"]

  // Auto refresh active users
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setActiveUsers((prev) =>
        prev.map((user) => {
          if (user.status === "online") {
            // Simulate data usage increase
            const currentUsage = Number.parseFloat(user.dataUsed.replace(" GB", ""))
            const newUsage = (currentUsage + Math.random() * 0.1).toFixed(1)

            // Simulate uptime increase
            const [hours, minutes] = user.uptime.split("h ").map((s) => Number.parseInt(s.replace("m", "")))
            const totalMinutes = hours * 60 + minutes + 1
            const newHours = Math.floor(totalMinutes / 60)
            const newMinutes = totalMinutes % 60

            return {
              ...user,
              dataUsed: `${newUsage} GB`,
              uptime: `${newHours}h ${newMinutes}m`,
            }
          }
          return user
        }),
      )
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [autoRefresh])

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === "online" && isActive) {
      return <Badge className="bg-green-100 text-green-800">Online</Badge>
    } else if (status === "offline") {
      return <Badge variant="secondary">Offline</Badge>
    } else {
      return <Badge variant="destructive">Disabled</Badge>
    }
  }

  const filteredUsers = activeUsers.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "online" && user.status === "online" && user.isActive) ||
      (statusFilter === "offline" && user.status === "offline") ||
      (statusFilter === "disabled" && !user.isActive)

    return matchesSearch && matchesStatus
  })

  const onlineUsers = activeUsers.filter((u) => u.status === "online" && u.isActive).length
  const offlineUsers = activeUsers.filter((u) => u.status === "offline").length
  const disabledUsers = activeUsers.filter((u) => !u.isActive).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PPPoE Users</h1>
          <p className="text-muted-foreground">Manage PPPoE user accounts and monitor active connections</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add PPPoE User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New PPPoE User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" placeholder="Enter username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" placeholder="Enter password" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile">Profile</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile} value={profile}>
                          {profile}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="static-ip">Static IP (Optional)</Label>
                  <Input id="static-ip" placeholder="10.10.10.x" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interface">Interface</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interface" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pppoe-out1">pppoe-out1</SelectItem>
                      <SelectItem value="pppoe-out2">pppoe-out2</SelectItem>
                      <SelectItem value="pppoe-out3">pppoe-out3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Create User</Button>
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Online Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onlineUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Offline Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{offlineUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Disabled Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{disabledUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              <Label htmlFor="auto-refresh">Auto Refresh</Label>
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin text-green-600" : "text-gray-400"}`} />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active PPPoE Sessions ({filteredUsers.filter((u) => u.status === "online").length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Interface</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Data Used</TableHead>
                <TableHead>Speed (Up/Down)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.profile}</TableCell>
                  <TableCell>{getStatusBadge(user.status, user.isActive)}</TableCell>
                  <TableCell className="font-mono">{user.staticIP || "Dynamic"}</TableCell>
                  <TableCell className="font-mono">{user.interface || "-"}</TableCell>
                  <TableCell>{user.uptime}</TableCell>
                  <TableCell>{user.dataUsed}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>↑ {user.uploadSpeed}</div>
                      <div>↓ {user.downloadSpeed}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.status === "online" ? (
                        <Button variant="ghost" size="sm" className="text-red-600">
                          Disconnect
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-green-600">
                          Connect
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
