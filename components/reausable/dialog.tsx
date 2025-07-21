"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { ReactNode } from "react"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export interface DialogPermissions {
  view?: string
  write?: string
}

export interface ReusableDialogProps {
  trigger?: ReactNode
  title: string
  description?: string
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showFooter?: boolean
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  confirmVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "sm" | "md" | "lg" | "xl"
  permissions?: DialogPermissions
}

export function ReusableDialog({
  trigger,
  title,
  description,
  children,
  open,
  onOpenChange,
  showFooter = false,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  confirmVariant = "default",
  size = "md",
  permissions = {},
}: ReusableDialogProps) {
  const { data: session } = useSession()
  const router = useRouter()

  // Permission checking
  useEffect(() => {
    if (permissions.view && session?.user) {
      const hasPermission = session.user.permissions?.some((p) => p.name === permissions.view)
      if (!hasPermission) {
        router.push("/unauthorized")
      }
    }
  }, [permissions.view, session, router])

  const hasReadPermission = !permissions.view || session?.user?.permissions?.some((p) => p.name === permissions.view)
  const hasWritePermission = !permissions.write || session?.user?.permissions?.some((p) => p.name === permissions.write)

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }

  if (!hasReadPermission) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className={sizeClasses[size]}>
          <DialogHeader>
            <DialogTitle>Akses Ditolak</DialogTitle>
            <DialogDescription>Anda tidak memiliki izin untuk mengakses konten ini.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="py-4">{children}</div>

        {showFooter && (
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              disabled={!hasWritePermission && confirmVariant !== "outline"}
            >
              {confirmText}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
