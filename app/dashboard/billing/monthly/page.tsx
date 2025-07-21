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
import { CreditCard, Users, AlertTriangle, Plus, Edit, Send, Search, CheckCircle, Clock, XCircle } from "lucide-react"

export default function MonthlyBillingPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [monthFilter, setMonthFilter] = useState("2024-01")
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)

  // Mock billing data
  const billingOverview = {
    totalCustomers: 150,
    totalBilled: 45000000,
    totalPaid: 38250000,
    totalPending: 6750000,
    paidPercentage: 85,
  }

  const monthlyBills = [
    {
      id: 1,
      customerId: "PPP001",
      customerName: "Ahmad Wijaya",
      customerType: "pppoe",
      profileName: "10 Mbps Unlimited",
      amount: 300000,
      dueDate: "2024-01-31",
      status: "paid",
      paidDate: "2024-01-28",
      paidAmount: 300000,
      billMonth: "2024-01",
    },
    {
      id: 2,
      customerId: "PPP002",
      customerName: "Siti Nurhaliza",
      customerType: "pppoe",
      profileName: "20 Mbps Unlimited",
      amount: 500000,
      dueDate: "2024-01-31",
      status: "pending",
      paidDate: null,
      paidAmount: 0,
      billMonth: "2024-01",
    },
    {
      id: 3,
      customerId: "HSP001",
      customerName: "Budi Santoso",
      customerType: "hotspot",
      profileName: "Daily 5 Mbps",
      amount: 150000,
      dueDate: "2024-01-31",
      status: "overdue",
      paidDate: null,
      paidAmount: 0,
      billMonth: "2024-01",
    },
    {
      id: 4,
      customerId: "PPP003",
      customerName: "Dewi Sartika",
      customerType: "pppoe",
      profileName: "15 Mbps Unlimited",
      amount: 400000,
      dueDate: "2024-01-31",
      status: "paid",
      paidDate: "2024-01-30",
      paidAmount: 400000,
      billMonth: "2024-01",
    },
    {
      id: 5,
      customerId: "PPP004",
      customerName: "Rudi Hermawan",
      customerType: "pppoe",
      profileName: "25 Mbps Unlimited",
      amount: 600000,
      dueDate: "2024-01-31",
      status: "partial",
      paidDate: "2024-01-29",
      paidAmount: 300000,
      billMonth: "2024-01",
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: "Paid", variant: "default" as const, icon: CheckCircle },
      pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
      overdue: { label: "Overdue", variant: "destructive" as const, icon: XCircle },
      partial: { label: "Partial", variant: "outline" as const, icon: AlertTriangle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const filteredBills = monthlyBills.filter((bill) => {
    const matchesSearch =
      bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.customerId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter
    const matchesMonth = bill.billMonth === monthFilter
    return matchesSearch && matchesStatus && matchesMonth
  })

  const handleMarkAsPaid = (billId: number) => {
    // Implementation for marking bill as paid
    console.log("Mark as paid:", billId)
  }

  const handleSendReminder = (billId: number) => {
    // Implementation for sending payment reminder
    console.log("Send reminder:", billId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monthly Billing</h1>
          <p className="text-muted-foreground">Manage monthly customer bills and payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Send All Reminders
          </Button>
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Generate Bills
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Monthly Bills</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billMonth">Bill Month</Label>
                  <Input id="billMonth" type="month" defaultValue="2024-01" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input id="dueDate" type="date" defaultValue="2024-01-31" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerType">Customer Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      <SelectItem value="pppoe">PPPoE Only</SelectItem>
                      <SelectItem value="hotspot">Hotspot Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => setIsGenerateDialogOpen(false)}>
                    Generate Bills
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsGenerateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Billing Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingOverview.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(billingOverview.totalBilled)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(billingOverview.totalPaid)}</div>
            <p className="text-xs text-muted-foreground">{billingOverview.paidPercentage}% collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(billingOverview.totalPending)}</div>
            <p className="text-xs text-muted-foreground">Pending payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Bills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Monthly Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input type="month" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="w-40" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{bill.customerName}</div>
                      <div className="text-sm text-muted-foreground">{bill.customerId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{bill.customerType.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>{bill.profileName}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(bill.amount)}</TableCell>
                  <TableCell>{bill.dueDate}</TableCell>
                  <TableCell>{getStatusBadge(bill.status)}</TableCell>
                  <TableCell>
                    {bill.paidAmount > 0 ? (
                      <div>
                        <div className="font-medium text-green-600">{formatCurrency(bill.paidAmount)}</div>
                        {bill.paidDate && <div className="text-xs text-muted-foreground">{bill.paidDate}</div>}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {bill.status !== "paid" && (
                        <Button variant="ghost" size="sm" onClick={() => handleMarkAsPaid(bill.id)}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleSendReminder(bill.id)}>
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
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
