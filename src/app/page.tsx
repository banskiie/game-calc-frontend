"use client"
import { useRouter } from "next/navigation"

const Home = () => {
  const router = useRouter()

  return router.push("/admin")
}

export default Home
