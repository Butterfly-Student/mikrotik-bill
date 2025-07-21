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
import { Plus, Search, DollarSign, Users, TrendingUp, Edit, Trash2, CreditCard } from "lucide-react"

export default function ResellersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Mock data
  const resellers = [
    {
      id: 1,
      username: "reseller_01",
      email: "reseller1@example.com",
      name: "PT. Internet Sejahtera",
      phone: "+62812345678",
      balance: 2500000,
      commissionRate: 15,
      totalSales: 15750000,
      activeUsers: 234,
      status: "active",
      joinedAt: "2023-06-15",
      lastActivity: "2024-01-10 14:30",
    },
    {
      id: 2,
      username: "reseller_02",
      email: "reseller2@example.com",
      name: "CV. Digital Network",
      phone: "+62823456789",
      balance: 750000,
      commissionRate: 12,
      totalSales: 8900000,
      activeUsers: 156,
      status: "active",
      joinedAt: "2023-08-20",
      lastActivity: "2024-01-09 16:45",
    },
    {
      id: 3,
      username: "reseller_03",
      email: "reseller3@example.com",
      name: "Warnet Maju Jaya",
      phone: "+62834567890",
      balance: 125000,
      commissionRate: 10,
      totalSales: 3200000,
      activeUsers: 67,
      status: "suspended",
      joinedAt: "2023-11-10",
      lastActivity: "2024-01-05 10:20",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredResellers = resellers.filter((reseller) => {
    const matchesSearch =
      reseller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reseller.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reseller.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || reseller.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalStats = {
    totalResellers: resellers.length,
    activeResellers: resellers.filter((r) => r.status === "active").length,
    totalBalance: resellers.reduce((sum, r) => sum + r.balance, 0),
    totalSales: resellers.reduce((sum, r) => sum + r.totalSales, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reseller Management</h1>
          <p className="text-muted-foreground">Manage reseller accounts, commissions, and sales performance</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Reseller
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Reseller</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" placeholder="reseller_username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input id="name" placeholder="PT. Example Business" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+62812345678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commission">Commission Rate (%)</Label>
                    <Input id="commission" type="number" placeholder="15" min="0" max="50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initial-balance">Initial Balance</Label>
                  <Input id="initial-balance" type="number" placeholder="1000000" />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Create Reseller</Button>
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <CreditCard className="h-4 w-4 mr-2" />
            Bulk Top-up
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalResellers}</div>
            <p className="text-xs text-muted-foreground">{totalStats.activeResellers} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalStats.totalBalance)}</div>
            <p className="text-xs text-muted-foreground">Available credit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalStats.totalSales)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Commission</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(resellers.reduce((sum, r) => sum + r.commissionRate, 0) / resellers.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Average rate</p>
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
                placeholder="Search resellers..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resellers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resellers ({filteredResellers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reseller</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResellers.map((reseller) => (
                <TableRow key={reseller.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{reseller.name}</div>
                      <div className="text-sm text-muted-foreground">@{reseller.username}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{reseller.email}</div>
                      <div className="text-muted-foreground">{reseller.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(reseller.balance)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{reseller.commissionRate}%</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(reseller.totalSales)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{reseller.activeUsers}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(reseller.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">{reseller.lastActivity}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <CreditCard className="h-4 w-4" />
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
