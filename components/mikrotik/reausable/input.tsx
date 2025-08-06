"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export interface ReusableInputProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "textarea" | "select" | "checkbox" | "radio"
  label?: string
  placeholder?: string
  value?: string | number | boolean
  onChange?: (value: any) => void
  options?: { label: string; value: string }[]
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
  description?: string
  defaultValue?: string | number
  [key: string]: any // Allow additional props for flexibility
}

export const ReusableInput = forwardRef<HTMLInputElement, ReusableInputProps>(
  (
    {
      type = "text",
      label,
      placeholder,
      value,
      onChange,
      options = [],
      error,
      required,
      disabled,
      className,
      description,
      defaultValue,
      ...props
    },
    ref,
  ) => {
    const renderInput = () => {
      switch (type) {
        case "textarea":
          return (
            <Textarea
              placeholder={placeholder}
              value={value as string}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled}
              className={cn(error && "border-red-500", className)}
              defaultValue={defaultValue as string}
              {...props}
            />
          )

        case "select":
          return (
            <Select value={value as string} onValueChange={onChange} disabled={disabled}>
              <SelectTrigger className={cn(error && "border-red-500", className)}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )

        case "checkbox":
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={value as boolean}
                onCheckedChange={onChange}
                disabled={disabled}
                className={cn(error && "border-red-500")}
              />
              {label && (
                <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {label}
                </Label>
              )}
            </div>
          )

        case "radio":
          return (
            <RadioGroup value={value as string} onValueChange={onChange} disabled={disabled}>
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} />
                  <Label>{option.label}</Label>
                </div>
              ))}
            </RadioGroup>
          )

        default:
          return (
            <Input
              ref={ref}
              type={type}
              placeholder={placeholder}
              value={value as string}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled}
              className={cn(error && "border-red-500", className)}
              defaultValue={defaultValue as string}
              {...props}
            />
          )
      }
    }

    if (type === "checkbox") {
      return (
        <div className="space-y-2">
          {renderInput()}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {label && type !== "checkbox" && (
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        {renderInput()}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    )
  },
)

ReusableInput.displayName = "ReusableInput"
