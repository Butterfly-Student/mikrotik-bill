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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Clock,
  MessageSquare,
  Mail,
  Smartphone,
  Bell,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Search,
  Users,
  Settings,
} from "lucide-react"

export default function SchedulePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)

  // Mock reminder templates
  const reminderTemplates = [
    {
      id: 1,
      name: "Payment Reminder",
      category: "billing",
      content:
        "Halo {name}, tagihan bulan {month} sebesar {amount} akan jatuh tempo pada {due_date}. Mohon segera lakukan pembayaran. Terima kasih.",
      variables: ["name", "month", "amount", "due_date"],
      createdAt: "2024-01-01",
    },
    {
      id: 2,
      name: "Service Expiry",
      category: "service",
      content:
        "Halo {name}, layanan {service} Anda akan berakhir pada {expiry_date}. Silakan perpanjang untuk melanjutkan layanan.",
      variables: ["name", "service", "expiry_date"],
      createdAt: "2024-01-02",
    },
    {
      id: 3,
      name: "Maintenance Notice",
      category: "maintenance",
      content:
        "Pemberitahuan: Akan ada maintenance jaringan pada {date} pukul {time}. Layanan mungkin terganggu sementara.",
      variables: ["date", "time"],
      createdAt: "2024-01-03",
    },
  ]

  // Mock scheduled tasks
  const scheduledTasks = [
    {
      id: 1,
      name: "Monthly Payment Reminder",
      templateId: 1,
      templateName: "Payment Reminder",
      schedule: "monthly",
      scheduleDetail: "Every 25th of month at 09:00",
      targetAudience: "pppoe",
      channels: ["whatsapp", "email"],
      status: "active",
      lastRun: "2024-01-25 09:00:00",
      nextRun: "2024-02-25 09:00:00",
      totalSent: 145,
    },
    {
      id: 2,
      name: "Service Expiry Alert",
      templateId: 2,
      templateName: "Service Expiry",
      schedule: "daily",
      scheduleDetail: "Daily at 08:00",
      targetAudience: "hotspot",
      channels: ["whatsapp"],
      status: "active",
      lastRun: "2024-01-10 08:00:00",
      nextRun: "2024-01-11 08:00:00",
      totalSent: 23,
    },
    {
      id: 3,
      name: "Weekly Maintenance Notice",
      templateId: 3,
      templateName: "Maintenance Notice",
      schedule: "weekly",
      scheduleDetail: "Every Sunday at 20:00",
      targetAudience: "all",
      channels: ["whatsapp", "email", "notification"],
      status: "paused",
      lastRun: "2024-01-07 20:00:00",
      nextRun: null,
      totalSent: 450,
    },
  ]

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary">Paused</Badge>
    )
  }

  const getChannelIcons = (channels: string[]) => {
    const iconMap = {
      whatsapp: MessageSquare,
      email: Mail,
      sms: Smartphone,
      notification: Bell,
    }

    return (
      <div className="flex gap-1">
        {channels.map((channel) => {
          const Icon = iconMap[channel as keyof typeof iconMap]
          return Icon ? <Icon key={channel} className="h-4 w-4" /> : null
        })}
      </div>
    )
  }

  const filteredTasks = scheduledTasks.filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesType = typeFilter === "all" || task.targetAudience === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Schedule Tasks</h1>
          <p className="text-muted-foreground">Manage automated reminders and scheduled notifications</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Manage Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Reminder Templates</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Create and manage message templates with dynamic variables
                  </p>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                  </Button>
                </div>
                <div className="space-y-3">
                  {reminderTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{template.content}</p>
                      <div className="flex gap-1 flex-wrap">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="secondary" className="text-xs">
                            {`{${variable}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Scheduled Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="taskName">Task Name</Label>
                    <Input id="taskName" placeholder="Enter task name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template">Template</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {reminderTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id.toString()}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Schedule Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="once">Once</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="pppoe">PPPoE Users</SelectItem>
                        <SelectItem value="hotspot">Hotspot Users</SelectItem>
                        <SelectItem value="reseller">Resellers</SelectItem>
                        <SelectItem value="admin">Admin Staff</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Delivery Channels</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="whatsapp" />
                      <Label htmlFor="whatsapp" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        WhatsApp
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="email" />
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="sms" />
                      <Label htmlFor="sms" className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        SMS
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notification" />
                      <Label htmlFor="notification" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        In-App
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => setIsTaskDialogOpen(false)}>
                    Create Task
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setIsTaskDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tasks Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledTasks.filter((t) => t.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Running tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Settings className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminderTemplates.length}</div>
            <p className="text-xs text-muted-foreground">Available templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledTasks.reduce((sum, task) => sum + task.totalSent, 0)}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">Delivery success</p>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
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
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                <SelectItem value="pppoe">PPPoE</SelectItem>
                <SelectItem value="hotspot">Hotspot</SelectItem>
                <SelectItem value="reseller">Reseller</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.name}</TableCell>
                  <TableCell>{task.templateName}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{task.schedule}</div>
                      <div className="text-muted-foreground">{task.scheduleDetail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{task.targetAudience.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>{getChannelIcons(task.channels)}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    {task.nextRun ? (
                      <div className="text-sm">{task.nextRun}</div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{task.totalSent}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        {task.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
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
