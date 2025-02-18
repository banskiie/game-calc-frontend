"use client"

import { useRouter, useParams } from "next/navigation"
import { gql, useMutation, useQuery } from "@apollo/client"
import { CircleStop, Dice5, FileText, Loader2, Menu } from "lucide-react"
import drink from "@/assets/drink.png"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Frown } from "lucide-react"
import GameForm from "../form"
import { differenceInMinutes, format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import ShuttleIcon from "@/assets/svg/shuttle.svg"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"

const FETCH_SESSION = gql`
  query FetchSession($id: ID!) {
    fetchSession(_id: $id) {
      _id
      start
      end
      createdAt
      updatedAt
      games {
        _id
        start
        end
        winner
        status
        active
        A1 {
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
        A2 {
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
        B1 {
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
        B2 {
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
        court {
          _id
          name
          price
          active
          createdAt
          updatedAt
        }
        shuttlesUsed {
          shuttle {
            _id
            name
            price
            active
            createdAt
            updatedAt
          }
          quantity
        }
      }
    }
  }
`

const END_GAME = gql`
  mutation EndGame($id: ID!, $end: DateTime!, $status: Status) {
    updateGame(input: { _id: $id, end: $end, status: $status }) {
      status
      end
      _id
    }
  }
`

const END_SESSION = gql`
  mutation EndSession($id: ID!) {
    endSession(_id: $id) {
      _id
    }
  }
`

const FETCH_GAMES_BY_SESSION = gql`
  query FetchGamesBySession($session: ID!) {
    fetchGamesBySession(session: $session) {
      _id
      start
      end
      winner
      status
      active
      A1 {
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
      A2 {
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
      B1 {
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
      B2 {
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
      court {
        _id
        name
        price
        active
        createdAt
        updatedAt
      }
      shuttlesUsed {
        shuttle {
          _id
          name
          price
          active
          createdAt
          updatedAt
        }
        quantity
      }
    }
  }
`
const Page = () => {
  const { slug } = useParams();
  const { data, loading, error, refetch } = useQuery(FETCH_SESSION, {
    ssr: false,
    skip: !slug,
    variables: { id: slug },
  });

  const { data: gameData, refetch: refetchGames } = useQuery(
    FETCH_GAMES_BY_SESSION,
    {
      variables: { session: slug },
    }
  );
  const [endSession] = useMutation(END_SESSION);
  const [endGame] = useMutation(END_GAME);
  const router = useRouter();
  const session = data?.fetchSession;

  // State for dropdown open/close
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (loading)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;
  if (!session) return <div>No session data available</div>;

  const isSessionEnded = !!session.end;

  const totalShuttlesUsed = gameData?.fetchGamesBySession
    ?.flatMap((game: any) => game.shuttlesUsed)
    .reduce((acc: number, shuttle: any) => acc + shuttle.quantity, 0);

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-4 p-4">
      {/* Session Summary Card */}
      <Card className="p-5 w-full max-w-xl mx-auto shadow-inner flex items-center justify-center bg-opacity-100 shadow-gray-500/60">
        <CardContent className="flex flex-col items-center text-center pb-2">
          <span className="block text-muted-foreground font-semibold">
            {session.start
              ? format(new Date(session.start), "MMMM dd, YYY")
              : "TBA"}
          </span>
          {session.games.length > 0 && (
            <span className="block text-muted-foreground font-semibold">
              {format(new Date(session.games[0].start), "hh:mm a")} to{" "}
              {session.games[session.games.length - 1].end
                ? format(
                    new Date(session.games[session.games.length - 1].end),
                    "hh:mm a"
                  )
                : "TBA"}{" "}
            </span>
          )}
          <span className="block text-muted-foreground font-semibold">
            Total Shuttles Used: {totalShuttlesUsed || 0}
          </span>
        </CardContent>
      </Card>

      <div className="flex flex-row justify-center gap-4 mt-4">
        <GameForm sessionId={slug as string} refetch={refetchGames}
          disabled={isSessionEnded}
        />
        <button
          onClick={() => router.push(`/admin/sessions/summary/session/${slug}`)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
        >
          View Summary
        </button>

        {!session.end && (
          <button
            onClick={async () => {
              await endSession({ variables: { id: session._id } });
              await refetch();
              console.log("Ending session...");
            }}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 rounded-r-3xl h-10 w-20 flex justify-center align-center"
          >
            <CircleStop className="!w-6 !h-6" />
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {gameData?.fetchGamesBySession.length > 0 ? (
          gameData?.fetchGamesBySession.map((game: any) => (
            <Card key={game._id} className="relative p-1 w-full max-w-xl mx-auto shadow-inner bg-opacity-100 shadow-gray-500/60 flex flex-col">
              <span className="text-center">
                <CardHeader className="mb-3 mt-[-0.45rem]">
                  <CardDescription>
                    <div className="flex items-start justify-center gap-52">
                      {/* Left Column: CardTitle and Time Details */}
                      <div className="flex flex-col items-center">
                        <CardTitle className="text-center font-bold text-black text-md">{game.court.name}</CardTitle>
                        <div className="flex flex-col items-center">
                          <span className="font-bold">
                            {format(new Date(game.start), "hh:mm a")} - {game?.end ? format(new Date(game.end), "hh:mm a") : "TBA"}
                          </span>
                          {game?.end && (
                            <span className="text-xs font-semibold font-muted-foreground">
                              ({differenceInMinutes(new Date(game?.end), new Date(game.start)) + " mins"})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="font-bold text-md text-black block text-center">Shuttles</span>
                        <div className="flex flex-col gap-2">
                          {game.shuttlesUsed.map((shuttle: any) =>
                            shuttle.quantity > 0 ? (
                              <div key={shuttle.shuttle._id} className="flex items-center gap-2">
                                <span className="font-bold">{shuttle.shuttle.name}</span> ({shuttle.quantity}) -
                                <div className="flex items-center justify-center mt-1">
                                  {Array.from({ length: shuttle.quantity }).map((_, idx) => (
                                    <Image
                                      key={`${shuttle.shuttle._id}-${idx}`}
                                      src={ShuttleIcon}
                                      alt="Shuttle Icon"
                                      className="h-3.5 w-3.5"
                                    />
                                  ))}
                                </div>
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
              </span>

              <CardContent>
                <Card className="shadow-inner shadow-gray-400/50 p-2 mb-[-0.95rem] mt-[-2rem]">
                  <div className="grid grid-cols-3 items-center">
                    <div className="text-center">
                      <span className="font-semibold text-sm text-gray-500">Team A</span>
                      <div className="space-y-1">
                        <span className="font-bold">{game.A1.name}</span> & <span className="font-bold">{game.A2?.name}</span>
                      </div>
                    </div>
                    <div className="text-center font-bold text-xl">vs</div>
                    <div className="text-center">
                      <span className="font-semibold text-sm text-gray-500">Team B</span>
                      <div className="space-y-1">
                        <span className="font-bold">{game.B1.name}</span> & <span className="font-bold">{game.B2?.name}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </CardContent>

             {/* Hamburger Menu (Dropdown) */}
             <div className="absolute top-2 right-2 z-50">
  <DropdownMenu onOpenChange={(open) => setIsDropdownOpen(open)}>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-11 w-11 rounded-full flex items-center justify-center">
        <Menu className={`h-6 w-6 transition-transform ${isDropdownOpen ? "rotate-90" : ""}`} />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-auto px-4 min-w-0 space-y-3 overflow-y-auto max-h-[300px]" align="end">
      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="p-0">
        <div onClick={(e) => e.stopPropagation()}>
          <GameForm id={game._id} refetch={refetchGames} sessionId={slug as string} />
        </div>
      </DropdownMenuItem>
      {game?.end ? (
        <DropdownMenuItem className="p-0"> 
          <Button
            onClick={() => router.push("/admin/sessions/summary/game/" + game._id)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center h-11 w-11 rounded-full"
          >
            <FileText className="!h-6 !w-6" />
          </Button>
        </DropdownMenuItem>
      ) : (
        <DropdownMenuItem className="p-0"> 
          <Button
            variant="destructive"
            onClick={() =>
              endGame({
                variables: { id: game._id, end: new Date(), status: "completed" },
              })
            }
            className="flex items-center justify-center h-11 w-11 rounded-full"
          >
            <CircleStop className="!h-6 !w-6" />
          </Button>
        </DropdownMenuItem>
      )}
    </DropdownMenuContent>
  </DropdownMenu>
</div>
            </Card>
          ))
        ) : (
          <Card className="w-full max-w-md text-center p-6 mt-5 mx-auto">
            <CardContent>
              <div className="flex flex-col items-center">
                <Frown className="w-16 h-16 text-gray-500 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  No games available for this session
                </h2>
                <p className="text-sm text-gray-600">
                  It seems like there are no Games Scheduled/Created. Try
                  checking back later!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};


export default Page;