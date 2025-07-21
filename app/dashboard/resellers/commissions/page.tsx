"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DollarSign, TrendingUp, Users, Calendar, Plus, Download, Search } from "lucide-react"

export default function CommissionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [periodFilter, setPeriodFilter] = useState("current")

  // Mock commission data
  const commissions = [
    {
      id: 1,
      resellerId: 1,
      resellerName: "PT. Internet Sejahtera",
      period: "2024-01",
      totalSales: 15750000,
      commissionRate: 15,
      commissionAmount: 2362500,
      status: "paid",
      paidAt: "2024-02-01",
      invoiceCount: 45,
    },
    {
      id: 2,
      resellerId: 2,
      resellerName: "CV. Digital Network",
      period: "2024-01",
      totalSales: 8900000,
      commissionRate: 12,
      commissionAmount: 1068000,
      status: "pending",
      paidAt: null,
      invoiceCount: 28,
    },
    {
      id: 3,
      resellerId: 3,
      resellerName: "Warnet Maju Jaya",
      period: "2024-01",
      totalSales: 3200000,
      commissionRate: 10,
      commissionAmount: 320000,
      status: "paid",
      paidAt: "2024-02-01",
      invoiceCount: 12,
    },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const totalStats = {
    totalCommissions: commissions.reduce((sum, c) => sum + c.commissionAmount, 0),
    paidCommissions: commissions.filter((c) => c.status === "paid").reduce((sum, c) => sum + c.commissionAmount, 0),
    pendingCommissions: commissions
      .filter((c) => c.status === "pending")
      .reduce((sum, c) => sum + c.commissionAmount, 0),
    totalResellers: commissions.length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Commission Management</h1>
          <p className="text-muted-foreground">Track and manage reseller commissions and payouts</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Manual Payout
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Manual Commission Payout</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reseller">Reseller</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reseller" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">PT. Internet Sejahtera</SelectItem>
                      <SelectItem value="2">CV. Digital Network</SelectItem>
                      <SelectItem value="3">Warnet Maju Jaya</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" placeholder="1000000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Manual commission payout" />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Process Payout</Button>
                  <Button variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalStats.totalCommissions)}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalStats.paidCommissions)}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((totalStats.paidCommissions / totalStats.totalCommissions) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalStats.pendingCommissions)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payout</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Resellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalResellers}</div>
            <p className="text-xs text-muted-foreground">Earning commissions</p>
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
            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Period</SelectItem>
                <SelectItem value="last">Last Period</SelectItem>
                <SelectItem value="all">All Periods</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Commissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reseller</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Invoices</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell className="font-medium">{commission.resellerName}</TableCell>
                  <TableCell>{commission.period}</TableCell>
                  <TableCell>{formatCurrency(commission.totalSales)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{commission.commissionRate}%</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(commission.commissionAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{commission.invoiceCount}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(commission.status)}</TableCell>
                  <TableCell>{commission.paidAt || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
