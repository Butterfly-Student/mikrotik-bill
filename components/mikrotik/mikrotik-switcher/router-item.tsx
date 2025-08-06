import * as React from "react"
import { Router, Trash2 } from "lucide-react"
import { DropdownMenuItem, DropdownMenuShortcut } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { getStatusIcon, getStatusBadge } from "./router-status"
import type { Router as RouterType } from "./types"

interface RouterItemProps {
  router: RouterType;
  index: number;
  onClick: () => void;
  onDelete: () => void;
}

export function RouterItem({ router, index, onClick, onDelete }: RouterItemProps) {
  return (
    <DropdownMenuItem
      onClick={onClick}
      className="gap-2 p-3"
    >
      <div className="flex size-6 items-center justify-center rounded-md border relative">
        <Router className="size-3.5 shrink-0" />
        <div className="absolute -bottom-0.5 -right-0.5">
          {getStatusIcon(router.status)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{router.name}</span>
          {getStatusBadge(router.status)}
        </div>
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div>{router.ip_address}</div>
          {/* {router.location && (
            <div className="truncate">📍 {router.location}</div>
          )}
          {router.last_seen && (
            <div>Last seen: {new Date(router.last_seen).toLocaleDateString()}</div>
          )} */}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
        <Button
          variant="ghost"
          size="sm"
          className="size-6 p-0 hover:bg-red-100 hover:text-red-600"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </DropdownMenuItem>
  )
}