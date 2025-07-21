"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Download, FileText, Settings, Play, CheckCircle } from "lucide-react"

export default function BulkCreatePage() {
  const [formData, setFormData] = useState({
    quantity: 100,
    prefix: "USER",
    usernameLength: 6,
    passwordLength: 6,
    serviceType: "hotspot",
    profile: "",
    startNumber: 1,
    includeNumbers: true,
    includeLetters: false,
    includeSymbols: false,
    expiryDays: 30,
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedUsers, setGeneratedUsers] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const profiles = {
    hotspot: ["Hotspot 1 Hour", "Hotspot 1 Day", "Hotspot 1 Week"],
    pppoe: ["PPPoE 10GB", "PPPoE Unlimited", "PPPoE 5GB"],
  }

  const generateUsers = async () => {
    setIsGenerating(true)
    setProgress(0)
    setGeneratedUsers([])

    // Simulate bulk generation with progress
    for (let i = 0; i < formData.quantity; i++) {
      await new Promise((resolve) => setTimeout(resolve, 50)) // Simulate API delay

      const userNumber = formData.startNumber + i
      const username = `${formData.prefix}${userNumber.toString().padStart(3, "0")}`
      const password = generatePassword(formData.passwordLength)

      const newUser = {
        id: i + 1,
        username,
        password,
        profile: formData.profile,
        serviceType: formData.serviceType,
        status: "created",
        expiresAt: new Date(Date.now() + formData.expiryDays * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      }

      setGeneratedUsers((prev) => [...prev, newUser])
      setProgress(((i + 1) / formData.quantity) * 100)
    }

    setIsGenerating(false)
    setShowPreview(true)
  }

  const generatePassword = (length: number) => {
    let chars = ""
    if (formData.includeNumbers) chars += "0123456789"
    if (formData.includeLetters) chars += "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (formData.includeSymbols) chars += "!@#$%^&*"

    if (!chars) chars = "0123456789" // Default to numbers if nothing selected

    let result = ""
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const exportToCSV = () => {
    const headers = ["Username", "Password", "Profile", "Service Type", "Expires At"]
    const csvContent = [
      headers.join(","),
      ...generatedUsers.map((user) =>
        [user.username, user.password, user.profile, user.serviceType, user.expiresAt].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bulk_users_${Date.now()}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk User Creation</h1>
          <p className="text-muted-foreground">Generate multiple users at once for hotspot or PPPoE services</p>
        </div>
        {generatedUsers.length > 0 && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Generation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.quantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                />
                <p className="text-xs text-muted-foreground">Maximum 1000 users</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-type">Service Type</Label>
                <Select
                  value={formData.serviceType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceType: value, profile: "" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotspot">Hotspot</SelectItem>
                    <SelectItem value="pppoe">PPPoE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile">Profile</Label>
              <Select
                value={formData.profile}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, profile: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles[formData.serviceType as keyof typeof profiles]?.map((profile) => (
                    <SelectItem key={profile} value={profile}>
                      {profile}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prefix">Username Prefix</Label>
                <Input
                  id="prefix"
                  value={formData.prefix}
                  onChange={(e) => setFormData((prev) => ({ ...prev, prefix: e.target.value }))}
                  placeholder="USER"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-number">Start Number</Label>
                <Input
                  id="start-number"
                  type="number"
                  min="1"
                  value={formData.startNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startNumber: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry-days">Expiry (Days)</Label>
                <Input
                  id="expiry-days"
                  type="number"
                  min="1"
                  value={formData.expiryDays}
                  onChange={(e) => setFormData((prev) => ({ ...prev, expiryDays: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label>Password Settings</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password-length">Password Length</Label>
                  <Select
                    value={formData.passwordLength.toString()}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, passwordLength: Number(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 characters</SelectItem>
                      <SelectItem value="6">6 characters</SelectItem>
                      <SelectItem value="8">8 characters</SelectItem>
                      <SelectItem value="12">12 characters</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label>Character Types</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-numbers"
                        checked={formData.includeNumbers}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, includeNumbers: !!checked }))}
                      />
                      <Label htmlFor="include-numbers" className="text-sm">
                        Numbers (0-9)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-letters"
                        checked={formData.includeLetters}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, includeLetters: !!checked }))}
                      />
                      <Label htmlFor="include-letters" className="text-sm">
                        Letters (a-Z)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-symbols"
                        checked={formData.includeSymbols}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, includeSymbols: !!checked }))}
                      />
                      <Label htmlFor="include-symbols" className="text-sm">
                        Symbols (!@#$)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Preview Format</h4>
                <div className="text-sm space-y-1">
                  <div>
                    Username: {formData.prefix}
                    {formData.startNumber.toString().padStart(3, "0")}
                  </div>
                  <div>Password: {generatePassword(formData.passwordLength)}</div>
                  <div>Service: {formData.serviceType}</div>
                  <div>Profile: {formData.profile || "Not selected"}</div>
                </div>
              </div>

              <Button onClick={generateUsers} disabled={isGenerating || !formData.profile} className="w-full">
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating... ({Math.round(progress)}%)
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate {formData.quantity} Users
                  </>
                )}
              </Button>

              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    Generated {generatedUsers.length} of {formData.quantity} users
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Generated Users ({generatedUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {generatedUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users generated yet</p>
                <p className="text-sm">Configure settings and click generate to create users</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Generation Complete</span>
                  </div>
                  <Badge variant="secondary">{generatedUsers.length} users</Badge>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead>Password</TableHead>
                        <TableHead>Profile</TableHead>
                        <TableHead>Expires</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {generatedUsers.slice(0, 50).map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell className="font-mono">{user.password}</TableCell>
                          <TableCell>{user.profile}</TableCell>
                          <TableCell>{user.expiresAt}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {generatedUsers.length > 50 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      ... and {generatedUsers.length - 50} more users
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
