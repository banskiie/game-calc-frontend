"use client"
import { gql, useQuery } from "@apollo/client"
import { useParams } from "next/navigation"
import ShuttleForm from "../form"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const FETCH_SHUTTLE = gql`
  query FetchShuttle($id: ID!) {
    fetchShuttle(_id: $id) {
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
  const { slug } = useParams()
  const { data, loading } = useQuery(FETCH_SHUTTLE, {
    ssr: false,
    skip: !slug,
    variables: { id: slug },
  })
  const shuttle = data?.fetchShuttle

  if (loading) return <Loader2 />

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2 p-2">
      <div>
        <ShuttleForm id={slug as string} />
      </div>
      <Card className="mx-2">
        <CardHeader>
          <CardTitle>{shuttle?.name}</CardTitle>
          <CardDescription className="flex flex-col gap-1">
            <span>
              <span className="font-semibold">Shuttle Price: </span>
              <span>{shuttle?.price.toFixed(2)}</span>
            </span>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default Page
