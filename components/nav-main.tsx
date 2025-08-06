// components/nav-main.tsx
"use client"
import { ChevronRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  groupTitle,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    permission?: string
    items?: {
      title: string
      url: string
      permission?: string
    }[]
  }[]
  groupTitle?: string
}) {
  const pathname = usePathname()

  // Memoize active states untuk mengurangi re-calculation
  const activeStates = useMemo(() => {
    return items.reduce((acc, item) => {
      const isMainActive = pathname === item.url
      const hasActiveSubItem = Boolean(item.items?.some(subItem => pathname === subItem.url));
      acc[item.title] = {
        isMainActive,
        hasActiveSubItem,
        isOpen: isMainActive || hasActiveSubItem
      }
      return acc
    }, {} as Record<string, { isMainActive: boolean; hasActiveSubItem: boolean; isOpen: boolean }>)
  }, [pathname, items])

  return (
    <SidebarGroup>
      {/* Only show group label if groupTitle is provided */}
      {groupTitle && <SidebarGroupLabel>{groupTitle}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const activeState = activeStates[item.title]
          const hasSubItems = item.items && Array.isArray(item.items) && item.items.length > 0

          // Debug: uncomment baris ini untuk melihat data
          // console.log(`Item: ${item.title}, hasSubItems: ${hasSubItems}, items:`, item.items)

          // Jika item tidak memiliki sub-items, render sebagai link biasa
          if (!hasSubItems) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={activeState.isMainActive}
                >
                  <Link href={item.url} prefetch={true}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // Jika item memiliki sub-items, render sebagai collapsible
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={activeState.isOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={activeState.isMainActive || activeState.hasActiveSubItem}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item?.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === subItem.url}
                        >
                          <Link href={subItem.url} prefetch={true}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}