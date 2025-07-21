"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { getCurrentUser } from "@/lib/auth"
import { Search, Download, FileText, Printer, Eye, CheckCircle, XCircle, Ticket } from "lucide-react"

export default function MyVouchersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [orderFilter, setOrderFilter] = useState("all")

  const user = getCurrentUser()

  // Mock data - vouchers generated from reseller orders
  const myVouchers = [
    {
      id: 1,
      username: "HOUR001",
      password: "123456",
      profile: "Hotspot 1 Hour",
      orderNumber: "VO-2024-003",
      batchId: "BATCH-HOUR-001",
      status: "unused",
      createdAt: "2024-01-08 12:00:00",
      expiresAt: "2024-02-08",
      usedAt: null,
      usedBy: null,
    },
    {
      id: 2,
      username: "HOUR002",
      password: "789012",
      profile: "Hotspot 1 Hour",
      orderNumber: "VO-2024-003",
      batchId: "BATCH-HOUR-001",
      status: "used",
      createdAt: "2024-01-08 12:00:00",
      expiresAt: "2024-02-08",
      usedAt: "2024-01-09 14:30:00",
      usedBy: "192.168.1.100",
    },
    {
      id: 3,
      username: "HOUR003",
      password: "345678",
      profile: "Hotspot 1 Hour",
      orderNumber: "VO-2024-003",
      batchId: "BATCH-HOUR-001",
      status: "unused",
      createdAt: "2024-01-08 12:00:00",
      expiresAt: "2024-02-08",
      usedAt: null,
      usedBy: null,
    },
    {
      id: 4,
      username: "HOUR004",
      password: "901234",
      profile: "Hotspot 1 Hour",
      orderNumber: "VO-2024-003",
      batchId: "BATCH-HOUR-001",
      status: "expired",
      createdAt: "2024-01-08 12:00:00",
      expiresAt: "2024-01-08",
      usedAt: null,
      usedBy: null,
    },
  ]

  // Mock order data for filtering
  const myOrders = [
    { orderNumber: "VO-2024-001", status: "pending" },
    { orderNumber: "VO-2024-002", status: "paid" },
    { orderNumber: "VO-2024-003", status: "generated" },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unused":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Ticket className="h-3 w-3 mr-1" />
            Unused
          </Badge>
        )
      case "used":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Used
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredVouchers = myVouchers.filter((voucher) => {
    const matchesSearch =
      voucher.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.batchId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || voucher.status === statusFilter
    const matchesOrder = orderFilter === "all" || voucher.orderNumber === orderFilter

    return matchesSearch && matchesStatus && matchesOrder
  })

  const stats = {
    totalVouchers: myVouchers.length,
    unusedVouchers: myVouchers.filter((v) => v.status === "unused").length,
    usedVouchers: myVouchers.filter((v) => v.status === "used").length,
    expiredVouchers: myVouchers.filter((v) => v.status === "expired").length,
  }

  const exportVouchers = (format: string) => {
    console.log(`Exporting vouchers as ${format}`)
    // Implementation for export functionality
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Vouchers</h1>
          <p className="text-muted-foreground">Monitor and manage your generated vouchers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportVouchers("csv")}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportVouchers("pdf")}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Print Selected
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVouchers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unused</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.unusedVouchers}</div>
            <p className="text-xs text-muted-foreground">Ready to sell</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.usedVouchers}</div>
            <p className="text-xs text-muted-foreground">Sold vouchers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiredVouchers}</div>
            <p className="text-xs text-muted-foreground">Lost revenue</p>
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
            <Select value={orderFilter} onValueChange={setOrderFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                {myOrders.map((order) => (
                  <SelectItem key={order.orderNumber} value={order.orderNumber}>
                    {order.orderNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle>My Vouchers ({filteredVouchers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Used At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVouchers.map((voucher) => (
                <TableRow key={voucher.id}>
                  <TableCell className="font-medium font-mono">{voucher.username}</TableCell>
                  <TableCell className="font-mono">{voucher.password}</TableCell>
                  <TableCell>{voucher.profile}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{voucher.orderNumber}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                  <TableCell>{voucher.createdAt}</TableCell>
                  <TableCell>{voucher.expiresAt}</TableCell>
                  <TableCell>
                    {voucher.usedAt ? (
                      <div className="text-sm">
                        <div>{voucher.usedAt}</div>
                        <div className="text-muted-foreground font-mono">{voucher.usedBy}</div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Voucher Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Username:</span>
                                <div className="font-mono">{voucher.username}</div>
                              </div>
                              <div>
                                <span className="font-medium">Password:</span>
                                <div className="font-mono">{voucher.password}</div>
                              </div>
                              <div>
                                <span className="font-medium">Profile:</span>
                                <div>{voucher.profile}</div>
                              </div>
                              <div>
                                <span className="font-medium">Status:</span>
                                <div>{getStatusBadge(voucher.status)}</div>
                              </div>
                              <div>
                                <span className="font-medium">Order:</span>
                                <div>{voucher.orderNumber}</div>
                              </div>
                              <div>
                                <span className="font-medium">Batch:</span>
                                <div>{voucher.batchId}</div>
                              </div>
                            </div>

                            {voucher.status === "used" && (
                              <div className="p-3 bg-green-50 rounded-lg">
                                <div className="text-sm font-medium text-green-800">Usage Information</div>
                                <div className="text-sm text-green-700">
                                  <div>Used at: {voucher.usedAt}</div>
                                  <div>IP Address: {voucher.usedBy}</div>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1">
                                <FileText className="h-4 w-4 mr-2" />
                                Print
                              </Button>
                              <Button variant="outline" className="flex-1">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Usage Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Voucher Usage Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Usage Rate</span>
                <span className="font-medium">{Math.round((stats.usedVouchers / stats.totalVouchers) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${(stats.usedVouchers / stats.totalVouchers) * 100}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.unusedVouchers}</div>
                  <div className="text-xs text-muted-foreground">Available</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.usedVouchers}</div>
                  <div className="text-xs text-muted-foreground">Sold</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{stats.expiredVouchers}</div>
                  <div className="text-xs text-muted-foreground">Expired</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myVouchers
                .filter((v) => v.status === "used")
                .slice(0, 5)
                .map((voucher) => (
                  <div key={voucher.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <div className="font-medium text-sm">{voucher.username}</div>
                      <div className="text-xs text-muted-foreground">{voucher.profile}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">Used</div>
                      <div className="text-xs text-muted-foreground">{voucher.usedAt}</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
