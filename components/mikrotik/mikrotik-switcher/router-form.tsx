"use client"
import * as React from "react"
import { Loader2, Wifi, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useMikrotikSwitcher } from "@/hooks/use-mikrotik-switcher"
import type { RouterFormData } from "./types"

const routerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  ip_address: z.string().ip("Invalid IP address"),
  username: z.string().min(1, "Username is required").max(50, "Username too long"),
  password: z.string().min(1, "Password is required"),
  port: z.number().min(1, "Port must be greater than 0").max(65535, "Invalid port"),
  api_port: z.number().min(1, "API port must be greater than 0").max(65535, "Invalid port"),
  timeout: z.number().min(1000, "Timeout must be at least 1000ms").max(300000, "Timeout too long"),
  keepalive: z.boolean(),
  location: z.string().max(100, "Location too long").optional(),
  description: z.string().optional(),
})

interface RouterFormProps {
  onSubmit: (data: RouterFormData) => Promise<void>;
  onCancel: () => void;
}

export function RouterForm({ onSubmit, onCancel }: RouterFormProps) {
  const [testResult, setTestResult] = React.useState<{ success: boolean; data?: any; error?: string } | null>(null)
  const { testConnection, testingConnection } = useMikrotikSwitcher()

  const form = useForm<RouterFormData>({
    resolver: zodResolver(routerSchema),
    defaultValues: {
      name: "",
      ip_address: "",
      username: "admin",
      password: "",
      port: 8728,
      api_port: 8729,
      timeout: 30000,
      keepalive: true,
      location: "",
      description: "",
    },
  })

  const handleTestConnection = async () => {
    const values = form.getValues()
    const result = await testConnection(values)
    setTestResult(result)
  }

  const handleSubmit = async (data: RouterFormData) => {
    try {
      await onSubmit(data)
      form.reset()
      setTestResult(null)
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Router Name</FormLabel>
                <FormControl>
                  <Input placeholder="My Router" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ip_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IP Address</FormLabel>
                <FormControl>
                  <Input placeholder="192.168.1.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="admin" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Port</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="8728"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="api_port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>HTTP API Port</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="8729"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timeout"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timeout (ms)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="30000"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Office, Branch A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="keepalive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Keep Alive</FormLabel>
                  <FormDescription className="text-xs">
                    Maintain persistent connection
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description of this router..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Connection Test Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Test Connection</h4>
              <p className="text-sm text-muted-foreground">
                Verify the connection before saving
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={testingConnection || !form.watch('ip_address') || !form.watch('username')}
            >
              {testingConnection && <Loader2 className="mr-2 size-4 animate-spin" />}
              Test Connection
            </Button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg border ${testResult.success
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
              }`}>
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <Wifi className="size-4 text-green-600" />
                ) : (
                  <AlertCircle className="size-4 text-red-600" />
                )}
                <span className={`font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                  {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                </span>
              </div>

              {testResult.success && testResult.data && (
                <div className="text-sm space-y-1">
                  {testResult.data.version && (
                    <p className="text-green-700">Version: {testResult.data.version}</p>
                  )}
                  {testResult.data.uptime && (
                    <p className="text-green-700">Uptime: {testResult.data.uptime}</p>
                  )}
                </div>
              )}

              {!testResult.success && testResult.error && (
                <p className="text-sm text-red-700">{testResult.error}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Add Router
          </Button>
        </div>
      </form>
    </Form>
  )
}
