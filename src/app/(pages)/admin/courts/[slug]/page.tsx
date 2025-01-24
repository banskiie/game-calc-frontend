"use client"
import { gql, useQuery } from "@apollo/client"
import Loader from "@/components/custom/Loader"
import { useParams } from "next/navigation"
import CourtForm from "../form"

const FETCH_COURT = gql`
  query FetchCourt($id: ID!) {
    fetchCourt(_id: $id) {
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
  const { data, loading } = useQuery(FETCH_COURT, {
    ssr: false,
    skip: !slug,
    variables: { id: slug },
  })
  const court = data?.fetchCourt

  if (loading) return <Loader />

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2 p-2">
      <div>
        <CourtForm id={slug as string} />
      </div>
      <div>
        <span className="block text-muted-foreground">Court Name</span>
        <span className="block font-semibold text-muted-foreground">
          {court?.name}
        </span>
      </div>
      <div>
        <span className="block text-muted-foreground">Court Price</span>
        <span className="block font-semibold text-muted-foreground">
          {court?.price.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

export default Page
