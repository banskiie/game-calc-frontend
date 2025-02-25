import { Loader2 } from "lucide-react"
import React from "react"

const PageLoader = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <Loader2 strokeWidth={2} className="w-1/3 h-1/3 animate-spin text-primary" />
    </div>
  )
}

export default PageLoader
