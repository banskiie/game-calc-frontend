"use client"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { gql, useQuery } from "@apollo/client"
import { useRouter } from "next/navigation"
import React, { useEffect } from "react"
import CourtForm from "./form"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

const FETCH_COURTS = gql`
  query FetchCourts {
    fetchCourts {
      _id
      name
      price
      active
      createdAt
      updatedAt
    }
  }
`
const Page = () => {
  const { data, refetch, loading } = useQuery(FETCH_COURTS)
  const courts = data?.fetchCourts
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    if(session){
      console.log("courts", session)
    }
  }, [session])

  if (loading) return <Loader2 />

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2">
      <div className="sticky top-0 w-full bg-slate-200 p-2">
        <CourtForm refetch={refetch} />
      </div>
      {courts?.map((court: any) => (
        <Card
          key={court._id}
          onClick={() => router.push("/admin/courts/" + court._id)}
          className="mx-2"
        >
          <CardHeader>
            <CardTitle>{court.name}</CardTitle>
            <CardDescription>
              <span>
                <span className="font-bold">Price: </span>
                <span>{court.price.toFixed(2)}</span>
              </span>
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
      <span className="text-muted-foreground text-center">
        Court Count: {courts?.length}
      </span>
    </div>
  )
}

export default Page
