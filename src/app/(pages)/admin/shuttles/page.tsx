"use client"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { gql, useQuery } from "@apollo/client"
import { useRouter } from "next/navigation"
import React from "react"
import ShuttleForm from "./form"
import { Loader2 } from "lucide-react"

const FETCH_SHUTTLES = gql`
  query FetchShuttles {
    fetchShuttles {
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
  const { data, refetch, loading } = useQuery(FETCH_SHUTTLES)
  const shuttles = data?.fetchShuttles
  const router = useRouter()

  if (loading) return <Loader2 />

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2">
      <div className="sticky top-0 w-full bg-slate-200 p-2">
        <ShuttleForm refetch={refetch} />
      </div>
      {shuttles?.map((court: any) => (
        <Card
          key={court._id}
          onClick={() => router.push("/admin/shuttles/" + court._id)}
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
        Shuttle Count: {shuttles.length}
      </span>
    </div>
  )
}

export default Page
