"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Router } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PPPoEProfilesPage() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState(null)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    rate_limit_tx: "",
    rate_limit_rx: "",
    session_timeout: "",
    idle_timeout: "",
    address_pool: "",
    dns_server: "",
    only_one: false,
    is_active: true,
    description: "",
  })

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const response = await fetch("/api/mikrotik/pppoe/profiles")
      const data = await response.json()
      if (data.success) {
        setProfiles(data.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch PPPoE profiles",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingProfile ? `/api/mikrotik/pppoe/profiles/${editingProfile.id}` : "/api/mikrotik/pppoe/profiles"
      const method = editingProfile ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: `PPPoE profile ${editingProfile ? "updated" : "created"} successfully`,
        })
        setIsDialogOpen(false)
        resetForm()
        fetchProfiles()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save PPPoE profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (profile) => {
    setEditingProfile(profile)
    setFormData({
      name: profile.name,
      rate_limit_tx: profile.rate_limit_tx || "",
      rate_limit_rx: profile.rate_limit_rx || "",
      session_timeout: profile.session_timeout || "",
      idle_timeout: profile.idle_timeout || "",
      address_pool: profile.address_pool || "",
      dns_server: profile.dns_server || "",
      only_one: profile.only_one || false,
      is_active: profile.is_active,
      description: profile.description || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (profileId) => {
    if (!confirm("Are you sure you want to delete this PPPoE profile?")) return

    try {
      const response = await fetch(`/api/mikrotik/pppoe/profiles/${profileId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "PPPoE profile deleted successfully",
        })
        fetchProfiles()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete PPPoE profile",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      rate_limit_tx: "",
      rate_limit_rx: "",
      session_timeout: "",
      idle_timeout: "",
      address_pool: "",
      dns_server: "",
      only_one: false,
      is_active: true,
      description: "",
    })
    setEditingProfile(null)
  }

  const formatBandwidth = (value) => {
    if (!value) return "Unlimited"
    const num = Number.parseInt(value)
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return `${num}`
  }

  if (loading && profiles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">PPPoE Profiles</h1>
          <p className="text-muted-foreground">Manage PPPoE service profiles and configurations</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProfile ? "Edit" : "Add"} PPPoE Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Profile Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_pool">Address Pool</Label>
                  <Input
                    id="address_pool"
                    value={formData.address_pool}
                    onChange={(e) => setFormData({ ...formData, address_pool: e.target.value })}
                    placeholder="pool1"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Rate Limits</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rate_limit_tx">Upload Rate (bps)</Label>
                    <Input
                      id="rate_limit_tx"
                      value={formData.rate_limit_tx}
                      onChange={(e) => setFormData({ ...formData, rate_limit_tx: e.target.value })}
                      placeholder="1000000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rate_limit_rx">Download Rate (bps)</Label>
                    <Input
                      id="rate_limit_rx"
                      value={formData.rate_limit_rx}
                      onChange={(e) => setFormData({ ...formData, rate_limit_rx: e.target.value })}
                      placeholder="2000000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Timeouts</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="session_timeout">Session Timeout (seconds)</Label>
                    <Input
                      id="session_timeout"
                      value={formData.session_timeout}
                      onChange={(e) => setFormData({ ...formData, session_timeout: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="idle_timeout">Idle Timeout (seconds)</Label>
                    <Input
                      id="idle_timeout"
                      value={formData.idle_timeout}
                      onChange={(e) => setFormData({ ...formData, idle_timeout: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dns_server">DNS Server</Label>
                <Input
                  id="dns_server"
                  value={formData.dns_server}
                  onChange={(e) => setFormData({ ...formData, dns_server: e.target.value })}
                  placeholder="8.8.8.8,8.8.4.4"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Options</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="only_one"
                      checked={formData.only_one}
                      onCheckedChange={(checked) => setFormData({ ...formData, only_one: checked })}
                    />
                    <Label htmlFor="only_one">Only One Session</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Profile description..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Saving..." : editingProfile ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{profiles.filter((p) => p.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Inactive Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{profiles.filter((p) => !p.is_active).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Users Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.reduce((sum, p) => sum + (p.user_count || 0), 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Profiles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rate Limits</TableHead>
                <TableHead>Address Pool</TableHead>
                <TableHead>Timeouts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Router className="h-4 w-4 text-blue-600" />
                      {profile.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>↑ {formatBandwidth(profile.rate_limit_tx)}</div>
                      <div>↓ {formatBandwidth(profile.rate_limit_rx)}</div>
                    </div>
                  </TableCell>
                  <TableCell>{profile.address_pool || "Default"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Session: {profile.session_timeout || "∞"}</div>
                      <div>Idle: {profile.idle_timeout || "∞"}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {profile.is_active ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{profile.user_count || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(profile)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(profile.id)}
                      >
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
