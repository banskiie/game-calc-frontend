'use client'

import { useRouter, useParams } from 'next/navigation'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Loader2, Frown } from 'lucide-react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import GameForm from '../form'
import GameCard from '@/components/custom/GameCard'
import { Separator } from '@/components/ui/separator'

const FETCH_SESSION = gql`
    query FetchSession($id: ID!) {
        fetchSession(_id: $id) {
            _id
            start
            end
            games {
                _id
                start
                end
                winner
                status
                active
                A1 {
                    name
                }
                A2 {
                    name
                }
                B1 {
                    name
                }
                B2 {
                    name
                }
                court {
                    name
                }
                shuttlesUsed {
                    shuttle {
                        name
                    }
                    quantity
                }
            }
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

const END_GAME = gql`
    mutation EndGame($id: ID!, $end: DateTime!, $status: Status) {
        updateGame(input: { _id: $id, end: $end, status: $status }) {
            status
            end
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
                name
            }
            A2 {
                name
            }
            B1 {
                name
            }
            B2 {
                name
            }
            court {
                name
            }
            shuttlesUsed {
                shuttle {
                    name
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
    const { data: gameData, refetch: refetchGames } = useQuery(
        FETCH_GAMES_BY_SESSION,
        { variables: { session: slug } }
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
    const totalShuttlesUsed = gameData?.fetchGamesBySession
        ?.flatMap((game: any) => game.shuttlesUsed)
        .reduce((acc: number, shuttle: any) => acc + shuttle.quantity, 0)

    const handleEndGame = async (id: string) => {
        await endGame({
            variables: { id, end: new Date(), status: 'completed' },
        })
        refetchGames()
    }

    return (
        <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-4 p-4">
            <Card className="p-3 w-full max-w-md mx-auto shadow-inner flex items-center justify-center bg-opacity-100 shadow-gray-500/60">
                <CardContent className="flex flex-col items-center text-center pb-2">
                    <span className="block text-muted-foreground font-semibold">
                        {session.start
                            ? format(new Date(session.start), 'MMMM dd, YYY')
                            : 'TBA'}
                    </span>
                    {session.games.length > 0 && (
                        <span className="block text-muted-foreground font-semibold">
                            {format(
                                new Date(session.games[0].start),
                                'hh:mm a'
                            )}{' '}
                            to{' '}
                            {session.games[session.games.length - 1].end
                                ? format(
                                      new Date(
                                          session.games[
                                              session.games.length - 1
                                          ].end
                                      ),
                                      'hh:mm a'
                                  )
                                : 'TBA'}{' '}
                        </span>
                    )}
                    <span className="block text-muted-foreground font-semibold">
                        Shuttles: {totalShuttlesUsed || 0} shuttles
                    </span>
                </CardContent>
            </Card>

            <div className="flex flex-row justify-center gap-4 mt-4">
                {/* {isSessionEnded ? (
                    <Button
                        onClick={() =>
                            router.push(
                                `/admin/sessions/summary/session/${slug}`
                            )
                        }
                        className="bg-green-600 hover:bg-green-700 h-10"
                    >
                        View Summary
                    </Button>
                ) : (
                    <GameForm
                        sessionId={slug as string}
                        refetch={refetchGames}
                        disabled={isSessionEnded}
                    />
                )} */}

                    <GameForm
                        sessionId={slug as string}
                        refetch={refetchGames}
                        disabled={isSessionEnded}
                    />
                     <Button
                        onClick={() =>
                            router.push(
                                `/admin/sessions/summary/session/${slug}`
                            )
                        }
                        className="bg-blue-600 hover:bg-blue-700 h-10"
                    >
                      View Summary
                    </Button>
                {/* <Button
                    onClick={() =>
                        router.push(`/admin/sessions/summary/bets/${slug}`)
                    }
                    className="bg-blue-600 hover:bg-blue-700 h-10"
                >
                    View Bet Summary
                </Button> */}
                {!session.end && (
                    <Button
                        onClick={async () => {
                            await endSession({ variables: { id: session._id } })
                            refetch()
                        }}
                        className="bg-red-600 hover:bg-red-700 rounded-r-3xl h-10"
                    >
                          End Session 
                    </Button>
                )}
            </div>
            <Separator className="bg-gray-300 h-[1px]" />

            <div className="grid grid-cols-1 gap-4">
                {gameData?.fetchGamesBySession.length > 0 ? (
                    gameData.fetchGamesBySession.map((game: any, index: number) => (
                        <GameCard
                            key={game._id}
                            game={game}
                            gameNumber={index + 1} 
                            totalGames={gameData.fetchGamesBySession.length}
                            refetchGames={refetchGames}
                            sessionId={slug as string}
                            onEndGame={handleEndGame}
                            onViewSummary={(id: any) =>
                                router.push(
                                    `/admin/sessions/summary/game/${id}`
                                )
                            }
                            onViewBets={(id: any) =>
                                router.push(`/admin/sessions/games/bets/${id}`)
                            }
                        />
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
                                    It seems like there are no Games
                                    Scheduled/Created. Try checking back later!
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
