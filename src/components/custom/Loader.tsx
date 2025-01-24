import { Loader2 } from "lucide-react"
import React from "react"

const Loader = () => (
  <div className="flex-1 h-fit flex items-center justify-center">
    <Loader2 className="animate-spin" size={200} />
  </div>
)

export default Loader
