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
import { Plus, Search, FileText, Send, Eye, Download, DollarSign, Calendar, AlertCircle } from "lucide-react"

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Mock data
  const invoices = [
    {
      id: 1,
      invoiceNumber: "INV-2024-001",
      customerName: "PT. Digital Solutions",
      customerEmail: "billing@digitalsolutions.com",
      amount: 500000,
      taxAmount: 50000,
      totalAmount: 550000,
      status: "paid",
      dueDate: "2024-01-15",
      paidAt: "2024-01-12",
      createdAt: "2024-01-01",
      items: [{ description: "Hotspot Package - 50 Users", quantity: 1, unitPrice: 500000, totalPrice: 500000 }],
    },
    {
      id: 2,
      invoiceNumber: "INV-2024-002",
      customerName: "CV. Internet Cafe",
      customerEmail: "owner@internetcafe.com",
      amount: 750000,
      taxAmount: 75000,
      totalAmount: 825000,
      status: "pending",
      dueDate: "2024-01-20",
      paidAt: null,
      createdAt: "2024-01-05",
      items: [{ description: "PPPoE Unlimited - 10 Users", quantity: 10, unitPrice: 75000, totalPrice: 750000 }],
    },
    {
      id: 3,
      invoiceNumber: "INV-2024-003",
      customerName: "Warnet Maju Jaya",
      customerEmail: "admin@majujaya.com",
      amount: 300000,
      taxAmount: 30000,
      totalAmount: 330000,
      status: "overdue",
      dueDate: "2024-01-10",
      paidAt: null,
      createdAt: "2023-12-25",
      items: [{ description: "Voucher Package - 100 Vouchers", quantity: 1, unitPrice: 300000, totalPrice: 300000 }],
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>
      case "cancelled":
        return <Badge variant="secondary">Cancelled</Badge>
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

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalStats = {
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter((i) => i.status === "paid").length,
    pendingAmount: invoices.filter((i) => i.status === "pending").reduce((sum, i) => sum + i.totalAmount, 0),
    overdueAmount: invoices.filter((i) => i.status === "overdue").reduce((sum, i) => sum + i.totalAmount, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">Create, manage, and track customer invoices and payments</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer1">PT. Digital Solutions</SelectItem>
                        <SelectItem value="customer2">CV. Internet Cafe</SelectItem>
                        <SelectItem value="customer3">Warnet Maju Jaya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input id="due-date" type="date" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Invoice Items</h3>
                    <Button variant="outline" size="sm">
                      Add Item
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                      <div className="col-span-5">Description</div>
                      <div className="col-span-2">Quantity</div>
                      <div className="col-span-2">Unit Price</div>
                      <div className="col-span-2">Total</div>
                      <div className="col-span-1">Action</div>
                    </div>
                    <div className="grid grid-cols-12 gap-2">
                      <Input className="col-span-5" placeholder="Item description" />
                      <Input className="col-span-2" type="number" placeholder="1" />
                      <Input className="col-span-2" type="number" placeholder="100000" />
                      <div className="col-span-2 flex items-center px-3 py-2 text-sm">Rp 100,000</div>
                      <Button variant="ghost" size="sm" className="col-span-1">
                        ×
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>Rp 100,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>Rp 10,000</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>Rp 110,000</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">Create Invoice</Button>
                  <Button variant="outline" className="flex-1">
                    Save as Draft
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Send className="h-4 w-4 mr-2" />
            Send Reminders
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">{totalStats.paidInvoices} paid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalStats.pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalStats.overdueAmount)}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((totalStats.paidInvoices / totalStats.totalInvoices) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Payment success rate</p>
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
                placeholder="Search invoices..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{invoice.customerName}</div>
                      <div className="text-sm text-muted-foreground">{invoice.customerEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatCurrency(invoice.totalAmount)}</div>
                      <div className="text-sm text-muted-foreground">+{formatCurrency(invoice.taxAmount)} tax</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <div className={`text-sm ${invoice.status === "overdue" ? "text-red-600 font-medium" : ""}`}>
                      {invoice.dueDate}
                    </div>
                  </TableCell>
                  <TableCell>{invoice.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Send className="h-4 w-4" />
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
