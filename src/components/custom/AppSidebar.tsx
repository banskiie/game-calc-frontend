"use client"
import { Archive, Clock10, LandPlot, Notebook, Ticket } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Menu items.
const items = [
  {
    title: "Sessions",
    url: "/admin/sessions",
    icon: Clock10,
  },
  {
    title: "Games",
    url: "/admin/games",
    icon: Ticket,
  },
  {
    title: "Bets",
    url: "/admin/bets",
    icon: Notebook,
  },
  {
    title: "Courts",
    url: "/admin/courts",
    icon: LandPlot,
  },
  {
    title: "Shuttles",
    url: "/admin/shuttles",
    icon: Archive,
  },
]

const AppSidebar = () => {
  const currentPath = usePathname()
  return (
    <Sidebar>
      <SidebarHeader>Ivan</SidebarHeader>
      <SidebarContent className="flex flex-col justify-between">
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    aria-label={item.title}
                    className={`transition ease-linear text-primary hover:text-primary hover:bg-primary/10 active:bg-primary/10 active:text-primary ${
                      currentPath == item.url
                        ? "bg-primary text-white hover:bg-primary hover:text-white hover:no-underline"
                        : undefined
                    }`}
                    asChild
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar
