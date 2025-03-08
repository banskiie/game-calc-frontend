import { format, differenceInMinutes } from "date-fns"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ShuttleIcon from "@/assets/svg/shuttle.svg"
import { FileText } from "lucide-react"
import GameForm from "@/app/(pages)/admin/sessions/form"

interface GameCardProps {
  game: any
  refetchGames: () => void
  sessionId: string
  onEndGame: (id: string) => void
  onViewSummary: (id: string) => void
  onViewBets: (id: string) => void
  gameNumber: number
  totalGames: number
}

const GameCard = ({ game, refetchGames, sessionId, onEndGame, onViewSummary, gameNumber, totalGames  }: GameCardProps) => {
  const descendingGameNumber = totalGames - gameNumber + 1
  return (
  <Card key={game._id} className="mb-4">
      <CardHeader className="p-4 pb-2">
      <span className="text-center text-md">Game {descendingGameNumber}</span>
    </CardHeader>
    <Separator className="" />
    <CardContent className="p-4">
      <div className="w-full flex flex-row justify-between">
        <div className="flex flex-col">
          <span className="font-bold text-base">{game.A1.name} & {game.A2.name}</span>
        </div>

        <div className="flex flex-col items-end">
          <span className="font-bold text-base">{game.court.name}</span>
          <span className="text-md text-muted-foreground">
            {format(new Date(game.start), "hh:mm a")} -{" "}
            {game?.end ? format(new Date(game.end), "hh:mm a") : "TBA"}{" "}
            {game?.end && (
              <span className="font-bold">
                ({differenceInMinutes(new Date(game?.end), new Date(game?.start))} mins)
              </span>
            )}
          </span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="w-full flex flex-row justify-between">

        <div className="flex flex-col">
          <span className="font-bold text-base">{game.B1.name} & {game.B2.name}</span>
        </div>

              <div className="flex flex-col items-end">
              <div className="flex flex-col items-end">
  <span className="font-bold">Shuttles:</span>
  {game.shuttlesUsed.map((shuttle: any, index: number) => (
    (shuttle.quantity ?? 0) >= 0 && ( // Ensure 0 is displayed if quantity is null/undefined
      <div key={index} className="flex items-start justify-start gap-2 mt-2">
        <span>
          <span className="font-bold">{shuttle.shuttle?.name ?? "Unknown"}</span> ({shuttle.quantity ?? 0}) -{" "}
        </span>
        <div className="flex items-center justify-center mt-1">
          {Array.from({ length: shuttle.quantity ?? 0 }).map((_, idx) => (
            <Image key={idx} src={ShuttleIcon} alt="icon" className="h-3.5 w-3.5" />
          ))}
        </div>
      </div>
    )
  ))}
</div>
        </div>
      </div>
    </CardContent>
    {/* Buttons */}
     <Separator className="" />
    <CardFooter className="flex gap-1 p-4">
      {game?.end ? (
        <Button onClick={() => onViewSummary(game._id)} className="bg-blue-600 hover:bg-blue-700 text-white h-10 w-18">
          <FileText className="!w-7 !h-7" />
        </Button>
      ) : (
        <Button variant="destructive" onClick={() => onEndGame(game._id)} className="h-10 w-18">
          End Game
        </Button>
      )}
      <GameForm id={game._id} refetch={refetchGames} sessionId={sessionId} />
      {/* <Button onClick={() => onViewBets(game._id)} className="bg-yellow-600 hover:bg-yellow-700 h-10 w-18">
        <Image src={drink} alt="Betting" className="!w-7 !h-7 text-white" />
      </Button> */}
    </CardFooter>
  </Card>
)}

export default GameCard