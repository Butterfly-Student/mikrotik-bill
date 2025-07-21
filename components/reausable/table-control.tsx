"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"


export interface TableControl {
  type: "switch" | "select" | "input" | "custom"
  key: string
  label: string
  value?: any
  onChange?: (value: any) => void
  options?: { label: string; value: string }[]
  placeholder?: string
  icon?: React.ComponentType<{ className?: string }>
  description?: string
  disabled?: boolean
  render?: () => React.ReactNode // For custom controls
}

export interface TableControlsConfig {
  title?: string
  icon?: React.ComponentType<{ className?: string }>
  controls: TableControl[]
  columns?: number // Grid columns (1-6)
  className?: string
}



export const renderControl = (control: TableControl) => {
  switch (control.type) {
    case "switch":
      return (
        <div className="flex items-center space-x-2">
          <Switch
            id={control.key}
            checked={control.value}
            onCheckedChange={control.onChange}
            disabled={control.disabled}
          />
          <Label htmlFor={control.key}>{control.label}</Label>
          {control.icon && <control.icon className={`h-4 w-4 ${control.value ? "text-green-600" : "text-red-600"}`} />}
        </div>
      )

    case "select":
      return (
        <div className="space-y-2">
          <Label htmlFor={control.key}>{control.label}</Label>
          <Select value={control.value?.toString()} onValueChange={control.onChange} disabled={control.disabled}>
            <SelectTrigger>
              <SelectValue placeholder={control.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {control.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {control.description && <p className="text-xs text-muted-foreground">{control.description}</p>}
        </div>
      )

    case "input":
      return (
        <div className="space-y-2">
          <Label htmlFor={control.key}>{control.label}</Label>
          <Input
            id={control.key}
            placeholder={control.placeholder}
            value={control.value}
            onChange={(e) => control.onChange?.(e.target.value)}
            disabled={control.disabled}
          />
          {control.description && <p className="text-xs text-muted-foreground">{control.description}</p>}
        </div>
      )

    case "custom":
      return control.render?.()

    default:
      return null
  }
}