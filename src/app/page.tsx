"use client"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "react-day-picker"

const Home = () => {
  const router = useRouter()

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-primary">
      <div className="flex flex-col h-fit w-full items-center bg-white">
        <h1>Game Calculator</h1>
        <Input className="w-full" placeholder="Enter your username" />
        <Input className="w-full" placeholder="Enter your password" />
        <Button onClick={() => router.push("/admin/sessions")}>Sign In</Button>
      </div>
    </div>
  )
}

export default Home
