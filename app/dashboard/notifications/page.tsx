"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  Check,
  Trash2,
  User,
  CreditCard,
  Settings,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Mock notifications data
const notifications = [
  {
    id: 1,
    type: "user",
    title: "New User Registration",
    message: "John Doe has registered as a new hotspot user and is waiting for approval.",
    timestamp: "2 minutes ago",
    read: false,
    priority: "medium",
    icon: User,
    color: "blue",
  },
  {
    id: 2,
    type: "payment",
    title: "Payment Failed",
    message: "Payment for invoice #INV-001 has failed. Customer needs to update payment method.",
    timestamp: "5 minutes ago",
    read: false,
    priority: "high",
    icon: CreditCard,
    color: "red",
  },
  {
    id: 3,
    type: "system",
    title: "System Update Complete",
    message: "System has been successfully updated to version 2.1.0. All services are running normally.",
    timestamp: "1 hour ago",
    read: false,
    priority: "low",
    icon: Settings,
    color: "green",
  },
  {
    id: 4,
    type: "alert",
    title: "High Bandwidth Usage",
    message: "Server bandwidth usage has exceeded 80%. Consider upgrading your plan.",
    timestamp: "2 hours ago",
    read: true,
    priority: "high",
    icon: AlertTriangle,
    color: "orange",
  },
  {
    id: 5,
    type: "user",
    title: "User Account Suspended",
    message: "User account 'jane.smith' has been suspended due to payment issues.",
    timestamp: "3 hours ago",
    read: true,
    priority: "medium",
    icon: User,
    color: "red",
  },
  {
    id: 6,
    type: "payment",
    title: "Payment Received",
    message: "Payment of Rp 150,000 has been received from customer ID #12345.",
    timestamp: "4 hours ago",
    read: true,
    priority: "low",
    icon: CreditCard,
    color: "green",
  },
  {
    id: 7,
    type: "system",
    title: "Backup Completed",
    message: "Daily system backup has been completed successfully. All data is secure.",
    timestamp: "6 hours ago",
    read: true,
    priority: "low",
    icon: CheckCircle,
    color: "green",
  },
  {
    id: 8,
    type: "alert",
    title: "Mikrotik Connection Lost",
    message: "Connection to Mikrotik router has been lost. Please check network connectivity.",
    timestamp: "1 day ago",
    read: true,
    priority: "high",
    icon: XCircle,
    color: "red",
  },
]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500"
    case "medium":
      return "bg-yellow-500"
    case "low":
      return "bg-green-500"
    default:
      return "bg-gray-500"
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "user":
      return User
    case "payment":
      return CreditCard
    case "system":
      return Settings
    case "alert":
      return AlertTriangle
    default:
      return Info
  }
}

export default function NotificationsPage() {
  const [notificationList, setNotificationList] = useState(notifications)
  const [activeTab, setActiveTab] = useState("all")

  const unreadCount = notificationList.filter((n) => !n.read).length
  const filteredNotifications = notificationList.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.read
    return notification.type === activeTab
  })

  const markAsRead = (id: number) => {
    setNotificationList((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotificationList((prev) => prev.filter((notification) => notification.id !== id))
  }

  const deleteAllRead = () => {
    setNotificationList((prev) => prev.filter((notification) => !notification.read))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">Manage your notifications and stay updated with system events</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" onClick={deleteAllRead}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Read
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationList.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationList.filter((n) => n.priority === "high").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {notificationList.filter((n) => n.timestamp.includes("minute") || n.timestamp.includes("hour")).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && <Badge className="ml-1 text-xs">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="user">Users</TabsTrigger>
          <TabsTrigger value="payment">Payments</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="alert">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground text-center">
                  {activeTab === "unread"
                    ? "All caught up! No unread notifications."
                    : "No notifications found for this category."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => {
                const IconComponent = getTypeIcon(notification.type)
                return (
                  <Card
                    key={notification.id}
                    className={cn(
                      "transition-all hover:shadow-md",
                      !notification.read && "border-l-4 border-l-blue-500 bg-blue-50/50",
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            notification.color === "blue" && "bg-blue-100 text-blue-600",
                            notification.color === "red" && "bg-red-100 text-red-600",
                            notification.color === "green" && "bg-green-100 text-green-600",
                            notification.color === "orange" && "bg-orange-100 text-orange-600",
                          )}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{notification.title}</h4>
                            <div className={cn("h-2 w-2 rounded-full", getPriorityColor(notification.priority))} />
                            <Badge variant="outline" className="text-xs">
                              {notification.priority}
                            </Badge>
                            {!notification.read && (
                              <Badge variant="default" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                        </div>

                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
