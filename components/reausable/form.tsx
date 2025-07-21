"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReusableInput, type ReusableInputProps } from "./input"

export interface FormField extends ReusableInputProps {
  name: string
  validation?: (value: any) => string | undefined
}

export interface FormPermissions {
  write?: string
}

export interface ReusableFormProps {
  title?: string
  description?: string
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void | Promise<void>
  submitText?: string
  loading?: boolean
  className?: string
  initialData?: Record<string, any>
  permissions?: FormPermissions
}

export function ReusableForm({
  title,
  description,
  fields,
  onSubmit,
  submitText = "Submit",
  loading = false,
  className,
  initialData = {},
  permissions = {},
}: ReusableFormProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const userPermissions = session?.user?.permissions || []
  const hasWritePermission = !permissions.write || userPermissions.some((p) => p.name === permissions.write)

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  // Redirect if permission denied
  useEffect(() => {
    if (permissions.write && session?.user) {
      const allowed = userPermissions.some((p) => p.name === permissions.write)
      if (!allowed) {
        router.push("/unauthorized")
      }
    }
  }, [permissions.write, session, router, userPermissions])

  const handleFieldChange = useCallback((name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }, [errors])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      const value = formData[field.name]

      if (field.required && (!value || value === "")) {
        newErrors[field.name] = `${field.label || field.name} wajib diisi`
        return
      }

      if (field.validation && value) {
        const error = field.validation(value)
        if (error) {
          newErrors[field.name] = error
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [fields, formData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error: any) {
      console.error("Form submission error:", error)
      setSubmitError(error?.message || "Terjadi kesalahan saat mengirim data.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (permissions.write && session === undefined) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">Memuat...</CardContent>
      </Card>
    )
  }

  if (!hasWritePermission) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <h3 className="text-lg font-semibold">Akses Ditolak</h3>
          <p className="text-muted-foreground">Anda tidak memiliki izin untuk mengakses form ini.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => {
            const { validation, ...inputProps } = field

            return (
              <ReusableInput
                key={field.name}
                {...inputProps}
                value={formData[field.name] ?? ""}
                onChange={(value) => handleFieldChange(field.name, value)}
                error={errors[field.name]}
                disabled={loading || isSubmitting}
              />
            )
          })}

          {submitError && (
            <div className="text-red-600 text-sm text-center">{submitError}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading || isSubmitting}>
            {isSubmitting ? "Memproses..." : submitText}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
