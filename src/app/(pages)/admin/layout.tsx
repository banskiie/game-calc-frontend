import AppSidebar from "@/components/custom/AppSidebar"
import Header from "@/components/custom/Header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SidebarProvider } from "@/components/ui/sidebar"
import type { Metadata } from "next"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Admin",
}

const AdminLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const store = await cookies()
  const open = store.get("sidebar:state")?.value === "true"
  return (
    <SidebarProvider defaultOpen={open}>
      <AppSidebar />
      <main className="flex flex-col w-full h-screen bg-slate-200">
        <Header />
        <ScrollArea className="max-h-[calc(100vh-2.5rem)]">
          {children}
        </ScrollArea>
      </main>
    </SidebarProvider>
  )
}

export default AdminLayout
