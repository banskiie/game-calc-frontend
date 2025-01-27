"use client"

import { gql, useQuery } from "@apollo/client"
import Loader from "@/components/custom/Loader"
import { useParams } from "next/navigation"
import CourtForm from "../../form"
import { Loader2 } from "lucide-react"
import { Card, CardDescription } from "@/components/ui/card"

const FETCH_SUMMARY = gql`
 query FetchSummary($id: ID!) {
  fetchSessionSummary(_id: $id) {
        shuttleTotal
        courtTotal
        playerTotal
        playerSummaryRates {
            _id
            game
            name
            totalRate
        }
        durationPerCourt {
            totalDuration
            court {
                _id
                name
                price
                active
                createdAt
                updatedAt
            }
        }
    }
}

`

const Page = () => {
  const { slug } = useParams()
  console.log("Slug value:", slug) 

  const { data, loading, error } = useQuery(FETCH_SUMMARY, {
    ssr: false,
    skip: !slug, 
    variables: { id: slug },
    onCompleted: (data) => console.log(data),
  })

  if (loading) return <Loader2 />
  if (error) {
    console.error("GraphQL Error:", error)
    return <div>Error fetching Summary.</div>
  }

  const summary = data?.fetchSessionSummary
  console.log(summary)
  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2 p-2">
      <div>
      </div>
      <Card className="mx-2">
      <CardDescription className="flex flex-col gap-1">
      <div>
        <span className="block text-muted-foreground">ID</span>
        <span className="block font-semibold text-muted-foreground">{slug}</span>
      </div>
        <span className="block text-muted-foreground">Court Total</span>
        <span className="block font-semibold text-muted-foreground">
          {summary?.courtTotal.toFixed(2)}
        </span>
        <span className="block text-muted-foreground">Player Total</span>
        <span className="block font-semibold text-muted-foreground">
          {summary?.playerTotal.toFixed(2)}
          </span>
          <span className="block text-muted-foreground">Shuttle Total</span>
          <span className="block font-semibold text-muted-foreground">
            {summary?.shuttleTotal.toFixed(2)}
          </span>
          {summary?.playerSummaryRates.map((player: any) => (
            <div key={player._id}>
              <span className="block text-muted-foreground">Player: {player.name}</span>
              <span className="block font-semibold text-muted-foreground">
                {player.totalRate.toFixed(2)}
              </span>
            </div>
          ))}
          {summary?.durationPerCourt.map((court: any) => (
              <div key={court.court._id}>
                <span className="block text-muted-foreground">Court: {court.court.name}</span>
                <span className="block font-semibold text-muted-foreground">
                  {court.totalDuration.toFixed(2)}
                </span>
              </div>
            )
            )
            }
      </CardDescription>
         </Card>
    </div>
     
  )
}

export default Page
