"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Play, Pause, RotateCcw, Download, Settings, Activity, Wifi, Router, AlertCircle, Loader2 } from "lucide-react"

// Type definitions for MikroTik logs
interface MikroTikLog {
  id: string
  time: string
  topics: string
  message: string
}

interface ProcessedLog {
  id: string
  timestamp: string
  type: string
  action: string
  username: string
  ip: string
  mac: string
  message: string
  status: string
  rawTopics: string
}

export default function LiveLogsPage() {
  const [isAutoRefresh, setIsAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5)
  const [logType, setLogType] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [logs, setLogs] = useState<ProcessedLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logLimit, setLogLimit] = useState(100)

  // Function to fetch logs from MikroTik API
  const fetchLogs = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/mikrotik/logs?limit=${logLimit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const mikrotikLogs: MikroTikLog[] = await response.json()
      
      // Process MikroTik logs into our format
      const processedLogs = mikrotikLogs.map((log, index) => ({
        id: log.id || `log-${Date.now()}-${index}`,
        timestamp: formatMikroTikTime(log.time),
        type: extractLogType(log.topics),
        action: extractAction(log.message),
        username: extractUsername(log.message),
        ip: extractIP(log.message),
        mac: extractMAC(log.message),
        message: log.message,
        status: determineStatus(log.message, log.topics),
        rawTopics: log.topics
      }))

      setLogs(processedLogs)
    } catch (err) {
      console.error('Error fetching logs:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch logs')
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to format MikroTik time
  const formatMikroTikTime = (time: string): string => {
    try {
      // MikroTik time format is usually like "jan/02 10:30:45"
      const currentYear = new Date().getFullYear()
      const timeWithYear = `${currentYear} ${time}`
      const date = new Date(timeWithYear)
      
      if (isNaN(date.getTime())) {
        return time // Return original if parsing fails
      }
      
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return time
    }
  }

  // Extract log type from topics
  const extractLogType = (topics: string): string => {
    if (!topics) return 'system'
    
    const topicLower = topics.toLowerCase()
    if (topicLower.includes('hotspot')) return 'hotspot'
    if (topicLower.includes('pppoe') || topicLower.includes('ppp')) return 'pppoe'
    if (topicLower.includes('dhcp')) return 'dhcp'
    if (topicLower.includes('wireless')) return 'wireless'
    if (topicLower.includes('firewall')) return 'firewall'
    return 'system'
  }

  // Extract action from message
  const extractAction = (message: string): string => {
    if (!message) return 'unknown'
    
    const msgLower = message.toLowerCase()
    if (msgLower.includes('logged in') || msgLower.includes('login')) return 'login'
    if (msgLower.includes('logged out') || msgLower.includes('logout')) return 'logout'
    if (msgLower.includes('connected')) return 'connect'
    if (msgLower.includes('disconnected')) return 'disconnect'
    if (msgLower.includes('assigned')) return 'assign'
    if (msgLower.includes('released')) return 'release'
    if (msgLower.includes('failed')) return 'failed'
    return 'info'
  }

  // Extract username from message
  const extractUsername = (message: string): string => {
    if (!message) return '-'
    
    // Common patterns for username extraction
    const patterns = [
      /user\s+([^\s,]+)/i,
      /logged\s+in\s+([^\s,]+)/i,
      /logged\s+out\s+([^\s,]+)/i,
      /<([^>]+)>/,
      /username[:\s]+([^\s,]+)/i
    ]
    
    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    return '-'
  }

  // Extract IP address from message
  const extractIP = (message: string): string => {
    if (!message) return '-'
    
    const ipPattern = /(\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b)/g
    const matches = message.match(ipPattern)
    return matches ? matches[0] : '-'
  }

  // Extract MAC address from message
  const extractMAC = (message: string): string => {
    if (!message) return '-'
    
    const macPattern = /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/g
    const match = message.match(macPattern)
    return match ? match[0] : '-'
  }

  // Determine status based on message content
  const determineStatus = (message: string, topics: string): string => {
    if (!message) return 'info'
    
    const msgLower = message.toLowerCase()
    const topicsLower = topics.toLowerCase()
    
    if (msgLower.includes('error') || msgLower.includes('failed') || msgLower.includes('denied')) {
      return 'error'
    }
    if (msgLower.includes('success') || msgLower.includes('logged in') || msgLower.includes('connected')) {
      return 'success'
    }
    if (topicsLower.includes('critical') || topicsLower.includes('warning')) {
      return 'error'
    }
    
    return 'info'
  }

  // Auto refresh effect
  useEffect(() => {
    // Initial fetch
    fetchLogs()
  }, [logLimit])

  useEffect(() => {
    if (!isAutoRefresh) return

    const interval = setInterval(() => {
      fetchLogs()
    }, refreshInterval * 1000)

    return () => clearInterval(interval)
  }, [isAutoRefresh, refreshInterval, logLimit])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "info":
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hotspot":
        return <Wifi className="h-4 w-4 text-blue-600" />
      case "pppoe":
        return <Router className="h-4 w-4 text-green-600" />
      case "dhcp":
        return <Activity className="h-4 w-4 text-purple-600" />
      case "wireless":
        return <Wifi className="h-4 w-4 text-orange-600" />
      case "firewall":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesType = logType === "all" || log.type === logType
    const matchesSearch =
      log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip.includes(searchTerm) ||
      log.mac.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
  })

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Action', 'Username', 'IP Address', 'MAC Address', 'Message', 'Status'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.type,
        log.action,
        log.username,
        log.ip,
        log.mac,
        `"${log.message.replace(/"/g, '""')}"`,
        log.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = url
    a.download = `mikrotik-logs-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Live System Logs</h1>
          <p className="text-muted-foreground">Real-time monitoring of Mikrotik router activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLogs([])} disabled={isLoading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
          <Button variant="outline" onClick={exportLogs} disabled={filteredLogs.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button onClick={fetchLogs} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Activity className="h-4 w-4 mr-2" />}
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>Error: {error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Monitoring Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="auto-refresh" checked={isAutoRefresh} onCheckedChange={setIsAutoRefresh} />
              <Label htmlFor="auto-refresh">Auto Refresh</Label>
              {isAutoRefresh ? <Play className="h-4 w-4 text-green-600" /> : <Pause className="h-4 w-4 text-red-600" />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
              <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 second</SelectItem>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-limit">Log Limit</Label>
              <Select value={logLimit.toString()} onValueChange={(value) => setLogLimit(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 logs</SelectItem>
                  <SelectItem value="100">100 logs</SelectItem>
                  <SelectItem value="200">200 logs</SelectItem>
                  <SelectItem value="500">500 logs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-type">Log Type</Label>
              <Select value={logType} onValueChange={setLogType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hotspot">Hotspot</SelectItem>
                  <SelectItem value="pppoe">PPPoE</SelectItem>
                  <SelectItem value="dhcp">DHCP</SelectItem>
                  <SelectItem value="wireless">Wireless</SelectItem>
                  <SelectItem value="firewall">Firewall</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredLogs.length}</div>
            <p className="text-xs text-muted-foreground">of {logs.length} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {logs.filter((log) => log.status === "success").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Error Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{logs.filter((log) => log.status === "error").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Refresh Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{refreshInterval}s</div>
            <p className="text-xs text-muted-foreground">
              {isAutoRefresh ? 'Active' : 'Paused'}
              {isLoading && <Loader2 className="inline h-3 w-3 ml-1 animate-spin" />}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Live Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>MAC Address</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading logs...
                        </div>
                      ) : error ? (
                        <div className="text-red-600">Failed to load logs</div>
                      ) : (
                        <div className="text-muted-foreground">No logs found</div>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(log.type)}
                          <span className="capitalize">{log.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{log.action}</TableCell>
                      <TableCell className="font-medium">{log.username}</TableCell>
                      <TableCell className="font-mono">{log.ip}</TableCell>
                      <TableCell className="font-mono text-sm">{log.mac}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={log.message}>
                          {log.message}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}