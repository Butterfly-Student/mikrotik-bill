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
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getCurrentUser } from "@/lib/auth"
import {
  Plus,
  Search,
  Upload,
  Eye,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShoppingCart,
  FileText,
} from "lucide-react"

export default function VoucherOrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showOrderDialog, setShowOrderDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)

  const user = getCurrentUser()
  const isReseller = user?.role === "reseller"

  // Mock data - in real app, filter by reseller_id for resellers
  const voucherOrders = [
    {
      id: 1,
      orderNumber: "VO-2024-001",
      resellerId: 3,
      resellerName: "Warnet Maju Jaya",
      profile: "Hotspot 1 Hour",
      quantity: 50,
      prefix: "VOC",
      unitPrice: 5000,
      totalAmount: 250000,
      status: "pending",
      paymentMethod: null,
      paymentProof: null,
      notes: "Voucher untuk event weekend",
      createdAt: "2024-01-10 10:00:00",
      expiresAt: "2024-01-12 10:00:00",
      paidAt: null,
      generatedAt: null,
    },
    {
      id: 2,
      orderNumber: "VO-2024-002",
      resellerId: 3,
      resellerName: "Warnet Maju Jaya",
      profile: "Hotspot 1 Day",
      quantity: 100,
      prefix: "DAY",
      unitPrice: 15000,
      totalAmount: 1500000,
      status: "paid",
      paymentMethod: "Bank Transfer",
      paymentProof: "/uploads/payment-proof-002.jpg",
      notes: "Pembayaran via BCA",
      createdAt: "2024-01-09 14:30:00",
      expiresAt: "2024-01-11 14:30:00",
      paidAt: "2024-01-09 16:45:00",
      generatedAt: null,
    },
    {
      id: 3,
      orderNumber: "VO-2024-003",
      resellerId: 3,
      resellerName: "Warnet Maju Jaya",
      profile: "Hotspot 1 Hour",
      quantity: 25,
      prefix: "HOUR",
      unitPrice: 5000,
      totalAmount: 125000,
      status: "generated",
      paymentMethod: "Bank Transfer",
      paymentProof: "/uploads/payment-proof-003.jpg",
      notes: "Voucher sudah di-generate",
      createdAt: "2024-01-08 09:15:00",
      expiresAt: "2024-01-10 09:15:00",
      paidAt: "2024-01-08 11:30:00",
      generatedAt: "2024-01-08 12:00:00",
    },
  ]

  const profiles = [
    { id: 1, name: "Hotspot 1 Hour", price: 5000 },
    { id: 2, name: "Hotspot 1 Day", price: 15000 },
    { id: 3, name: "Hotspot 1 Week", price: 50000 },
  ]

  const [orderForm, setOrderForm] = useState({
    profileId: "",
    quantity: 50,
    prefix: "VOC",
    notes: "",
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending Payment
          </Badge>
        )
      case "paid":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CreditCard className="h-3 w-3 mr-1" />
            Paid - Generating
          </Badge>
        )
      case "generated":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Generated
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
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

  const calculateTotal = () => {
    const profile = profiles.find((p) => p.id.toString() === orderForm.profileId)
    return profile ? profile.price * orderForm.quantity : 0
  }

  const submitOrder = () => {
    const profile = profiles.find((p) => p.id.toString() === orderForm.profileId)
    if (!profile) return

    const newOrder = {
      id: Date.now(),
      orderNumber: `VO-2024-${String(Date.now()).slice(-3)}`,
      resellerId: user?.resellerId || 3,
      resellerName: user?.name || "Current Reseller",
      profile: profile.name,
      quantity: orderForm.quantity,
      prefix: orderForm.prefix,
      unitPrice: profile.price,
      totalAmount: calculateTotal(),
      status: "pending",
      notes: orderForm.notes,
      createdAt: new Date().toLocaleString("sv-SE").replace("T", " "),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleString("sv-SE").replace("T", " "),
    }

    console.log("New voucher order:", newOrder)
    setShowOrderDialog(false)
    setOrderForm({ profileId: "", quantity: 50, prefix: "VOC", notes: "" })
  }

  const filteredOrders = voucherOrders.filter((order) => {
    // For resellers, only show their own orders
    if (isReseller && order.resellerId !== (user?.resellerId || 3)) {
      return false
    }

    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profile.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.resellerName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = {
    totalOrders: filteredOrders.length,
    pendingOrders: filteredOrders.filter((o) => o.status === "pending").length,
    paidOrders: filteredOrders.filter((o) => o.status === "paid").length,
    generatedOrders: filteredOrders.filter((o) => o.status === "generated").length,
    totalAmount: filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isReseller ? "My Voucher Orders" : "Voucher Orders Management"}</h1>
          <p className="text-muted-foreground">
            {isReseller
              ? "Order vouchers and track your payment status"
              : "Manage reseller voucher orders and payments"}
          </p>
        </div>
        {isReseller && (
          <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Order Vouchers
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Order New Vouchers</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Vouchers will be generated after payment confirmation (max 48 hours).
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="profile">Voucher Profile</Label>
                  <Select
                    value={orderForm.profileId}
                    onValueChange={(value) => setOrderForm((prev) => ({ ...prev, profileId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id.toString()}>
                          {profile.name} - {formatCurrency(profile.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="1000"
                      value={orderForm.quantity}
                      onChange={(e) => setOrderForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prefix">Prefix</Label>
                    <Input
                      id="prefix"
                      value={orderForm.prefix}
                      onChange={(e) => setOrderForm((prev) => ({ ...prev, prefix: e.target.value }))}
                      placeholder="VOC"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm((prev) => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes for this order..."
                    rows={3}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Amount:</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(calculateTotal())}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {orderForm.quantity} vouchers ×{" "}
                    {formatCurrency(profiles.find((p) => p.id.toString() === orderForm.profileId)?.price || 0)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={submitOrder} disabled={!orderForm.profileId} className="flex-1">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Place Order
                  </Button>
                  <Button variant="outline" onClick={() => setShowOrderDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.generatedOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
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
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="generated">Generated</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                {!isReseller && <TableHead>Reseller</TableHead>}
                <TableHead>Profile</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  {!isReseller && <TableCell>{order.resellerName}</TableCell>}
                  <TableCell>{order.profile}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.quantity}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.totalAmount)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{order.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order)
                          // Open detail dialog
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === "pending" && isReseller && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowPaymentDialog(true)
                          }}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      )}
                      {order.status === "generated" && (
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Upload Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Payment Proof</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedOrder && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order:</span>
                    <span className="font-medium">{selectedOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <span className="font-medium text-red-600">{selectedOrder.expiresAt}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="e-wallet">E-Wallet</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-proof">Payment Proof</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes</Label>
              <Textarea id="payment-notes" placeholder="Additional payment information..." rows={3} />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Submit Payment
              </Button>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
