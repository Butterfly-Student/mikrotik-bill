"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Wifi, Router } from "lucide-react"

export default function ProfilesPage() {
  const [profiles] = useState([
    {
      id: 1,
      name: "Hotspot 1 Hour",
      type: "hotspot",
      timeLimit: 3600,
      dataLimit: null,
      bandwidthUp: 1024,
      bandwidthDown: 2048,
      validityDays: 1,
      price: 5000,
      billingCycle: "one-time",
      expiredMode: "remove",
      isSharedBandwidth: false,
      activeUsers: 45,
    },
    {
      id: 2,
      name: "Hotspot 1 Day",
      type: "hotspot",
      timeLimit: 86400,
      dataLimit: null,
      bandwidthUp: 2048,
      bandwidthDown: 4096,
      validityDays: 1,
      price: 15000,
      billingCycle: "one-time",
      expiredMode: "remove",
      isSharedBandwidth: false,
      activeUsers: 123,
    },
    {
      id: 3,
      name: "PPPoE 10GB",
      type: "pppoe",
      timeLimit: null,
      dataLimit: 10737418240,
      bandwidthUp: 5120,
      bandwidthDown: 10240,
      validityDays: 30,
      price: 100000,
      billingCycle: "monthly",
      expiredMode: "notice",
      isSharedBandwidth: true,
      activeUsers: 67,
    },
    {
      id: 4,
      name: "PPPoE Unlimited",
      type: "pppoe",
      timeLimit: null,
      dataLimit: null,
      bandwidthUp: 10240,
      bandwidthDown: 20480,
      validityDays: 30,
      price: 200000,
      billingCycle: "monthly",
      expiredMode: "grace",
      isSharedBandwidth: true,
      activeUsers: 234,
    },
  ])

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "Unlimited"
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "Unlimited"
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const formatBandwidth = (kbps: number) => {
    if (kbps >= 1024) {
      return `${(kbps / 1024).toFixed(1)} Mbps`
    }
    return `${kbps} Kbps`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile Management</h1>
          <p className="text-muted-foreground">Manage user profiles and packages for hotspot and PPPoE services</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Profile Name</Label>
                  <Input id="name" placeholder="Enter profile name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Service Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hotspot">Hotspot</SelectItem>
                      <SelectItem value="pppoe">PPPoE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Limits & Quotas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time-limit">Time Limit (seconds)</Label>
                    <Input id="time-limit" type="number" placeholder="3600" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data-limit">Data Limit (MB)</Label>
                    <Input id="data-limit" type="number" placeholder="1024" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bandwidth-up">Upload Speed (Kbps)</Label>
                    <Input id="bandwidth-up" type="number" placeholder="1024" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bandwidth-down">Download Speed (Kbps)</Label>
                    <Input id="bandwidth-down" type="number" placeholder="2048" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Billing & Expiry</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="validity">Validity (Days)</Label>
                    <Input id="validity" type="number" placeholder="30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" type="number" placeholder="50000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing-cycle">Billing Cycle</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cycle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One Time</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expired-mode">Expired Mode</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="remove">Remove User</SelectItem>
                        <SelectItem value="notice">Show Notice</SelectItem>
                        <SelectItem value="grace">Grace Period</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grace-period">Grace Period (Days)</Label>
                    <Input id="grace-period" type="number" placeholder="3" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Advanced Options</h3>
                <div className="flex items-center space-x-2">
                  <Switch id="shared-bandwidth" />
                  <Label htmlFor="shared-bandwidth">Shared Bandwidth</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">Create Profile</Button>
                <Button variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hotspot Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {profiles.filter((p) => p.type === "hotspot").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">PPPoE Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{profiles.filter((p) => p.type === "pppoe").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.reduce((sum, p) => sum + p.activeUsers, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Profiles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Limits</TableHead>
                <TableHead>Bandwidth</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Active Users</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {profile.type === "hotspot" ? (
                        <Wifi className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Router className="h-4 w-4 text-green-600" />
                      )}
                      <Badge variant={profile.type === "hotspot" ? "default" : "secondary"}>
                        {profile.type.toUpperCase()}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Time: {formatTime(profile.timeLimit)}</div>
                      <div>Data: {formatBytes(profile.dataLimit)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Up: {formatBandwidth(profile.bandwidthUp)}</div>
                      <div>Down: {formatBandwidth(profile.bandwidthDown)}</div>
                    </div>
                  </TableCell>
                  <TableCell>{profile.validityDays} days</TableCell>
                  <TableCell>{formatPrice(profile.price)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{profile.activeUsers}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
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
