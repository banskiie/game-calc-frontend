"use client"
import { usePathname } from "next/navigation"
import React from "react"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

const Header = () => {
  const pathname = usePathname()
  const pathnameArray = pathname.split("/")
  const router = useRouter()
  return (
    <div className="h-12 flex items-center justify-center px-3 sticky-0 top-0 bg-primary">
      {pathnameArray.length > 3 && (
        <Button
          className="absolute left-0 border-white z-50 text-xl"
          onClick={() => router.back()}
        >
          {"<-"}
        </Button>
      )}
      <span className="capitalize antialiased text-muted font-semibold">
        {pathnameArray[2]}
      </span>
    </div>
  )
}

export default Header
