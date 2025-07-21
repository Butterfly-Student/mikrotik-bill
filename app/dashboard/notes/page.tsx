"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  StickyNote,
  Pin,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Users,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function NotesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)


  useEffect(() => {
      if (status === "loading") return
  
      if (!session) {
        router.push("/login")
      }
    }, [session, status, router])

  // Mock notes data with role-based visibility
  const allNotes = [
    {
      id: 1,
      title: "Network Maintenance Schedule",
      content: "Plan maintenance for core router on Sunday 2AM-4AM. Notify all customers 24h before.",
      category: "technical",
      priority: "high",
      status: "pending",
      isPinned: true,
      reminderDate: "2024-01-15",
      visibility: ["admin", "operator"],
      autoSendWa: true,
      waRecipients: [
        { name: "Admin Team", phone: "+6281234567890", role: "admin" },
        { name: "Network Operator", phone: "+6281234567891", role: "operator" },
      ],
      tags: ["maintenance", "network", "urgent"],
      createdBy: "admin",
      createdAt: "2024-01-10 14:30",
      completedAt: null,
      completedBy: null,
    },
    {
      id: 2,
      title: "Customer Payment Follow-up",
      content: "Follow up with customers who have overdue payments > 30 days. Send final notice before disconnection.",
      category: "financial",
      priority: "medium",
      status: "in_progress",
      isPinned: false,
      reminderDate: "2024-01-12",
      visibility: ["admin", "operator"],
      autoSendWa: false,
      waRecipients: [],
      tags: ["payment", "follow-up"],
      createdBy: "admin",
      createdAt: "2024-01-08 10:15",
      completedAt: null,
      completedBy: null,
    },
    {
      id: 3,
      title: "Monthly Report Generation",
      content:
        "Generate monthly performance report for management review. Include revenue, customer growth, and network performance metrics.",
      category: "general",
      priority: "low",
      status: "completed",
      isPinned: false,
      reminderDate: null,
      visibility: ["admin", "viewer"],
      autoSendWa: true,
      waRecipients: [{ name: "Management", phone: "+6281234567892", role: "admin" }],
      tags: ["report", "monthly"],
      createdBy: "admin",
      createdAt: "2024-01-05 09:00",
      completedAt: "2024-01-09 16:30",
      completedBy: "admin",
    },
    {
      id: 4,
      title: "New Equipment Installation",
      content: "Install new access point in Building C. Coordinate with building management for access.",
      category: "technical",
      priority: "medium",
      status: "pending",
      isPinned: false,
      reminderDate: "2024-01-20",
      visibility: ["admin", "operator"],
      autoSendWa: false,
      waRecipients: [],
      tags: ["installation", "equipment"],
      createdBy: "operator1",
      createdAt: "2024-01-09 11:45",
      completedAt: null,
      completedBy: null,
    },
    {
      id: 5,
      title: "Customer Service Training",
      content: "Schedule training session for customer service team on new billing system features.",
      category: "general",
      priority: "low",
      status: "cancelled",
      isPinned: false,
      reminderDate: null,
      visibility: ["admin"],
      autoSendWa: false,
      waRecipients: [],
      tags: ["training", "customer-service"],
      createdBy: "admin",
      createdAt: "2024-01-07 13:20",
      completedAt: null,
      completedBy: null,
    },
  ]
  const user = session?.user
  const userRoles = user?.roles?.map((r) => r.name) || []
  // Filter notes based on user role and visibility
  console.log(userRoles)
  const notes = allNotes.filter((note) => {
    return note.visibility.some((role) => userRoles.includes(role))
  })

  const categories = [
    { value: "general", label: "General", color: "bg-blue-100 text-blue-800" },
    { value: "customer", label: "Customer", color: "bg-green-100 text-green-800" },
    { value: "technical", label: "Technical", color: "bg-purple-100 text-purple-800" },
    { value: "financial", label: "Financial", color: "bg-orange-100 text-orange-800" },
    { value: "reminder", label: "Reminder", color: "bg-yellow-100 text-yellow-800" },
  ]

  const priorities = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High", color: "bg-red-100 text-red-800" },
  ]

  const statuses = [
    { value: "pending", label: "Pending", icon: Clock, color: "bg-gray-100 text-gray-800" },
    { value: "in_progress", label: "In Progress", icon: AlertTriangle, color: "bg-blue-100 text-blue-800" },
    { value: "completed", label: "Completed", icon: CheckCircle, color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "Cancelled", icon: Trash2, color: "bg-red-100 text-red-800" },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = statuses.find((s) => s.value === status)
    if (!statusConfig) return null

    const Icon = statusConfig.icon
    return (
      <Badge className={statusConfig.color}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = priorities.find((p) => p.value === priority)
    if (!priorityConfig) return null

    return <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>
  }

  const getCategoryBadge = (category: string) => {
    const categoryConfig = categories.find((c) => c.value === category)
    if (!categoryConfig) return null

    return <Badge className={categoryConfig.color}>{categoryConfig.label}</Badge>
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || note.category === categoryFilter
    const matchesStatus = statusFilter === "all" || note.status === statusFilter
    const matchesPriority = priorityFilter === "all" || note.priority === priorityFilter
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority
  })

  const handleCompleteNote = (noteId: number) => {
    // Implementation for completing note and sending WhatsApp
    console.log("Complete note:", noteId)
    // Here would be the logic to:
    // 1. Update note status to completed
    // 2. Set completed_at and completed_by
    // 3. If auto_send_wa is true, send WhatsApp to recipients
  }

  const handleTogglePin = (noteId: number) => {
    console.log("Toggle pin:", noteId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes Management</h1>
          <p className="text-muted-foreground">Organize tasks, reminders, and important information</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="Enter note title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea id="content" placeholder="Enter note content" rows={6} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reminderDate">Reminder Date</Label>
                  <Input id="reminderDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input id="tags" placeholder="tag1, tag2, tag3" />
                </div>
              </div>

              {/* Right Column - Visibility & WhatsApp Settings */}
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Visibility Settings</Label>
                  <div className="border rounded-lg p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">Select which roles can view this note</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="vis-admin" defaultChecked />
                        <Label htmlFor="vis-admin">Admin</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="vis-operator" />
                        <Label htmlFor="vis-operator">Operator</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="vis-viewer" />
                        <Label htmlFor="vis-viewer">Viewer</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="auto-wa" />
                    <Label htmlFor="auto-wa" className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Auto-send WhatsApp when completed
                    </Label>
                  </div>

                  <div className="border rounded-lg p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">Select recipients for WhatsApp notification</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="wa-admin" />
                          <Label htmlFor="wa-admin">Admin Team</Label>
                        </div>
                        <span className="text-xs text-muted-foreground">+6281234567890</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="wa-operator" />
                          <Label htmlFor="wa-operator">Network Operator</Label>
                        </div>
                        <span className="text-xs text-muted-foreground">+6281234567891</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="wa-viewer" />
                          <Label htmlFor="wa-viewer">Report Viewer</Label>
                        </div>
                        <span className="text-xs text-muted-foreground">+6281234567892</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="pin-note" />
                  <Label htmlFor="pin-note" className="flex items-center gap-2">
                    <Pin className="h-4 w-4" />
                    Pin this note
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                Create Note
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Notes Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <StickyNote className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
            <p className="text-xs text-muted-foreground">Accessible to you</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.filter((n) => n.status === "pending").length}</div>
            <p className="text-xs text-muted-foreground">Awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.filter((n) => n.status === "completed").length}</div>
            <p className="text-xs text-muted-foreground">Finished tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pinned</CardTitle>
            <Pin className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.filter((n) => n.isPinned).length}</div>
            <p className="text-xs text-muted-foreground">Important notes</p>
          </CardContent>
        </Card>
      </div>

      {/* Notes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Notes & Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Reminder</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      {note.isPinned && <Pin className="h-4 w-4 text-purple-600 mt-0.5" />}
                      <div>
                        <div className="font-medium">{note.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{note.content}</div>
                        {note.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {note.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(note.category)}</TableCell>
                  <TableCell>{getPriorityBadge(note.priority)}</TableCell>
                  <TableCell>{getStatusBadge(note.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span className="text-xs">{note.visibility.join(", ")}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {note.autoSendWa ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <MessageSquare className="h-3 w-3" />
                        <span className="text-xs">Auto</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {note.reminderDate ? (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-xs">{note.reminderDate}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>{note.createdAt}</div>
                      <div className="text-muted-foreground">by {note.createdBy}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {note.status !== "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompleteNote(note.id)}
                          title="Mark as completed"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePin(note.id)}
                        title={note.isPinned ? "Unpin note" : "Pin note"}
                      >
                        <Pin className={`h-4 w-4 ${note.isPinned ? "text-purple-600" : ""}`} />
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
