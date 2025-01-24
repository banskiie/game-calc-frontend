import Header from "@/components/custom/Header"
import TabNavigation from "@/components/custom/Navbar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin",
}

const AdminLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <main className="flex flex-col w-full h-screen bg-slate-200">
      <Header />
      {children}
      <TabNavigation />
    </main>
  )
}

export default AdminLayout
