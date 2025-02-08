"use client"
import { gql, useQuery } from "@apollo/client"
import { useParams } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import Loader from "@/components/custom/Loader"
import { Loader2 } from "lucide-react"

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
  const { data, loading, error } = useQuery(FETCH_SUMMARY, {
    ssr: false,
    skip: !slug,
    variables: { id: slug },
    fetchPolicy: "network-only",
  })

  if (loading) return <div className="flex-1 h-fit flex items-center justify-center"> <Loader2 className="animate-spin" size={200} /></div>
  if (error) {
    console.error("GraphQL Error:", error)
    return <div>Error fetching Summary.</div>
  }

  const summary = data?.fetchSessionSummary
  console.log(summary)
  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2 p-2">
      <div>
        <span className="block text-muted-foreground">ID</span>
        <span className="block font-semibold text-muted-foreground">
          {slug}
        </span>
      </div>
      {summary?.durationPerCourt.map((court: any) => (
        <div key={court.court._id}>
          <span className="block text-muted-foreground">Court Duration</span>
          <span className="block font-semibold text-muted-foreground">
            {court.court.name} - {court.totalDuration}mins
          </span>
        </div>
      ))}
      <Separator className="bg-slate-400" />
      <div className="grid grid-cols-2">
        <div>
          <span className="block text-muted-foreground">Court Total</span>
          <span className="block font-semibold text-muted-foreground">
            {summary?.courtTotal.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="block text-muted-foreground">Shuttle Total</span>
          <span className="block font-semibold text-muted-foreground">
            {summary?.shuttleTotal.toFixed(2)}
          </span>
        </div>
        <div>
          <span className="block text-muted-foreground">Player Total</span>
          <span className="block font-semibold text-muted-foreground">
            {summary?.playerTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <Separator className="bg-slate-400" />
      <div className="grid grid-cols-2">
        {summary?.playerSummaryRates.map((player: any) => (
          <div key={player._id}>
            <span className="block text-muted-foreground">{player.name}</span>
            <span className="block font-semibold text-muted-foreground">
              {player.totalRate.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Page
