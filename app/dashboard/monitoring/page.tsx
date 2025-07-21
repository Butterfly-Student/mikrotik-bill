"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { Activity, Wifi, Router, Users, TrendingUp, Server, RefreshCw, Eye } from "lucide-react"
import Link from "next/link"

export default function MonitoringPage() {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5)
  const [trafficData, setTrafficData] = useState([
    { time: "15:25", upload: 45, download: 120 },
    { time: "15:26", upload: 52, download: 135 },
    { time: "15:27", upload: 48, download: 128 },
    { time: "15:28", upload: 61, download: 142 },
    { time: "15:29", upload: 55, download: 138 },
    { time: "15:30", upload: 67, download: 155 },
  ])

  const [systemStats, setSystemStats] = useState({
    totalUsers: 1520,
    activeUsers: 890,
    hotspotUsers: 650,
    pppoeUsers: 240,
    totalTraffic: 2.4, // GB
    uptime: "15 days, 8 hours",
    cpuUsage: 45,
    memoryUsage: 62,
    diskUsage: 38,
  })

  // Auto refresh simulation
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Update traffic data
      setTrafficData((prev) => {
        const newTime = new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
        })
        const newEntry = {
          time: newTime,
          upload: Math.floor(Math.random() * 30) + 40,
          download: Math.floor(Math.random() * 40) + 120,
        }
        return [...prev.slice(1), newEntry]
      })

      // Update system stats
      setSystemStats((prev) => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        totalTraffic: prev.totalTraffic + Math.random() * 0.1,
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + Math.floor(Math.random() * 10) - 5)),
        memoryUsage: Math.max(30, Math.min(90, prev.memoryUsage + Math.floor(Math.random() * 6) - 3)),
      }))
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const activeConnections = [
    {
      id: 1,
      username: "user001",
      type: "hotspot",
      ip: "192.168.1.100",
      mac: "AA:BB:CC:DD:EE:FF",
      uptime: "2h 15m",
      upload: "45 MB",
      download: "120 MB",
      speed: "2.5 Mbps",
    },
    {
      id: 2,
      username: "pppoe_user01",
      type: "pppoe",
      ip: "10.10.10.5",
      mac: "11:22:33:44:55:66",
      uptime: "5h 30m",
      upload: "180 MB",
      download: "450 MB",
      speed: "8.2 Mbps",
    },
    {
      id: 3,
      username: "user002",
      type: "hotspot",
      ip: "192.168.1.101",
      mac: "BB:CC:DD:EE:FF:AA",
      uptime: "1h 45m",
      upload: "32 MB",
      download: "95 MB",
      speed: "1.8 Mbps",
    },
    {
      id: 4,
      username: "pppoe_user02",
      type: "pppoe",
      ip: "10.10.10.6",
      mac: "22:33:44:55:66:77",
      uptime: "3h 20m",
      upload: "125 MB",
      download: "320 MB",
      speed: "5.5 Mbps",
    },
  ]

  const getTypeIcon = (type: string) => {
    return type === "hotspot" ? (
      <Wifi className="h-4 w-4 text-blue-600" />
    ) : (
      <Router className="h-4 w-4 text-green-600" />
    )
  }

  const getTypeBadge = (type: string) => {
    return type === "hotspot" ? (
      <Badge className="bg-blue-100 text-blue-800">Hotspot</Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800">PPPoE</Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">Real-time monitoring of network performance and user activities</p>
        </div>
        <div className="flex gap-2">
          <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 seconds</SelectItem>
              <SelectItem value="10">10 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={autoRefresh ? "default" : "outline"} onClick={() => setAutoRefresh(!autoRefresh)}>
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Auto Refresh" : "Manual"}
          </Button>
          <Link href="/dashboard/monitoring/live-logs">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Live Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">of {systemStats.totalUsers} total users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Traffic</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalTraffic.toFixed(1)} GB</div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.8%</div>
            <p className="text-xs text-muted-foreground">{systemStats.uptime}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.cpuUsage}%</div>
            <p className="text-xs text-muted-foreground">Memory: {systemStats.memoryUsage}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Service Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-blue-600" />
                  <span>Hotspot Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">{systemStats.hotspotUsers}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((systemStats.hotspotUsers / systemStats.activeUsers) * 100)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Router className="h-4 w-4 text-green-600" />
                  <span>PPPoE Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">{systemStats.pppoeUsers}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {Math.round((systemStats.pppoeUsers / systemStats.activeUsers) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Usage</span>
                  <span>{systemStats.cpuUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${systemStats.cpuUsage}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Memory Usage</span>
                  <span>{systemStats.memoryUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${systemStats.memoryUsage}%` }}
                  ></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Disk Usage</span>
                  <span>{systemStats.diskUsage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${systemStats.diskUsage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Traffic Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Real-time Traffic Monitor</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: "Mbps", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Area type="monotone" dataKey="download" stackId="1" stroke="#8884d8" fill="#8884d8" name="Download" />
              <Area type="monotone" dataKey="upload" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Upload" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Active Connections ({activeConnections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>MAC Address</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>Traffic (Up/Down)</TableHead>
                <TableHead>Current Speed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeConnections.map((connection) => (
                <TableRow key={connection.id}>
                  <TableCell className="font-medium">{connection.username}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(connection.type)}
                      {getTypeBadge(connection.type)}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">{connection.ip}</TableCell>
                  <TableCell className="font-mono text-sm">{connection.mac}</TableCell>
                  <TableCell>{connection.uptime}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>↑ {connection.upload}</div>
                      <div>↓ {connection.download}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{connection.speed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
