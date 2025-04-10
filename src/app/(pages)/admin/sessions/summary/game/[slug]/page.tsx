'use client'
import { gql, useQuery } from "@apollo/client"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { differenceInMinutes } from "date-fns"

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

const formatNumberWithCommas = (number: number) => {
  return number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// const formatDate = (isoString: string) => {
//   if (!isoString) return 'N/A'
//   const date = new Date(isoString)
//   return date.toLocaleDateString('en-US', {
//     timeZone: 'UTC',
//     year: 'numeric',
//     month: 'long',
//     day: '2-digit',
//   })
// }

const Page = () => {
  const { slug } = useParams()

  const { data, loading, error } = useQuery(FETCH_SUMMARY, {
    ssr: false,
    skip: !slug,
    variables: { id: slug },
    onCompleted: (data) => console.log(data),
  })

  // const handleScreenshot = () => {
  //   const gameSummaryContainer = document.getElementById('game-summary-container')
  //   if (gameSummaryContainer) {
  //     html2canvas(gameSummaryContainer).then((canvas) => {
  //       const link = document.createElement('a')
  //       link.download = `game-summary-${slug}.png`
  //       link.href = canvas.toDataURL()
  //       link.click()
  //     })
  //   }
  // }

  if (loading) return (
    <div className="flex-1 h-fit flex items-center justify-center">
      <Loader2 className="animate-spin" size={200} />
    </div>
  )
  
  if (error) {
    console.error("GraphQL Error:", error)
    return <div>Error fetching Summary.</div>
  }

  const summary = data?.fetchGameSummary
  const gameDuration = differenceInMinutes(new Date(summary?.game.end), new Date(summary?.game.start))
  // const totalShuttlesUsed = summary?.game.shuttlesUsed.reduce((acc: number, shuttle: any) => acc + shuttle.quantity, 0) || 0
  const shuttleNames = summary?.game.shuttlesUsed
  ?.map((item: any) => `${item.shuttle.name} (${item.quantity})`)
  .join(', ') || 'N/A'

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-4 p-4" id="game-summary-container">
      {/* Game Info Cards - Modified to show Shuttles Used instead of Game ID */}
      <div className="flex flex-wrap gap-4 justify-between">
        <Card className="shadow-md border flex-1 min-w-[200px]">
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold">
              Shuttles Used
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground font-semibold">
            <div className="text-md text-muted-foreground">{shuttleNames}</div>
          </CardContent>
        </Card>

        <Card className="shadow-md border flex-1 min-w-[200px]">
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold">
              Game Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground font-semibold">
            {gameDuration} mins
          </CardContent>
        </Card>

        <Card className="shadow-md border flex-1 min-w-[200px]">
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold">
              Players
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground font-semibold">
            {summary?.players.length} players
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-slate-400" />

      {/* Cost Breakdown Table */}
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead colSpan={3} className="text-center text-lg font-bold bg-white text-black">
              Cost Breakdown
            </TableHead>
          </TableRow>
          <TableRow className="bg-gray-100">
            <TableHead className="border font-bold">Item</TableHead>
            <TableHead className="border font-bold">Details</TableHead>
            <TableHead className="border font-bold">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Court Information */}
          <TableRow className="bg-white">
            <TableCell className="font-semibold border">Court</TableCell>
            <TableCell className="border">
              {summary?.game.court.name} (₱{summary?.game.court.price.toFixed(2)}/hr)
            </TableCell>
            <TableCell className="font-bold border">
              ₱{formatNumberWithCommas(summary?.courtRate)}
            </TableCell>
          </TableRow>

          {/* Shuttle Information */}
          {summary?.game.shuttlesUsed.map((shuttle: any, index: number) => (
            <TableRow key={shuttle.shuttle._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <TableCell className="font-semibold border">Shuttle</TableCell>
              <TableCell className="border">
                {shuttle.shuttle.name} (₱{shuttle.shuttle.price.toFixed(2)} × {shuttle.quantity})
              </TableCell>
              <TableCell className="font-bold border">
                ₱{formatNumberWithCommas(shuttle.shuttle.price * shuttle.quantity)}
              </TableCell>
            </TableRow>
          ))}

          {/* Total Row */}
          <TableRow className="bg-gray-100">
            <TableCell className="font-semibold border">Total</TableCell>
            <TableCell className="border"></TableCell>
            <TableCell className="font-bold border">
              ₱{formatNumberWithCommas(summary?.totalRate)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Separator className="bg-slate-400" />

      {/* Player Breakdown Table */}
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead colSpan={4} className="text-center text-lg font-bold bg-white text-black">
              Player Breakdown
            </TableHead>
          </TableRow>
          <TableRow className="bg-gray-100">
            <TableHead className="border font-bold">Player</TableHead>
            <TableHead className="border font-bold">Court Share</TableHead>
            <TableHead className="border font-bold">Shuttle Share</TableHead>
            <TableHead className="border font-bold">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summary?.players.map((player: any, index: number) => (
            <TableRow key={player._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <TableCell className="font-semibold border">{player.name}</TableCell>
              <TableCell className="border">
                ₱{formatNumberWithCommas(summary?.courtRatePerPlayer)}
              </TableCell>
              <TableCell className="border">
                ₱{formatNumberWithCommas(summary?.shuttleRatePerPlayer)}
              </TableCell>
              <TableCell className="font-bold border">
                ₱{formatNumberWithCommas(summary?.totalRatePerPlayer)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* <div className="flex justify-center mt-4">
        <button
          onClick={handleScreenshot}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
        >
          Save as Image
        </button>
      </div> */}
    </div>
  )
}

export default Page