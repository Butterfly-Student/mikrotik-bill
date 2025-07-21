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
import { Switch } from "@/components/ui/switch"
import { MessageSquare, Send, Settings, Plus, Search, CheckCircle, XCircle, Clock } from "lucide-react"

export default function WhatsAppPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Mock data
  const notifications = [
    {
      id: 1,
      recipient: "+62812345678",
      recipientName: "John Doe",
      message: "Welcome to our service! Your hotspot account has been created.",
      templateName: "welcome_message",
      status: "sent",
      sentAt: "2024-01-10 14:30",
      createdAt: "2024-01-10 14:29",
    },
    {
      id: 2,
      recipient: "+62823456789",
      recipientName: "Jane Smith",
      message: "Your internet package will expire in 1 day. Please renew to continue service.",
      templateName: "expiry_reminder",
      status: "pending",
      sentAt: null,
      createdAt: "2024-01-10 15:00",
    },
    {
      id: 3,
      recipient: "+62834567890",
      recipientName: "Bob Wilson",
      message: "Invoice INV-2024-001 for Rp 550,000 is now available.",
      templateName: "invoice_notification",
      status: "failed",
      sentAt: null,
      errorMessage: "Invalid phone number",
      createdAt: "2024-01-10 13:45",
    },
  ]

  const templates = [
    {
      id: 1,
      name: "welcome_message",
      title: "Welcome Message",
      content:
        "Welcome to {company_name}! Your {service_type} account has been created. Username: {username}, Password: {password}",
      isActive: true,
    },
    {
      id: 2,
      name: "expiry_reminder",
      title: "Expiry Reminder",
      content:
        "Hi {customer_name}, your {service_type} package will expire in {days_left} day(s). Please renew to continue service.",
      isActive: true,
    },
    {
      id: 3,
      name: "invoice_notification",
      title: "Invoice Notification",
      content:
        "Invoice {invoice_number} for {amount} is now available. Due date: {due_date}. Please pay on time to avoid service interruption.",
      isActive: true,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sent
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.recipient.includes(searchTerm) ||
      notification.templateName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalStats = {
    totalSent: notifications.filter((n) => n.status === "sent").length,
    totalPending: notifications.filter((n) => n.status === "pending").length,
    totalFailed: notifications.filter((n) => n.status === "failed").length,
    successRate: Math.round((notifications.filter((n) => n.status === "sent").length / notifications.length) * 100),
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WhatsApp Notifications</h1>
          <p className="text-muted-foreground">Manage automated WhatsApp notifications and message templates</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Send WhatsApp Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Phone</Label>
                  <Input id="recipient" placeholder="+62812345678" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.name}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" placeholder="Type your message here..." rows={4} />
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Send Now</Button>
                  <Button variant="outline" className="flex-1">
                    Schedule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalStats.totalSent}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalStats.totalPending}</div>
            <p className="text-xs text-muted-foreground">Waiting to send</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalStats.totalFailed}</div>
            <p className="text-xs text-muted-foreground">Delivery failed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.successRate}%</div>
            <p className="text-xs text-muted-foreground">Delivery success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Templates Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Message Templates</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Message Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input id="template-name" placeholder="e.g., welcome_message" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-title">Display Title</Label>
                    <Input id="template-title" placeholder="e.g., Welcome Message" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-content">Message Content</Label>
                    <Textarea
                      id="template-content"
                      placeholder="Use variables like {customer_name}, {username}, {password}"
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="template-active" defaultChecked />
                    <Label htmlFor="template-active">Active</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1">Create Template</Button>
                    <Button variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium">{template.title}</h4>
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.content}</p>
                </div>
                <div className="flex gap-1 ml-4">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
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
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications ({filteredNotifications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recipient</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Message Preview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{notification.recipientName}</div>
                      <div className="text-sm text-muted-foreground">{notification.recipient}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{notification.templateName}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate text-sm">{notification.message}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(notification.status)}</TableCell>
                  <TableCell>
                    {notification.sentAt || "-"}
                    {notification.status === "failed" && notification.errorMessage && (
                      <div className="text-xs text-red-600 mt-1">{notification.errorMessage}</div>
                    )}
                  </TableCell>
                  <TableCell>{notification.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
