"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Clock, Settings, Play, Pause, AlertCircle, CheckCircle, Plus, Edit } from "lucide-react"

export default function AutoBillingPage() {
  const [autoBillingEnabled, setAutoBillingEnabled] = useState(true)
  const [autoDisableEnabled, setAutoDisableEnabled] = useState(true)
  const [billingDay, setBillingDay] = useState(1)
  const [gracePeriod, setGracePeriod] = useState(7)
  const [reminderDays, setReminderDays] = useState([3, 1])

  // Mock data for scheduled tasks
  const scheduledTasks = [
    {
      id: 1,
      name: "Monthly Invoice Generation",
      type: "billing",
      schedule: "0 1 1 * *", // 1st day of month at 1 AM
      nextRun: "2024-02-01 01:00:00",
      lastRun: "2024-01-01 01:00:00",
      status: "active",
      description: "Generate monthly invoices for all active users",
    },
    {
      id: 2,
      name: "Payment Reminder - 3 Days",
      type: "reminder",
      schedule: "0 9 * * *", // Daily at 9 AM
      nextRun: "2024-01-11 09:00:00",
      lastRun: "2024-01-10 09:00:00",
      status: "active",
      description: "Send WhatsApp reminders 3 days before due date",
    },
    {
      id: 3,
      name: "Payment Reminder - 1 Day",
      type: "reminder",
      schedule: "0 9 * * *", // Daily at 9 AM
      nextRun: "2024-01-11 09:00:00",
      lastRun: "2024-01-10 09:00:00",
      status: "active",
      description: "Send WhatsApp reminders 1 day before due date",
    },
    {
      id: 4,
      name: "Auto Disable Unpaid Users",
      type: "disable",
      schedule: "0 2 * * *", // Daily at 2 AM
      nextRun: "2024-01-11 02:00:00",
      lastRun: "2024-01-10 02:00:00",
      status: "active",
      description: "Disable users with overdue payments after grace period",
    },
    {
      id: 5,
      name: "Expiry Notification",
      type: "expiry",
      schedule: "0 8 * * *", // Daily at 8 AM
      nextRun: "2024-01-11 08:00:00",
      lastRun: "2024-01-10 08:00:00",
      status: "active",
      description: "Notify users about upcoming service expiry",
    },
  ]

  const billingHistory = [
    {
      id: 1,
      date: "2024-01-01",
      type: "Monthly Billing",
      usersProcessed: 1250,
      invoicesGenerated: 1250,
      totalAmount: 125000000,
      status: "completed",
      duration: "45 minutes",
    },
    {
      id: 2,
      date: "2024-01-10",
      type: "Payment Reminder",
      usersProcessed: 234,
      invoicesGenerated: 0,
      totalAmount: 0,
      status: "completed",
      duration: "12 minutes",
    },
    {
      id: 3,
      date: "2024-01-08",
      type: "Auto Disable",
      usersProcessed: 45,
      invoicesGenerated: 0,
      totalAmount: 0,
      status: "completed",
      duration: "8 minutes",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "billing":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "reminder":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case "disable":
        return <Pause className="h-4 w-4 text-red-600" />
      case "expiry":
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return <Settings className="h-4 w-4 text-gray-600" />
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auto Billing & Scheduling</h1>
          <p className="text-muted-foreground">Automated billing processes and scheduled task management</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Scheduled Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task-name">Task Name</Label>
                  <Input id="task-name" placeholder="Enter task name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-type">Task Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="billing">Monthly Billing</SelectItem>
                      <SelectItem value="reminder">Payment Reminder</SelectItem>
                      <SelectItem value="disable">Auto Disable</SelectItem>
                      <SelectItem value="expiry">Expiry Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule (Cron)</Label>
                  <Input id="schedule" placeholder="0 1 1 * *" />
                  <p className="text-xs text-muted-foreground">Format: minute hour day month weekday</p>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Create Task</Button>
                  <Button variant="outline" className="flex-1">
                    Cancel
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

      {/* Auto Billing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Auto Billing Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-billing">Auto Billing</Label>
                  <p className="text-sm text-muted-foreground">Automatically generate monthly invoices</p>
                </div>
                <Switch id="auto-billing" checked={autoBillingEnabled} onCheckedChange={setAutoBillingEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-disable">Auto Disable</Label>
                  <p className="text-sm text-muted-foreground">Automatically disable unpaid users</p>
                </div>
                <Switch id="auto-disable" checked={autoDisableEnabled} onCheckedChange={setAutoDisableEnabled} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="billing-day">Billing Day</Label>
                <Select value={billingDay.toString()} onValueChange={(value) => setBillingDay(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        Day {day} of month
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grace-period">Grace Period (Days)</Label>
                <Input
                  id="grace-period"
                  type="number"
                  min="1"
                  max="30"
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Reminder Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>First Reminder</Label>
                <Select value="3" onValueChange={() => {}}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day before</SelectItem>
                    <SelectItem value="3">3 days before</SelectItem>
                    <SelectItem value="7">7 days before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Final Reminder</Label>
                <Select value="1" onValueChange={() => {}}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day before</SelectItem>
                    <SelectItem value="0">On due date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reminder Time</Label>
                <Input type="time" defaultValue="09:00" />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button>Save Configuration</Button>
            <Button variant="outline">Test Settings</Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Last Run</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.name}</div>
                      <div className="text-sm text-muted-foreground">{task.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(task.type)}
                      <span className="capitalize">{task.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{task.schedule}</TableCell>
                  <TableCell>{task.nextRun}</TableCell>
                  <TableCell>{task.lastRun}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Pause className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Recent Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Users Processed</TableHead>
                <TableHead>Invoices Generated</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((history) => (
                <TableRow key={history.id}>
                  <TableCell>{history.date}</TableCell>
                  <TableCell>{history.type}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{history.usersProcessed}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{history.invoicesGenerated}</Badge>
                  </TableCell>
                  <TableCell>{history.totalAmount > 0 ? formatCurrency(history.totalAmount) : "-"}</TableCell>
                  <TableCell>{history.duration}</TableCell>
                  <TableCell>{getStatusBadge(history.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* System Status */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Billing Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Feb 1, 2024</div>
            <p className="text-xs text-muted-foreground">01:00 AM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">234</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">45</div>
            <p className="text-xs text-muted-foreground">Grace period active</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
