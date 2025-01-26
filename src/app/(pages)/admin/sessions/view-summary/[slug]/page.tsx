"use client"

import { gql, useQuery } from "@apollo/client"
import Loader from "@/components/custom/Loader"
import { useParams } from "next/navigation"
import CourtForm from "../../form"

const FETCH_SESSION = gql`
  query FetchSession($id: ID!) {
    fetchSession(_id: $id) {
      _id
      price
      games {
        _id
        start
        end
      }
    }
  }
`

const Page = () => {
  const { slug } = useParams()
  console.log("Slug value:", slug) 

  const { data, loading, error } = useQuery(FETCH_SESSION, {
    ssr: false,
    skip: !slug, 
    variables: { id: slug },
  })

  if (loading) return <Loader />
  if (error) {
    console.error("GraphQL Error:", error)
    return <div>Error fetching session.</div>
  }

  const session = data?.fetchSession

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2 p-2">
      <div>
        <CourtForm id={slug as string} />
      </div>
      <div>
        <span className="block text-muted-foreground">ID</span>
        <span className="block font-semibold text-muted-foreground">{session?._id}</span>
      </div>
      <div>
        <span className="block text-muted-foreground">Court Price</span>
        <span className="block font-semibold text-muted-foreground">
          {session?.price?.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

export default Page
