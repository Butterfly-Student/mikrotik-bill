"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  className?: string
  variant?: "default" | "success" | "warning" | "danger"
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = "default",
}: StatsCardProps) {
  const variantStyles = {
    default: "border-border",
    success: "border-green-200 bg-green-50",
    warning: "border-yellow-200 bg-yellow-50",
    danger: "border-red-200 bg-red-50",
  }

  const iconStyles = {
    default: "text-muted-foreground",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
  }

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={cn("h-4 w-4", iconStyles[variant])} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center justify-between mt-2">
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
            {trend && (
              <p className={cn("text-xs font-medium", trend.isPositive ? "text-green-600" : "text-red-600")}>
                {trend.isPositive ? "+" : ""}
                {trend.value}% {trend.label}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
