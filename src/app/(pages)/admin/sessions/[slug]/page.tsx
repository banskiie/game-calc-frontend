"use client"
import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"

const Page = () => {
  const { slug } = useParams()
  const router = useRouter()

  return (
    <div>
      <Button onClick={() => router.back()}>Back</Button>
      <p>Post: {slug}</p>
    </div>
  )
}

export default Page
