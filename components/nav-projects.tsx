"use client"

import { Folder, MoreHorizontal, Share, Trash2, Plus, type LucideIcon } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { PermissionGuard } from "@/components/rbca-guard"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface Project {
  id: number
  name: string
  url: string | null
  icon: string
  description: string | null
}

export function NavProjects() {
  const { data: session } = useSession()
  const { isMobile } = useSidebar()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects()
    } else {
      setLoading(false)
    }
  }, [session?.user?.id])

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      } else {
        // If API fails, show some mock projects for demo
        setProjects([
          { id: 1, name: "Design System", url: "#", icon: "Folder", description: "Component library" },
          { id: 2, name: "Marketing Site", url: "#", icon: "Folder", description: "Company website" },
          { id: 3, name: "Mobile App", url: "#", icon: "Folder", description: "iOS and Android app" },
        ])
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error)
      // Show mock projects on error
      setProjects([
        { id: 1, name: "Design System", url: "#", icon: "Folder", description: "Component library" },
        { id: 2, name: "Marketing Site", url: "#", icon: "Folder", description: "Company website" },
        { id: 3, name: "Mobile App", url: "#", icon: "Folder", description: "iOS and Android app" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (iconName: string): LucideIcon => {
    const icons: Record<string, LucideIcon> = {
      Folder,
      // Add more icons as needed
    }
    return icons[iconName] || Folder
  }

  if (loading) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <SidebarMenu>
          {Array.from({ length: 3 }).map((_, i) => (
            <SidebarMenuItem key={i}>
              <div className="h-8 w-full animate-pulse rounded-md bg-muted" />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <PermissionGuard permission="projects.view">
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <SidebarMenu>
          {projects.map((project) => {
            const IconComponent = getIconComponent(project.icon)
            return (
              <SidebarMenuItem key={project.id}>
                <SidebarMenuButton asChild>
                  <a href={project.url || "#"}>
                    <IconComponent />
                    <span>{project.name}</span>
                  </a>
                </SidebarMenuButton>
                <PermissionGuard permission="projects.write">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <MoreHorizontal />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48"
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                    >
                      <DropdownMenuItem>
                        <Folder className="text-muted-foreground" />
                        <span>View Project</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share className="text-muted-foreground" />
                        <span>Share Project</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <PermissionGuard permission="projects.delete">
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="text-destructive" />
                          <span>Delete Project</span>
                        </DropdownMenuItem>
                      </PermissionGuard>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </PermissionGuard>
              </SidebarMenuItem>
            )
          })}
          <PermissionGuard permission="projects.write">
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Plus />
                <span>Add Project</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </PermissionGuard>
        </SidebarMenu>
      </SidebarGroup>
    </PermissionGuard>
  )
}
