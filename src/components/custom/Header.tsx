import React from "react"
import { SidebarTrigger } from "../ui/sidebar"

const Header = () => {
  return (
    <div className="bg-slate-50 h-10 flex items-center justify-start px-3">
      <SidebarTrigger />
    </div>
  )
}

export default Header
