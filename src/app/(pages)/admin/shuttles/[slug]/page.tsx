"use client"
import { gql, useQuery } from "@apollo/client"
import Loader from "@/components/custom/Loader"
import { useParams } from "next/navigation"
import ShuttleForm from "../form"

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

  if (loading) return <Loader />

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2 p-2">
      <div>
        <ShuttleForm id={slug as string} />
      </div>
      <div>
        <span className="block text-muted-foreground">Shuttle Name</span>
        <span className="block font-semibold text-muted-foreground">
          {shuttle?.name}
        </span>
      </div>
      <div>
        <span className="block text-muted-foreground">Shuttle Price</span>
        <span className="block font-semibold text-muted-foreground">
          {shuttle?.price.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

export default Page
