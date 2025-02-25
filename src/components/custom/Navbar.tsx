"use client"
import React from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, CircleUser, LandPlot, PackageOpen } from "lucide-react"
import { usePathname } from "next/navigation"

const items = [
  {
    title: "sessions",
    url: "/admin/sessions",
    icon: Calendar,
  },
  {
    title: "courts",
    url: "/admin/courts",
    icon: LandPlot,
  },
  {
    title: "shuttles",
    url: "/admin/shuttles",
    icon: PackageOpen,
  },
  {
    title: "Profiles",
    url: "/admin/profiles",
    icon: CircleUser,
  },
  ]

const TabNavigation = () => {
  const currentPath = usePathname()

  return (
    <div className="h-20 flex items-center justify-around bg-slate-50 sticky bottom-0 w-full">
      {items.map((item, index) => (
        <Button
          variant="ghost"
          key={index}
          className={`transition rounded-none ease-linear text-primary hover:text-primary hover:bg-primary/10 active:bg-primary/10 active:text-primary pt-4 ${
            currentPath.startsWith(item.url)
              ? "bg-primary text-white hover:bg-primary hover:text-white hover:no-underline"
              : undefined
          }`}
          asChild
        >
          <Link
            href={item.url}
            className="flex flex-col items-center justify-center w-full h-full"
          >
            <item.icon className="scale-[1.75]" />
            <span className="font-semibold capitalize">{item.title}</span>
          </Link>
        </Button>
      ))}
    </div>
  )
}

export default TabNavigation
