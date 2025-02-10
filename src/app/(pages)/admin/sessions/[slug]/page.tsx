"use client"

import { useRouter, useParams } from "next/navigation"
import { gql, useMutation, useQuery } from "@apollo/client"
import { Loader2 } from "lucide-react"
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
import BetSummaryModal from "../modal/BetSummaryModal"

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
const FETCH_BET = gql`
query FetchBet($id: ID!) {
    fetchBet(_id: $id) {
        _id
        betType
        betAmount
        paid
        active
        bettorForA {
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
        bettorForB {
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
        game {
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
  const { slug } = useParams()
  const { data, loading, error, refetch } = useQuery(FETCH_SESSION, {
    ssr: false,
    skip: !slug,
    variables: { id: slug },
  })
  const { data: betData, refetch: refetchBet } = useQuery(FETCH_BET, {
    variables: { bet_id: slug },
  })
  const { data: gameData, refetch: refetchGames } = useQuery(
    FETCH_GAMES_BY_SESSION,
    {
      variables: { session: slug },
    }
  )
  const [endSession] = useMutation(END_SESSION)
  const [endGame] = useMutation(END_GAME)
  const router = useRouter()
  const session = data?.fetchSession

  if (loading)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    )
  if (error) return <div>Error: {error.message}</div>
  if (!session) return <div>No session data available</div>
  
  const isSessionEnded = !!session.end
  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-4 p-4">
    
        <div>
        <GameForm sessionId={slug as string} refetch={refetchGames} 
          disabled={isSessionEnded}
        />
        </div>
     
      <Card className="p-3 w-full max-w-md mx-auto shadow-inner flex items-center justify-center bg-opacity-100 shadow-gray-500/60">
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
        </CardContent>
      </Card>
      <div className="flex flex-row justify-center gap-4 mt-4">
        <button
          onClick={() => router.push(`/admin/sessions/summary/session/${slug}`)}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
        >
          View Summary
        </button>

        <button
            onClick={() => router.push(`/admin/sessions/summary/bets/${slug}`)}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
          >
            View Bet Summary
      </button>

      {/* KANI ANG MODAL */}
            <BetSummaryModal
        sessionId={slug as string}
        betTypes={betData?.fetchBet ? [betData.fetchBet.betType] : []}
        games={gameData?.fetchGamesBySession || []}
      />
      
        {!session.end && (
          <button
            onClick={ async () => {
            await endSession({ variables: { id: session._id } })
              await refetch()
              console.log("Ending session...")
            }}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700"
          >
            End Session
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {gameData?.fetchGamesBySession.length > 0 ? (
          gameData?.fetchGamesBySession.map((game: any) => (
            <Card key={game._id} className="">
              <CardHeader>
                <CardTitle>{game.court.name}</CardTitle>
                <CardDescription>
                  {format(new Date(game.start), "hh:mm a")} -{" "}
                  {game?.end ? format(new Date(game.end), "hh:mm a") : "TBA"}{" "}
                  {game?.end && (
                    <span className="font-bold">
                      (
                      {differenceInMinutes(
                        new Date(game?.end),
                        new Date(game?.start)
                      ) + " mins"}
                      )
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full flex flex-row justify-between">
                  <div className="flex flex-col">
                    <span>{game.A1.name}</span>
                    {game.A2.name && <span>{game.A2.name}</span>}
                  </div>
                  <div className="flex flex-col">
                    <span>{game.B1.name}</span>
                    {game.B2.name && <span>{game.B2.name}</span>}
                  </div>
                </div>
                <Separator className="my-2" />
                <div>
                  Shuttles:{" "}
                  {game.shuttlesUsed.map((shuttle: any, index: number) => {
                    if (shuttle.quantity === 0) return "N/A"
                    return (
                      <div
                        key={index}
                        className="flex items-start justify-start gap-2"
                      >
                        <span>
                          <span className="font-bold">
                            {shuttle.shuttle.name}
                          </span>{" "}
                          ({shuttle.quantity}) -{" "}
                        </span>
                        <div className="flex items-center justify-center mt-1">
                          {Array.from({
                            length: shuttle.quantity,
                          }).map((_, index) => (
                            <Image
                              key={index}
                              src={ShuttleIcon}
                              alt="icon"
                              className="h-3.5 w-3.5"
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex gap-1">
                {game?.end ? (
                  <Button
                    onClick={() =>
                      router.push("/admin/sessions/summary/game/" + game._id)
                    }
                  >
                    Summary
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => 
                      endGame({
                        variables: {
                          id: game._id,
                          end: new Date(),
                          status: "completed",
                        },
                      
                      })
                    }
                  >
                    End Game
                  </Button>
                  
                )}
                
                <GameForm
                  id={game._id}
                  refetch={refetchGames}
                  sessionId={slug as string}
                />
               
                  {/* <Button
                    onClick={() =>
                      router.push("/admin/sessions/games/bets/" + game._id)
                    }
                  >
                    View Bet
                  </Button> */}
                  <Button
                onClick={() =>
                  router.push(`/admin/sessions/games/bets/${game._id}`)
                }
              >
                View Bet
              </Button>
                
              </CardFooter>
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
  )
}

export default Page
