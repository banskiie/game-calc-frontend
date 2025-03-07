"use client"
import { gql, useQuery } from "@apollo/client"
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { saveAs } from "file-saver"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

const FETCH_SUMMARY = gql`
  query FetchSummary($id: ID!) {
    fetchSessionSummary(_id: $id) {
      totalShuttlesUsed
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

  const formatNumberWithCommas = (number: number) => {
    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Sort the name to A-Z
  const sortedPlayerSummaryRates = data?.fetchSessionSummary?.playerSummaryRates ?
  [...data.fetchSessionSummary.playerSummaryRates].sort((a, b) => a.name.localeCompare(b.name)) : []

  // useEffect(() => {
  //   if (data?.fetchSessionSummary) {
  //     exportToCSV(data.fetchSessionSummary)
  //   }
  // }, [data])

  const exportToCSV = (summary: any) => {
    const today = new Date().toISOString().split("T")[0] 
    const filename = `session_summary_${today}.csv`
    let csvContent = "Category,Value\n"

    csvContent += `ID,${slug}\n`
    csvContent += `Total Shuttles Used,${summary.totalShuttlesUsed}\n`
    csvContent += `Court Total,${summary.courtTotal.toFixed(2)}\n`
    csvContent += `Shuttle Total,${summary.shuttleTotal.toFixed(2)}\n`
    csvContent += `Player Total,${summary.playerTotal.toFixed(2)}\n\n`

    csvContent += "Court Name,Total Duration (mins)\n"
    summary.durationPerCourt.forEach((court: any) => {
      csvContent += `${court.court.name},${court.totalDuration}\n`
    })

    csvContent += "\nPlayer Name,Total Rate\n"
    summary.playerSummaryRates.forEach((player: any) => {
      csvContent += `${player.name},${player.totalRate.toFixed(2)}\n`
    })

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, filename)
  }

  if (loading) return <div className="flex-1 h-fit flex items-center justify-center"> <Loader2 className="animate-spin" size={200} /></div>
  if (error) {
    console.error("GraphQL Error:", error)
    return <div>Error fetching Summary.</div>
  }

  const summary = data?.fetchSessionSummary

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2 p-2">
      <div>
        <span className="block font-semibold text-muted-foreground">ID</span>
        <span className="block font-bold text-muted-foreground">
          {slug}
        </span>
      </div>
      {summary?.durationPerCourt.map((court: any) => (
        <div key={court.court._id}>
          <span className="block font-semibold text-muted-foreground">Court Duration</span>
          <span className="block font-bold text-muted-foreground">
            {court.court.name} - {court.totalDuration}mins
          </span>
        </div>
      ))}
      <div>
        <span className="block font-semibold text-muted-foreground">Shuttles Used</span>
        <span className="block font-bold text-muted-foreground">
          {summary?.totalShuttlesUsed} shuttles
        </span>
      </div>
      <Separator className="bg-slate-400" />
      <div className="grid grid-cols-2">
        <div>
          <span className="block font-semibold text-muted-foreground">Court Total</span>
          <span className="block font-bold text-muted-foreground">
            {formatNumberWithCommas(summary?.courtTotal)}
          </span>
        </div>
        <div>
          <span className="block font-semibold text-muted-foreground">Shuttle Total</span>
          <span className="block font-bold text-muted-foreground">
          {formatNumberWithCommas(summary?.shuttleTotal)}
          </span>
        </div>
        <div>
          <span className="block font-semibold text-muted-foreground">Player Total</span>
          <span className="block font-bold text-muted-foreground">
            {formatNumberWithCommas(summary?.playerTotal)}
          </span>
        </div>
      </div>

      <Separator className="bg-slate-400" />
      <div className="grid grid-cols-2">
        {sortedPlayerSummaryRates.map((player: any) => (
          <div key={player._id}>
            <span className="block font-semibold text-muted-foreground">{player.name}</span>
            <span className="block font-bold text-muted-foreground">
              {formatNumberWithCommas(player.totalRate)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Page
