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
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Download, FileText, Printer, Search } from "lucide-react"

export default function VouchersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Mock data
  const vouchers = [
    {
      id: 1,
      batchId: "BATCH001",
      username: "VOC001",
      password: "123456",
      profile: "Hotspot 1 Day",
      status: "unused",
      createdBy: "admin",
      createdAt: "2024-01-10",
      expiresAt: "2024-02-10",
    },
    {
      id: 2,
      batchId: "BATCH001",
      username: "VOC002",
      password: "789012",
      profile: "Hotspot 1 Day",
      status: "used",
      createdBy: "admin",
      createdAt: "2024-01-10",
      usedAt: "2024-01-12",
      expiresAt: "2024-02-10",
    },
    {
      id: 3,
      batchId: "BATCH002",
      username: "VOC003",
      password: "345678",
      profile: "Hotspot 1 Hour",
      status: "expired",
      createdBy: "reseller1",
      createdAt: "2024-01-05",
      expiresAt: "2024-01-06",
    },
  ]

  const profiles = ["Hotspot 1 Hour", "Hotspot 1 Day", "Hotspot 1 Week"]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unused":
        return <Badge className="bg-blue-100 text-blue-800">Unused</Badge>
      case "used":
        return <Badge className="bg-green-100 text-green-800">Used</Badge>
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch =
      voucher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.batchId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || voucher.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Voucher Management</h1>
          <p className="text-muted-foreground">Generate and manage vouchers for hotspot access</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Generate Vouchers
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Generate Vouchers</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input id="quantity" type="number" placeholder="100" min="1" max="1000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prefix">Prefix</Label>
                  <Input id="prefix" placeholder="VOC" />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username-length">Username Length</Label>
                  <Select defaultValue="6">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 characters</SelectItem>
                      <SelectItem value="6">6 characters</SelectItem>
                      <SelectItem value="8">8 characters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-length">Password Length</Label>
                  <Select defaultValue="6">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 characters</SelectItem>
                      <SelectItem value="6">6 characters</SelectItem>
                      <SelectItem value="8">8 characters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="auto-export" />
                    <Label htmlFor="auto-export" className="text-sm">
                      Auto export to PDF
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-logo" />
                    <Label htmlFor="include-logo" className="text-sm">
                      Include company logo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="include-instructions" />
                    <Label htmlFor="include-instructions" className="text-sm">
                      Include usage instructions
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1">Generate</Button>
                <Button variant="outline" className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Generate & Print
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
            <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,456</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unused</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1,234</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">987</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">235</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vouchers..."
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
                <SelectItem value="unused">Unused</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Selected
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Print Selected
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vouchers ({filteredVouchers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox />
                </TableHead>
                <TableHead>Batch ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Used At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell className="font-medium">{voucher.batchId}</TableCell>
                  <TableCell>{voucher.username}</TableCell>
                  <TableCell className="font-mono">{voucher.password}</TableCell>
                  <TableCell>{voucher.profile}</TableCell>
                  <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                  <TableCell>{voucher.createdAt}</TableCell>
                  <TableCell>{voucher.expiresAt}</TableCell>
                  <TableCell>{voucher.usedAt || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
