import { Wifi, WifiOff, AlertCircle, Router } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'online':
      return <Wifi className="size-3 text-green-500" />
    case 'offline':
      return <WifiOff className="size-3 text-gray-400" />
    case 'error':
      return <AlertCircle className="size-3 text-red-500" />
    default:
      return <Router className="size-3" />
  }
}

export const getStatusBadge = (status: string) => {
  const variants = {
    online: "bg-green-100 text-green-800 border-green-200",
    offline: "bg-gray-100 text-gray-800 border-gray-200",
    error: "bg-red-100 text-red-800 border-red-200"
  }

  return (
    <Badge variant="outline" className={variants[status as keyof typeof variants] || variants.offline}>
      {status}
    </Badge>
  )
}