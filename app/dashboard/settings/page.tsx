"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Settings, Wifi, MessageSquare, Palette, Building, TestTube, Save, Eye, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { VoucherPreview } from "@/components/mikrotik/voucher-preview"

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState({ mikrotik: false, whatsapp: false })
  const [config, setConfig] = useState({
    // MikroTik Settings
    mikrotik_host: "",
    mikrotik_username: "",
    mikrotik_password: "",
    mikrotik_port: 8728,
    mikrotik_timeout: 10,
    mikrotik_ssl: false,

    // WhatsApp Settings
    whatsapp_enabled: false,
    whatsapp_api_url: "",
    whatsapp_api_token: "",

    // Company Settings
    company_name: "",
    company_address: "",
    company_phone: "",
    company_website: "",
    company_logo: "",

    // Voucher Template Settings
    default_template: "simple" as "simple" | "card" | "minimal" | "receipt",
    voucher_instructions: "1. Connect to WiFi network\n2. Open browser and enter code\n3. Enjoy internet access!",
    show_instructions: true,
    show_company_info: true,
    show_price: true,
    currency_symbol: "Rp",

    // Default Pricing
    default_cost_price: 0,
    default_selling_price: 0,
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/system/config")
      if (res.ok) {
        const data = await res.json()
        setConfig((prev) => ({ ...prev, ...data.data }))
      }
    } catch (error) {
      console.error("Failed to fetch config:", error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/system/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (res.ok) {
        toast({ title: "Success", description: "Settings saved successfully" })
      } else {
        const error = await res.json()
        toast({ title: "Error", description: error.message, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const testMikrotikConnection = async () => {
    setTesting((prev) => ({ ...prev, mikrotik: true }))
    try {
      const res = await fetch("/api/system/test-mikrotik", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: config.mikrotik_host,
          username: config.mikrotik_username,
          password: config.mikrotik_password,
          port: config.mikrotik_port,
          ssl: config.mikrotik_ssl,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: "Success", description: "MikroTik connection successful" })
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to test connection", variant: "destructive" })
    } finally {
      setTesting((prev) => ({ ...prev, mikrotik: false }))
    }
  }

  const testWhatsAppConnection = async () => {
    setTesting((prev) => ({ ...prev, whatsapp: true }))
    try {
      const res = await fetch("/api/system/test-whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_url: config.whatsapp_api_url,
          api_token: config.whatsapp_api_token,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast({ title: "Success", description: "WhatsApp API connection successful" })
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to test WhatsApp connection", variant: "destructive" })
    } finally {
      setTesting((prev) => ({ ...prev, whatsapp: false }))
    }
  }

  const previewVoucher = {
    code: "WIFI123456",
    profile: "1 Hour Package",
    validity: "24 hours",
    instructions: config.voucher_instructions,
    costPrice: config.default_cost_price,
    sellingPrice: config.default_selling_price,
  }

  const companyInfo = {
    name: config.company_name || "Your Company",
    address: config.company_address,
    phone: config.company_phone,
    website: config.company_website,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure system settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="mikrotik" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="mikrotik">MikroTik</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="voucher">Voucher</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="mikrotik" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                MikroTik Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mikrotik_host">Host/IP Address</Label>
                  <Input
                    id="mikrotik_host"
                    value={config.mikrotik_host}
                    onChange={(e) => setConfig((prev) => ({ ...prev, mikrotik_host: e.target.value }))}
                    placeholder="192.168.1.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mikrotik_port">Port</Label>
                  <Input
                    id="mikrotik_port"
                    type="number"
                    value={config.mikrotik_port}
                    onChange={(e) => setConfig((prev) => ({ ...prev, mikrotik_port: Number.parseInt(e.target.value) }))}
                    placeholder="8728"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mikrotik_username">Username</Label>
                  <Input
                    id="mikrotik_username"
                    value={config.mikrotik_username}
                    onChange={(e) => setConfig((prev) => ({ ...prev, mikrotik_username: e.target.value }))}
                    placeholder="admin"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mikrotik_password">Password</Label>
                  <Input
                    id="mikrotik_password"
                    type="password"
                    value={config.mikrotik_password}
                    onChange={(e) => setConfig((prev) => ({ ...prev, mikrotik_password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mikrotik_timeout">Timeout (seconds)</Label>
                  <Input
                    id="mikrotik_timeout"
                    type="number"
                    value={config.mikrotik_timeout}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, mikrotik_timeout: Number.parseInt(e.target.value) }))
                    }
                    placeholder="10"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="mikrotik_ssl"
                    checked={config.mikrotik_ssl}
                    onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, mikrotik_ssl: !!checked }))}
                  />
                  <Label htmlFor="mikrotik_ssl">Use SSL</Label>
                </div>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button onClick={testMikrotikConnection} disabled={testing.mikrotik} variant="outline">
                  <TestTube className="h-4 w-4 mr-2" />
                  {testing.mikrotik ? "Testing..." : "Test Connection"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                WhatsApp Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="whatsapp_enabled"
                  checked={config.whatsapp_enabled}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, whatsapp_enabled: !!checked }))}
                />
                <Label htmlFor="whatsapp_enabled">Enable WhatsApp notifications</Label>
              </div>

              {config.whatsapp_enabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_api_url">API URL</Label>
                    <Input
                      id="whatsapp_api_url"
                      value={config.whatsapp_api_url}
                      onChange={(e) => setConfig((prev) => ({ ...prev, whatsapp_api_url: e.target.value }))}
                      placeholder="https://api.whatsapp.com/send"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp_api_token">API Token</Label>
                    <Input
                      id="whatsapp_api_token"
                      type="password"
                      value={config.whatsapp_api_token}
                      onChange={(e) => setConfig((prev) => ({ ...prev, whatsapp_api_token: e.target.value }))}
                      placeholder="••••••••••••••••"
                    />
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button onClick={testWhatsAppConnection} disabled={testing.whatsapp} variant="outline">
                      <TestTube className="h-4 w-4 mr-2" />
                      {testing.whatsapp ? "Testing..." : "Test Connection"}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={config.company_name}
                  onChange={(e) => setConfig((prev) => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Your Company Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_address">Address</Label>
                <Textarea
                  id="company_address"
                  value={config.company_address}
                  onChange={(e) => setConfig((prev) => ({ ...prev, company_address: e.target.value }))}
                  placeholder="Company address..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_phone">Phone Number</Label>
                  <Input
                    id="company_phone"
                    value={config.company_phone}
                    onChange={(e) => setConfig((prev) => ({ ...prev, company_phone: e.target.value }))}
                    placeholder="+1234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_website">Website</Label>
                  <Input
                    id="company_website"
                    value={config.company_website}
                    onChange={(e) => setConfig((prev) => ({ ...prev, company_website: e.target.value }))}
                    placeholder="www.yourcompany.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_logo">Logo URL</Label>
                <Input
                  id="company_logo"
                  value={config.company_logo}
                  onChange={(e) => setConfig((prev) => ({ ...prev, company_logo: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Default Pricing Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency_symbol">Currency Symbol</Label>
                <Input
                  id="currency_symbol"
                  value={config.currency_symbol}
                  onChange={(e) => setConfig((prev) => ({ ...prev, currency_symbol: e.target.value }))}
                  placeholder="Rp"
                  className="w-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_cost_price">Default Cost Price</Label>
                  <Input
                    id="default_cost_price"
                    type="number"
                    value={config.default_cost_price}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, default_cost_price: Number.parseFloat(e.target.value) || 0 }))
                    }
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">Cost per voucher (for profit calculation)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_selling_price">Default Selling Price</Label>
                  <Input
                    id="default_selling_price"
                    type="number"
                    value={config.default_selling_price}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, default_selling_price: Number.parseFloat(e.target.value) || 0 }))
                    }
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-muted-foreground">Price shown to customers</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Pricing Information</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>
                    <strong>Cost Price:</strong> Your actual cost per voucher (for internal tracking)
                  </p>
                  <p>
                    <strong>Selling Price:</strong> Price displayed on vouchers and charged to customers
                  </p>
                  <p>
                    <strong>Profit per voucher:</strong> {config.currency_symbol}{" "}
                    {(config.default_selling_price - config.default_cost_price).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voucher" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Voucher Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="voucher_instructions">Default Instructions</Label>
                <Textarea
                  id="voucher_instructions"
                  value={config.voucher_instructions}
                  onChange={(e) => setConfig((prev) => ({ ...prev, voucher_instructions: e.target.value }))}
                  placeholder="Enter voucher usage instructions..."
                  rows={4}
                />
              </div>

              <div className="space-y-3">
                <Label>Display Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show_instructions"
                      checked={config.show_instructions}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, show_instructions: !!checked }))}
                    />
                    <Label htmlFor="show_instructions">Show instructions on vouchers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show_company_info"
                      checked={config.show_company_info}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, show_company_info: !!checked }))}
                    />
                    <Label htmlFor="show_company_info">Show company information</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show_price"
                      checked={config.show_price}
                      onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, show_price: !!checked }))}
                    />
                    <Label htmlFor="show_price">Show price on vouchers</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Template Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Template</Label>
                  <Select
                    value={config.default_template}
                    onValueChange={(value: any) => setConfig((prev) => ({ ...prev, default_template: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="receipt">Receipt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Template Descriptions</Label>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Simple:</span>
                      <span>Basic voucher with dashed border</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Card:</span>
                      <span>Modern card with gradient background</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Minimal:</span>
                      <span>Compact design for small vouchers</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Receipt:</span>
                      <span>Receipt-style with detailed info</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Template Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center items-center min-h-[300px]">
                <VoucherPreview
                  template={config.default_template}
                  voucher={previewVoucher}
                  companyInfo={config.show_company_info ? companyInfo : undefined}
                  showInstructions={config.show_instructions}
                  showPrice={config.show_price}
                  currencySymbol={config.currency_symbol}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Templates Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {["simple", "card", "minimal", "receipt"].map((template) => (
                  <div key={template} className="space-y-2">
                    <div className="border rounded-lg p-2 bg-gray-50">
                      <div className="scale-75 origin-center">
                        <VoucherPreview
                          template={template as any}
                          voucher={previewVoucher}
                          companyInfo={companyInfo}
                          showInstructions={false}
                          showPrice={config.show_price}
                          currencySymbol={config.currency_symbol}
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium capitalize">{template}</h3>
                      {config.default_template === template && (
                        <Badge variant="default" className="mt-1">
                          Default
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
