"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

import { Plus, Download, FileText, Printer, Zap, Eye, Users, Clock, List, Trash2, Edit } from "lucide-react"

interface Profile {
  id: string
  name: string
  validity: string
  timeLimit: string
  dataLimit: string
  price: number
  sellingPrice: number
}

interface Group {
  id: string
  name: string
}

interface Batch {
  id: number
  batch_name: string
  profile_id: string
  group_id: string
  total_generated: number
  length: number
  prefix: string
  characters: string
  password_mode: string
  comment: string
  shared_users: number
  disable: boolean
  created_by: string
  created_at: string
  vouchers?: Voucher[]
}

interface Voucher {
  id: number
  username: string
  password: string
  profile: string
  validity: string
  used: boolean
}

interface GenerateFormData {
  batch_name: string
  profile_id: string
  group_id: string
  total_generated: number
  length: number
  prefix: string
  characters: string
  password_mode: string
  comment: string
  shared_users: number
  disable: boolean
}

export default function GenerateVoucherPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showTemplate, setShowTemplate] = useState(false)
  const [templateVouchers, setTemplateVouchers] = useState<Voucher[]>([])
  const [showGenerateDialog, setShowGenerateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(false)

  // Form data
  const [formData, setFormData] = useState<GenerateFormData>({
    batch_name: '',
    profile_id: '',
    group_id: '',
    total_generated: 10,
    length: 6,
    prefix: 'FH',
    characters: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
    password_mode: 'same_as_username',
    comment: '',
    shared_users: 1,
    disable: false
  })

  // Load initial data
  useEffect(() => {
    loadProfiles()
    loadGroups()
    loadBatches()
  }, [])

  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/mikrotik/radius/hotspot/profiles')
      if (response.ok) {
        const data = await response.json()
        setProfiles(data)
      } else {
        console.error('Failed to load profiles')
      }
    } catch (error) {
      console.error('Error loading profiles:', error)
    }
  }

  const loadGroups = async () => {
    try {
      const response = await fetch('/api/mikrotik/radius/hotspot/groups')
      if (response.ok) {
        const data = await response.json()
        setGroups(data)
      } else {
        console.error('Failed to load groups')
      }
    } catch (error) {
      console.error('Error loading groups:', error)
    }
  }

  const loadBatches = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/mikrotik/radius/hotspot/batches')
      if (response.ok) {
        const data = await response.json()
        setBatches(data)
      } else {
        console.error('Failed to load batches')
      }
    } catch (error) {
      console.error('Error loading batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateVouchers = async () => {
    setGenerating(true)
    setProgress(0)

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    try {
      const response = await fetch('/api/mikrotik/radius/hotspot/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          created_by: 'admin' // You can get this from auth context
        }),
      })

      if (response.ok) {
        const newBatch = await response.json()

        // Reload batches to get updated data
        await loadBatches()

        // Generate vouchers for template display
        await generateVouchersForTemplate(newBatch)

        setProgress(100)
        setShowGenerateDialog(false)

        // Reset form
        setFormData({
          batch_name: '',
          profile_id: '',
          group_id: '',
          total_generated: 10,
          length: 6,
          prefix: 'FH',
          characters: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
          password_mode: 'same_as_username',
          comment: '',
          shared_users: 1,
          disable: false
        })

        // Show success message
        alert('Vouchers generated successfully!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to generate vouchers')
      }
    } catch (error) {
      console.error('Error generating vouchers:', error)
      alert('Error generating vouchers: ' + error.message)
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => {
        setProgress(0)
        setGenerating(false)
      }, 1000)
    }
  }

  const generateVouchersForTemplate = async (batch: Batch) => {
    try {
      const response = await fetch(`/api/mikrotik/radius/hotspot/batches/${batch.id}/vouchers`)
      if (response.ok) {
        const vouchers = await response.json()
        setTemplateVouchers(vouchers.slice(0, 40)) // Show first 40 for template
      } else {
        console.error('Failed to load vouchers for template')
      }
    } catch (error) {
      console.error('Error loading vouchers for template:', error)
    }
  }

  const handleExportCSV = async (batch: Batch) => {
    try {
      const response = await fetch(`/api/mikrotik/radius/hotspot/batches/${batch.id}/vouchers`)
      if (response.ok) {
        const vouchers = await response.json()

        const csvContent = [
          'Username,Password,Profile,Validity,Status,Created At',
          ...vouchers.map((v: any) =>
            `${v.username},${v.password},${v.profile || 'Unknown'},${v.validity || 'N/A'},${v.used ? 'Used' : 'Unused'},${v.created_at ? new Date(v.created_at).toLocaleDateString() : 'N/A'}`
          )
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `vouchers-${batch.batch_name}-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        throw new Error('Failed to load vouchers for export')
      }
    } catch (error) {
      console.error('Error exporting CSV:', error)
      alert('Error exporting CSV: ' + error.message)
    }
  }

  const handleViewTemplate = async (batch: Batch) => {
    try {
      const response = await fetch(`/api/mikrotik/radius/hotspot/batches/${batch.id}/vouchers`)
      if (response.ok) {
        const vouchers = await response.json()
        setTemplateVouchers(vouchers.slice(0, 40)) // Show first 40 for template
        setShowTemplate(true)
      } else {
        throw new Error('Failed to load vouchers for template')
      }
    } catch (error) {
      console.error('Error loading vouchers for template:', error)
      alert('Error loading vouchers for template: ' + error.message)
    }
  }

  const handleDeleteBatch = async (batch: Batch) => {
    try {
      const response = await fetch(`/api/mikrotik/radius/hotspot/batches/${batch.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Reload batches to get updated data
        await loadBatches()
        alert('Batch deleted successfully!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete batch')
      }
    } catch (error) {
      console.error('Error deleting batch:', error)
      alert('Error deleting batch: ' + error.message)
    }
    setShowDeleteDialog(false)
    setSelectedBatch(null)
  }

  const handlePrintTemplate = () => {
    window.print()
  }

  const VoucherTemplate = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Voucher Template</h2>
            <div className="flex gap-2">
              <Button onClick={handlePrintTemplate}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={() => setShowTemplate(false)}>
                Close
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 print:gap-2">
            {templateVouchers.slice(0, 40).map((voucher, index) => (
              <div key={voucher.id} className="border-2 border-black p-3 print:p-2">
                <div className="text-center">
                  <div className="font-bold text-lg mb-2">HOTSPOT VOUCHER</div>
                  <div className="text-sm mb-2">[{index + 1}]</div>
                  <div className="text-sm mb-2">Username</div>
                  <div className="font-bold text-lg mb-1">{voucher.username}</div>
                  <div className="text-sm mb-1">Password</div>
                  <div className="font-bold text-lg mb-1">{voucher.password}</div>
                  <div className="text-sm">{voucher.validity}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const GenerateDialog = () => (
    <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Generate Vouchers
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate New Voucher Batch</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="batch_name">Batch Name</Label>
              <Input
                id="batch_name"
                value={formData.batch_name}
                onChange={(e) => setFormData(prev => ({ ...prev, batch_name: e.target.value }))}
                placeholder="BATCH-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="total_generated">Quantity</Label>
              <Input
                id="total_generated"
                type="number"
                min="1"
                max="10000"
                value={formData.total_generated}
                onChange={(e) => setFormData(prev => ({ ...prev, total_generated: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="profile_id">Profile</Label>
              <Select value={formData.profile_id} onValueChange={(value) => setFormData(prev => ({ ...prev, profile_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group_id">Group</Label>
              <Select value={formData.group_id} onValueChange={(value) => setFormData(prev => ({ ...prev, group_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Name Length</Label>
              <Select value={formData.length.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, length: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prefix">Prefix</Label>
              <Input
                id="prefix"
                value={formData.prefix}
                onChange={(e) => setFormData(prev => ({ ...prev, prefix: e.target.value }))}
                placeholder="FH"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shared_users">Shared Users</Label>
              <Input
                id="shared_users"
                type="number"
                min="1"
                value={formData.shared_users}
                onChange={(e) => setFormData(prev => ({ ...prev, shared_users: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password_mode">Password Mode</Label>
              <Select value={formData.password_mode} onValueChange={(value) => setFormData(prev => ({ ...prev, password_mode: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="same_as_username">Same as Username</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="disable">Disable</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="disable"
                  checked={formData.disable}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, disable: checked }))}
                />
                <Label htmlFor="disable">Disabled</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="characters">Characters</Label>
            <Input
              id="characters"
              value={formData.characters}
              onChange={(e) => setFormData(prev => ({ ...prev, characters: e.target.value }))}
              placeholder="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Batch comment"
              rows={3}
            />
          </div>

          {generating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating vouchers...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setShowGenerateDialog(false)} disabled={generating}>
            Cancel
          </Button>
          <Button onClick={handleGenerateVouchers} disabled={generating || !formData.batch_name || !formData.profile_id}>
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (showTemplate) {
    return <VoucherTemplate />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Voucher Batches</h1>
          <p className="text-muted-foreground">Manage hotspot voucher batches</p>
        </div>
        <GenerateDialog />
      </div>

      {/* Batches Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Voucher Batches</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">Batch Name</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Profile</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Group</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Total</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Prefix</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Created</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-2 font-medium">{batch.batch_name}</td>
                      <td className="border border-gray-200 px-4 py-2">
                        {profiles.find(p => p.id === batch.profile_id)?.name || 'Unknown'}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {groups.find(g => g.id === batch.group_id)?.name || 'Unknown'}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <Badge variant="outline">{batch.total_generated}</Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">{batch.prefix}</td>
                      <td className="border border-gray-200 px-4 py-2">
                        <Badge className={batch.disable ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                          {batch.disable ? 'Disabled' : 'Active'}
                        </Badge>
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        {new Date(batch.created_at).toLocaleDateString()}
                      </td>
                      <td className="border border-gray-200 px-4 py-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewTemplate(batch)}
                            title="View Template"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleExportCSV(batch)}
                            title="Export CSV"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBatch(batch)
                              setShowDeleteDialog(true)
                            }}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the batch "{selectedBatch?.batch_name}" and all its vouchers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedBatch && handleDeleteBatch(selectedBatch)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}