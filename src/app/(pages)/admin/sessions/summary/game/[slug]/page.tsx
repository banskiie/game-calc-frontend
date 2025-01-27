"use client"

import { gql, useQuery } from "@apollo/client"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Card, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const FETCH_SUMMARY = gql`
  query FetchGameSummary($id: ID!) {
    fetchGameSummary(_id: $id) {
      courtRate
      courtRatePerPlayer
      shuttleRate
      shuttleRatePerPlayer
      totalRate
      totalRatePerPlayer
      game {
        _id
        start
        end
        winner
        status
        active
        court {
          _id
          name
          price
          active
          createdAt
          updatedAt
        }
        shuttlesUsed {
          quantity
          shuttle {
            _id
            name
            price
            active
            createdAt
            updatedAt
          }
        }
      }
      players {
        _id
        name
        contact
        password
        username
        role
        active
        createdAt
        updatedAt
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
    onCompleted: (data) => console.log(data),
  })

  if (loading) return <Loader2 />
  if (error) {
    console.error("GraphQL Error:", error)
    return <div>Error fetching Summary.</div>
  }

  const summary = data?.fetchGameSummary
  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2 p-2">
      <div>
        <span className="block">ID</span>
        <span className="block font-semibold">{slug}</span>
      </div>
      <div>
        <span className="block">Players</span>
        <span className="block font-semibold">
          {[...new Set(summary.players.map((player: any) => player.name))].join(
            ", "
          )}
        </span>
      </div>
      <div>
        <span className="block">Total Rate</span>
        <span className="block font-semibold">
          {summary.totalRate.toFixed(2)}
        </span>
      </div>
      <div>
        <span className="block">Total Rate Per Player</span>
        <span className="block font-semibold">
          {summary.totalRatePerPlayer.toFixed(2)}
        </span>
      </div>
      <Separator className="bg-slate-400" />
      <div>
        <span className="block">Court - Price</span>
        <span className="block font-semibold">
          {summary.game.court.name} - {summary.game.court.price.toFixed(2)}
        </span>
      </div>
      <div>
        <span className="block">Court Rate</span>
        <span className="block font-semibold">
          {summary.courtRate.toFixed(2)}
        </span>
      </div>
      <div>
        <span className="block">Court Rate Per Player</span>
        <span className="block font-semibold">
          {summary.courtRatePerPlayer.toFixed(2)}
        </span>
      </div>
      <Separator className="bg-slate-400" />
      {summary.game.shuttlesUsed.length > 0 &&
        summary.game.shuttlesUsed[0].quantity > 0 && (
          <div>
            Shuttles
            {summary.game.shuttlesUsed.map((shuttle: any) => (
              <div className="font-bold" key={shuttle.shuttle._id}>
                <span>{shuttle.shuttle.name} - </span>
                <span>{shuttle.shuttle.price.toFixed(2)}</span>
                <span> * {shuttle.quantity}</span>
              </div>
            ))}
          </div>
        )}
      <div>
        <span className="block">Shuttle Rate</span>
        <span className="block font-semibold">
          {summary.shuttleRate.toFixed(2)}
        </span>
      </div>
      <div>
        <span className="block">Shuttle Rate Per Player</span>
        <span className="block font-semibold">
          {summary.shuttleRatePerPlayer.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

export default Page
