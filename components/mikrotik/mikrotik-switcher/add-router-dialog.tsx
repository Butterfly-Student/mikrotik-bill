"use client"
import * as React from "react"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { RouterForm } from "./router-form"
import type { RouterFormData } from "./types"
import { Router } from "@/stores/mikrotik-store"

interface AddRouterDialogProps {
  onAdd: (data: RouterFormData) => Promise<Router>;
  trigger?: "button" | "dropdown";
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddRouterDialog({
  onAdd,
  trigger = "dropdown",
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: AddRouterDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  // Debug logging
  React.useEffect(() => {
    console.log("Dialog open state:", open)
  }, [open])

  const handleAdd = async (data: RouterFormData) => {
    try {
      console.log("Adding router:", data)
      await onAdd(data)
      setOpen(false)
    } catch (error) {
      console.error("Error adding router:", error)
    }
  }

  const handleCancel = () => {
    console.log("Dialog cancelled")
    setOpen(false)
  }

  const handleTriggerClick = (e?: React.MouseEvent) => {
    console.log("Trigger clicked, current open state:", open)
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setOpen(true)
    console.log("Setting open to true")
  }

  const triggerContent = children || (
    <div className="flex items-center gap-2">
      <div className="flex size-6 items-center justify-center rounded-md border bg-muted/50 hover:bg-muted transition-colors">
        <Plus className="size-3.5" />
      </div>
      <span className="text-sm font-medium">Add Router</span>
    </div>
  )

  return (
    <>
      {trigger === "dropdown" ? (
        <DropdownMenuItem
          className="flex-1 gap-2 p-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
          onSelect={(e) => {
            console.log("DropdownMenuItem onSelect triggered")
            e.preventDefault()
            // Use setTimeout to ensure dropdown closes first
            setTimeout(() => {
              setOpen(true)
            }, 0)
          }}
        >
          {triggerContent}
        </DropdownMenuItem>
      ) : (
        <button
          onClick={handleTriggerClick}
          className="w-full text-left"
          type="button"
        >
          {triggerContent}
        </button>
      )}

      {/* Force render dialog outside dropdown context */}
      {typeof window !== 'undefined' && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New MikroTik Router</DialogTitle>
              <DialogDescription>
                Add a new MikroTik router to manage. Test the connection before saving.
              </DialogDescription>
            </DialogHeader>
            <RouterForm onSubmit={handleAdd} onCancel={handleCancel} />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}