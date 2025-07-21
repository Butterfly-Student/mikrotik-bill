"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  CheckCircle,
  XCircle,
  Wifi,
  AlertTriangle,
  MessageSquare,
  Router,
  Shield,
  Database,
} from "lucide-react"
import { toast } from "sonner"

interface SetupWizardProps {
  onSetupComplete: () => void
}

export function SetupWizard({ onSetupComplete }: SetupWizardProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "failed">("idle")
  const [connectionError, setConnectionError] = useState<string>("")

  const [testingWhatsApp, setTestingWhatsApp] = useState(false)
  const [whatsappStatus, setWhatsappStatus] = useState<"idle" | "success" | "failed">("idle")
  const [whatsappError, setWhatsappError] = useState<string>("")

  const [config, setConfig] = useState({
    mikrotik_host: "103.139.193.128",
    mikrotik_username: "j2",
    mikrotik_password: "2",
    mikrotik_port: 1091,
    mikrotik_ssl: false,
    whatsapp_enabled: false,
    whatsapp_api_url: "",
    whatsapp_api_token: "",
  })

  

  const testMikrotikConnection = async () => {
    console.log(config)
    if (!config.mikrotik_host || !config.mikrotik_username || !config.mikrotik_password) {
      toast("Form Tidak Lengkap")
      return
    }

    setTestingConnection(true)
    setConnectionStatus("idle")
    setConnectionError("")

    try {
      // First save the config
      const response = await fetch("/api/system/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error("Gagal menyimpan konfigurasi")
      }

      // Then test connection
      const testResponse = await fetch("/api/system/test-mikrotik", {
        method: "POST",
      })

      const result = await testResponse.json()

      console.log(result)

      if (result.success) {
        setConnectionStatus("success")
        toast("Success",{
          description: "Koneksi Berhasil! ✅"
        })
      } else {
        setConnectionStatus("failed")
        setConnectionError(result.error || "Koneksi gagal")
        toast("Error", {
          description: "Koneksi Gagal ❌"
        })
      }
    } catch (error) {
      console.error("Connection test failed:", error)
      setConnectionStatus("failed")
      setConnectionError(error.message || "Terjadi kesalahan saat testing koneksi")
      toast("Error Testing Koneksi")
    } finally {
      setTestingConnection(false)
    }
  }

  const testWhatsAppConnection = async () => {
    if (!config.whatsapp_enabled || !config.whatsapp_api_url || !config.whatsapp_api_token) {
      toast("Konfigurasi Tidak Lengkap")
      return
    }

    setTestingWhatsApp(true)
    setWhatsappStatus("idle")
    setWhatsappError("")

    try {
      // Save config first
      const response = await fetch("/api/system/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error("Gagal menyimpan konfigurasi")
      }

      // Test WhatsApp connection
      const testResponse = await fetch("/api/system/test-whatsapp", {
        method: "POST",
      })

      const result = await testResponse.json()

      if (result.success) {
        setWhatsappStatus("success")
        toast("WhatsApp Terhubung! ✅")
      } else {
        setWhatsappStatus("failed")
        setWhatsappError(result.error || "Koneksi WhatsApp gagal")
        toast("WhatsApp Gagal ❌")
      }
    } catch (error) {
      console.error("WhatsApp test failed:", error)
      setWhatsappStatus("failed")
      setWhatsappError(error.message || "Terjadi kesalahan saat testing WhatsApp")
      toast("Error Testing WhatsApp")
    } finally {
      setTestingWhatsApp(false)
    }
  }

  const completeSetup = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/system/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          setup_completed: true,
        }),
      })

      if (!response.ok) {
        throw new Error("Gagal menyelesaikan setup")
      }

      toast("Setup Selesai! 🎉")

      setTimeout(() => {
        onSetupComplete()
      }, 1500)
    } catch (error) {
      if (error instanceof Error) {
        console.error("Setup completion failed:", error)
        toast("Setup Gagal")
      } else {
        console.error("Setup completion failed:", error)
        toast("Setup Gagal")
      }
    } finally {
      setLoading(false)
    }
  }

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Terhubung
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Gagal
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <Router className="h-3 w-3 mr-1" />
            Belum Ditest
          </Badge>
        )
    }
  }

  const getWhatsAppBadge = () => {
    if (!config.whatsapp_enabled) {
      return (
        <Badge variant="outline">
          <MessageSquare className="h-3 w-3 mr-1" />
          Tidak Aktif
        </Badge>
      )
    }

    switch (whatsappStatus) {
      case "success":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Terhubung
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Gagal
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <MessageSquare className="h-3 w-3 mr-1" />
            Belum Ditest
          </Badge>
        )
    }
  }

  const canProceedToStep2 = connectionStatus === "success"
  const canCompleteSetup = step === 3 || (step === 2 && !config.whatsapp_enabled)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wifi className="h-10 w-10" />
            <span className="text-3xl font-bold">ISP Manager</span>
          </div>
          <CardTitle className="text-xl">Setup Wizard - Konfigurasi Sistem</CardTitle>
          <p className="text-blue-100">Konfigurasikan sistem Anda untuk memulai</p>
        </CardHeader>

        <CardContent className="p-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                <Router className="h-5 w-5" />
              </div>
              <span className="ml-2 text-sm font-medium">Mikrotik</span>
            </div>
            <div className={`h-1 w-20 ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                <MessageSquare className="h-5 w-5" />
              </div>
              <span className="ml-2 text-sm font-medium">WhatsApp</span>
            </div>
            <div className={`h-1 w-20 ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`} />
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                <CheckCircle className="h-5 w-5" />
              </div>
              <span className="ml-2 text-sm font-medium">Selesai</span>
            </div>
          </div>

          {/* Step 1: Mikrotik Configuration */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <Router className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900">Konfigurasi Mikrotik</h3>
                <p className="text-gray-600 mt-2">Konfigurasikan koneksi ke router Mikrotik Anda</p>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>WARNING:</strong> Aplikasi ini hanya bekerja dengan REST API MikroTik. Pastikan router terhubung dan REST API diaktifkan.
                </AlertDescription>

              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="mikrotik-host" className="text-sm font-medium text-gray-700">
                    IP Address Router <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mikrotik-host"
                    value={config.mikrotik_host}
                    onChange={(e) => setConfig((prev) => ({ ...prev, mikrotik_host: e.target.value }))}
                    placeholder="192.168.1.1"
                    className="h-11"
                    required
                  />
                  <p className="text-xs text-gray-500">IP address atau hostname router Mikrotik</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mikrotik-port" className="text-sm font-medium text-gray-700">
                    Port API
                  </Label>
                  <Input
                    id="mikrotik-port"
                    type="number"
                    value={config.mikrotik_port}
                    onChange={(e) => setConfig((prev) => ({ ...prev, mikrotik_port: Number(e.target.value) }))}
                    placeholder="8728"
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">Default: 80 (http) atau 443 (https)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mikrotik-username" className="text-sm font-medium text-gray-700">
                    Username <span className="text-red-500">*</span>  
                  </Label>
                  <Input
                    id="mikrotik-username"
                    value={config.mikrotik_username}
                    onChange={(e) => setConfig((prev) => ({ ...prev, mikrotik_username: e.target.value }))}
                    placeholder="admin"
                    className="h-11"
                    required
                  />
                  <p className="text-xs text-gray-500">Username untuk login ke Mikrotik</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mikrotik-password" className="text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="mikrotik-password"
                    type="password"
                    value={config.mikrotik_password}
                    onChange={(e) => setConfig((prev) => ({ ...prev, mikrotik_password: e.target.value }))}
                    placeholder="Masukkan password"
                    className="h-11"
                    required
                  />
                  <p className="text-xs text-gray-500">Password untuk login ke Mikrotik</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                <Switch
                  id="mikrotik-ssl"
                  checked={config.mikrotik_ssl}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, mikrotik_ssl: checked }))}
                />
                <div>
                  <Label htmlFor="mikrotik-ssl" className="text-sm font-medium text-gray-700">
                    Gunakan Koneksi HTTPS
                  </Label>
                  <p className="text-xs text-gray-500">Aktifkan jika menggunakan port 443 (https)</p>
                </div>
              </div>

              {/* Connection Status */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Status Koneksi:</span>
                  {getConnectionBadge()}
                </div>

                {connectionStatus === "failed" && connectionError && (
                  <Alert className="mb-4 border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <strong>Error:</strong> {connectionError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={testMikrotikConnection}
                    disabled={
                      testingConnection ||
                      !config.mikrotik_host ||
                      !config.mikrotik_username ||
                      !config.mikrotik_password
                    }
                    className="flex-1"
                  >
                    {testingConnection && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Router className="h-4 w-4 mr-2" />
                    {testingConnection ? "Testing..." : "Test Koneksi"}
                  </Button>
                  <Button onClick={() => setStep(2)} disabled={!canProceedToStep2} className="flex-1">
                    Lanjut ke WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: WhatsApp Configuration */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900">Integrasi WhatsApp</h3>
                <p className="text-gray-600 mt-2">Konfigurasikan notifikasi WhatsApp (Opsional)</p>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <Switch
                  id="whatsapp-enabled"
                  checked={config.whatsapp_enabled}
                  onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, whatsapp_enabled: checked }))}
                />
                <div>
                  <Label htmlFor="whatsapp-enabled" className="text-sm font-medium text-gray-700">
                    Aktifkan Notifikasi WhatsApp
                  </Label>
                  <p className="text-xs text-gray-500">Kirim notifikasi otomatis ke pengguna via WhatsApp</p>
                </div>
              </div>

              {config.whatsapp_enabled && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <Alert className="border-green-200 bg-green-50">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Anda memerlukan WhatsApp Business API atau layanan pihak ketiga untuk mengirim pesan WhatsApp.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-api-url" className="text-sm font-medium text-gray-700">
                        WhatsApp API URL
                      </Label>
                      <Input
                        id="whatsapp-api-url"
                        value={config.whatsapp_api_url}
                        onChange={(e) => setConfig((prev) => ({ ...prev, whatsapp_api_url: e.target.value }))}
                        placeholder="https://api.whatsapp.com/send"
                        className="h-11"
                      />
                      <p className="text-xs text-gray-500">URL endpoint untuk WhatsApp API</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whatsapp-api-token" className="text-sm font-medium text-gray-700">
                        API Token
                      </Label>
                      <Input
                        id="whatsapp-api-token"
                        type="password"
                        value={config.whatsapp_api_token}
                        onChange={(e) => setConfig((prev) => ({ ...prev, whatsapp_api_token: e.target.value }))}
                        placeholder="Masukkan API token"
                        className="h-11"
                      />
                      <p className="text-xs text-gray-500">Token autentikasi untuk WhatsApp API</p>
                    </div>
                  </div>
                </div>
              )}

              {config.whatsapp_enabled && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Status WhatsApp:</span>
                    {getWhatsAppBadge()}
                  </div>

                  {whatsappStatus === "failed" && whatsappError && (
                    <Alert className="mb-4 border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Error:</strong> {whatsappError}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    variant="outline"
                    onClick={testWhatsAppConnection}
                    disabled={
                      testingWhatsApp ||
                      !config.whatsapp_enabled ||
                      !config.whatsapp_api_url ||
                      !config.whatsapp_api_token
                    }
                    className="w-full"
                  >
                    {testingWhatsApp && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {testingWhatsApp ? "Testing..." : "Test WhatsApp API"}
                  </Button>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Kembali
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Lanjut ke Review
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Complete */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900">Review Konfigurasi</h3>
                <p className="text-gray-600 mt-2">Periksa kembali pengaturan sebelum menyelesaikan setup</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Router className="h-5 w-5 mr-2 text-blue-600" />
                  Konfigurasi Mikrotik
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Host:</span>
                    <span className="font-medium">{config.mikrotik_host}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Port:</span>
                    <span className="font-medium">{config.mikrotik_port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium">{config.mikrotik_username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SSL:</span>
                    <span className="font-medium">{config.mikrotik_ssl ? "Ya" : "Tidak"}</span>
                  </div>
                  <div className="flex justify-between md:col-span-2">
                    <span className="text-gray-600">Status:</span>
                    {getConnectionBadge()}
                  </div>
                </div>

                <hr className="border-gray-200" />

                <h4 className="font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
                  WhatsApp Integration
                </h4>
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">
                      {config.whatsapp_enabled ? (
                        <Badge className="bg-green-100 text-green-800">Aktif</Badge>
                      ) : (
                        <Badge variant="outline">Tidak Aktif</Badge>
                      )}
                    </span>
                  </div>
                  {config.whatsapp_enabled && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">API URL:</span>
                        <span className="font-medium text-xs">{config.whatsapp_api_url || "Tidak diset"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Token:</span>
                        <span className="font-medium text-xs">
                          {config.whatsapp_api_token ? "••••••••" : "Tidak diset"}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between md:col-span-2">
                    <span className="text-gray-600">WhatsApp Status:</span>
                    {getWhatsAppBadge()}
                  </div>
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Database className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Siap untuk digunakan!</strong> Setelah setup selesai, Anda dapat mulai mengelola pengguna
                  hotspot, voucher, dan fitur lainnya.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Kembali
                </Button>
                <Button onClick={completeSetup} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Selesaikan Setup
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SetupWizard
