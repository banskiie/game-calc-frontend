"use client"

import { useRouter, useParams } from "next/navigation"
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client"
import { CircleStop, FileText, Loader2, Play, SettingsIcon, UserPlus2 } from "lucide-react"
import TennisCourtIcon from '../../../../../../public/tennis-court.png'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Frown } from "lucide-react"
import GameForm from "../form"
import { differenceInMinutes, format } from "date-fns"
import ShuttleIcon from "@/assets/svg/shuttle.svg"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { PlayerSelect } from "@/components/custom/PlayerSelect"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { RefreshCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourtMultiSelect } from "@/components/custom/MultipleCourts"

const FETCH_SESSION = gql`
  query FetchSession($id: ID!) {
    fetchSession(_id: $id) {
      _id
      start
      end
      createdAt
      updatedAt
      availablePlayers {
        _id
        name
      }
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
      court {
        _id
        name
      }
    }
  }
`

const END_GAME = gql`
  mutation UpdateGame(
    $id: ID!
    $end: DateTime!
    $status: Status!
    $session: ID!
  ) {
    updateGame(
      input: {
        _id: $id
        end: $end
        status: $status
        session: $session
      }
    ) {
      _id
      end
      status
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
const TOGGLE_SESSION = gql`
  mutation ToggleSession($id: ID!, $end: DateTime) {
    toggleSession(_id: $id, end: $end) {
      _id
      start
      end
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

const FETCH_USERS = gql`
  query FetchUsers {
    fetchUsers {
      _id
      name
    }
  }
`

const FETCH_COURT = gql`
  query FetchCourts {
    fetchCourts {
      _id
      name
    }
  }
`

const ADD_PLAYERS_TO_SESSION = gql`
  mutation AddPlayersToSession($sessionId: ID!, $playerIds: [ID!]!) {
    addPlayersToSession(sessionId: $sessionId, playerIds: $playerIds) {
      _id
      availablePlayers {
        _id
        name
      }
    }
  }
`

const REMOVE_PLAYERS_FROM_SESSION = gql`
  mutation RemovePlayersFromSession($sessionId: ID!, $playerIds: [ID!]!) {
    removePlayersFromSession(sessionId: $sessionId, playerIds: $playerIds) {
      _id
      availablePlayers {
        _id
        name
      }
    }
  }
`

const ADD_COURT_TO_SESSION = gql`
  mutation AddCourtToSession($sessionId: ID!, $courtId: ID!) {
    addCourtToSession(sessionId: $sessionId, courtId: $courtId) {
      _id
      court {
        _id
        name
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
  const [fetchUsers, { data: usersData, refetch: refetchUsers }] = useLazyQuery(FETCH_USERS)
  const { data: gameData, refetch: refetchGames } = useQuery(
    FETCH_GAMES_BY_SESSION,
    {
      variables: { session: slug },
      skip: !slug,
      fetchPolicy: "network-only",
    }
  )
  const [toggleSession] = useMutation(TOGGLE_SESSION, {
    onCompleted: () => {
      refetch();
      toast.success("Session status updated!");
    },
    onError: (error) => {
      toast.error(`Failed to update session: ${error.message}`);
    },
  })

  const [endGame] = useMutation(END_GAME, {
    onCompleted: () => {
      toast.success("Game ended successfully!")
      refetchGames()
    },
    onError: (error) => {
      toast.error(`Failed to end game: ${error.message}`)
    },
  })

  const [addPlayersToSession] = useMutation(ADD_PLAYERS_TO_SESSION, {
    onCompleted: () => {
      toast.success("Players added to session successfully!")
      refetch()
      setIsPlayerSelectModalOpen(false)
    },
    onError: (error) => {
      toast.error(`Failed to add players: ${error.message}`)
    },
  })
  
  const [removePlayersFromSession] = useMutation(REMOVE_PLAYERS_FROM_SESSION, {
    onCompleted: () => {
      toast.success("Players Removed from Session Successfully")
      refetch()
    },
    onError: (error) => {
      toast.error(`Failed to Remove Players', ${error.message}`)
    }
  })

  const router = useRouter()
  const session = data?.fetchSession

  const [activeTab, setActiveTab] = useState("all")
  const [isPlayerSelectModalOpen, setIsPlayerSelectModalOpen] = useState(false)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [tempSelectedPlayers, setTempSelectedPlayers] = useState<string[]>([])
  const [isAddCourtModalOpen, setIsAddCourtModalOpen] = useState(false)
  const [availableCourts, setAvailableCourts] = useState<any[]>([])
  const [selectedCourtToAdd, setSelectedCourtToAdd] = useState<string | null>(null)
  const [isSessionSettingsModalOpen, setIsSessionSettingsModalOpen] = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState("players")

  const [addCourtToSession] = useMutation(ADD_COURT_TO_SESSION, {
    onCompleted: () => {
      toast.success("Court added to session successfully!")
      refetch()
      setIsAddCourtModalOpen(false)
      setSelectedCourtToAdd(null)
    },
    onError: (error) => {
      toast.error(`Failed to add court: ${error.message}`)
    }
  })

  const [fetchCourts] = useLazyQuery(FETCH_COURT, {
    onCompleted: (data) => {
      const currentCourtIds = session?.court?.map((c: any) => c._id) || []
      setAvailableCourts(
        data.fetchCourts.filter((court: any) => !currentCourtIds.includes(court._id))
      )
    }
  })

  const handlePlayerSelection = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    )
  }

  const handleToggleTempSelection = (playerId: string) => {
    setTempSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    )
  }

  const handleAddPlayers = async () => {
    const playersToAdd = [...new Set([...tempSelectedPlayers, ...selectedPlayers])]
    if (playersToAdd.length > 0) {
      try {
        await addPlayersToSession({
          variables: {
            sessionId: slug,
            playerIds: playersToAdd,
          },
        })
        setTempSelectedPlayers([])
        setSelectedPlayers([])
        setIsSessionSettingsModalOpen(false)
      } catch (error) {
        console.error("Error adding players to session:", error)
      }
    } else {
      toast.warning("No Players Selected. Please select players to add.")
    }
  }

  const handleRemovePlayers = async (playerIds: string[]) => {
    if (playerIds.length > 0) {
      try {
        await removePlayersFromSession({
          variables: {
            sessionId: slug,
            playerIds: playerIds,
          },
        })
        setSelectedPlayers(prev => prev.filter(id => !playerIds.includes(id)))
        setTempSelectedPlayers(prev => prev.filter(id => !playerIds.includes(id)))  
      } catch (error) {
        console.error("Error Removing Players from Session:", error)
      }
    }
  }

  const handleRefresh = () => {
    refetch()
    refetchGames()
    toast.success("Data refreshed successfully!")
  }

  useEffect(() => {
    if (data?.fetchSession?.court?.length > 0 && activeTab === "all") {
      console.log("Available courts:", data.fetchSession.court)
      
      const woodCourt = data.fetchSession.court.find((c: any) => 
        c.name?.toLowerCase().includes("wood")
      )
      
      console.log("Found Wood court:", woodCourt)
      
      const defaultTab = woodCourt?._id || 
      data.fetchSession.court[0]?._id || 
      "all"
      
      setActiveTab(defaultTab)
      console.log("Setting default tab to:", defaultTab)
    }
  }, [data?.fetchSession?.court])
  const handleGameCreated = () => {
    refetch();
    refetchGames();
  }
  useEffect(() => { 
    const interval = setInterval(() => {
      refetch()
      refetchGames()
    }, 60000)

    return () => clearInterval(interval)
  }, [refetch, refetchGames])

  useEffect(() => {
    if (isPlayerSelectModalOpen) {
      fetchUsers()
      const availablePlayersIds = session?.availablePlayers?.map((player: any) => player._id) || []
      setSelectedPlayers(availablePlayersIds)
    }
  }, [isPlayerSelectModalOpen, fetchUsers, session])

  const handleEndGame = async (gameId: string) => {
    try {
      await endGame({
        variables: {
          id: gameId,
          end: new Date().toISOString(),
          status: "completed",
          session: slug,
        },
      })
    } catch (error) {
      console.error("Error ending game:", error)
    }
  }

  if (loading)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    )
  if (error) return <div>Error: {error.message}</div>
  if (!session) return <div>No session data available</div>

  const isSessionEnded = !!session.end

  // Get all courts associated with this session
  const sessionCourts = session.court || []
  
  // Get all games grouped by court
  const gamesByCourt = sessionCourts.reduce((acc: any, court: any) => {
    acc[court._id] = {
      name: court.name,
      games: gameData?.fetchGamesBySession?.filter(
        (game: any) => game.court._id === court._id
      ) || []
    }
    return acc
  }, {} as Record<string, { name: string; games: any[] }>)

  // Add an "All Courts" tab with all games
  const allGames = {
    name: "All Courts",
    games: gameData?.fetchGamesBySession || []
  }

  const totalShuttlesUsed = allGames.games
    .flatMap((game: any) => game.shuttlesUsed)
    .reduce((acc: number, shuttle: any) => acc + shuttle.quantity, 0)

  const renderGameCard = (game: any) => (
    <div key={game._id} className="relative w-full max-w-xl mx-auto flex">
      <Card className="p-4 w-full shadow-inner bg-opacity-100 shadow-gray-500/60 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <Badge className={`text-white text-lg px-3 py-1 ${
              game.court.name.includes("Concrete") ? 'bg-orange-500 border-orange-400' :
              game.court.name.includes("Wood") ? 'bg-green-500 border-green-400' :
              game.court.name.includes("SM Court") ? 'bg-blue-500 border-blue-400' : 
              'bg-gray-500 border-gray-400'
            }`}>
              {game.court.name}
            </Badge>
            <div className="flex flex-col">
              <span className="font-bold text-md">
                {format(new Date(game.start), "hh:mm a")} - {game?.end ? format(new Date(game.end), "hh:mm a") : "Ongoing"}
              </span>
              {game?.end && (
                <span className="text-sm text-muted-foreground">
                  ({differenceInMinutes(new Date(game?.end), new Date(game.start))} mins)
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {game.shuttlesUsed.map((shuttle: any, index: number) => (
              shuttle.quantity > 0 && (
                <Badge key={`${shuttle.shuttle._id}-${index}`} variant="outline" className="flex items-center gap-1">
                  <span className="text-base">{shuttle.shuttle.name}: </span>
                  <span className="text-base font-bold">{shuttle.quantity}</span>
                  <Image src={ShuttleIcon} alt="Shuttle" className="h-4 w-4" />
                </Badge>
              )
            ))}
          </div>
        </div>

        <CardContent className="p-0">
          <Card className="shadow-inner shadow-gray-400/50 p-2">
            <div className="grid grid-cols-3 items-center">
              <div className="text-center">
                <span className="font-semibold text-base text-gray-500">Team A</span>
                <div className="space-y-1">
                  <span className="font-semibold text-base">{game.A1.name}</span> & <span className="font-semibold text-base">{game.A2?.name}</span>
                </div>
              </div>
              <div className="text-center font-bold text-xl">vs</div>
              <div className="text-center">
                <span className="font-semibold text-base text-gray-500">Team B</span>
                <div className="space-y-1">
                  <span className="font-semibold text-base">{game.B1.name}</span> & <span className="font-semibold text-base">{game.B2?.name}</span>
                </div>
              </div>
            </div>
          </Card>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 p-1 bg-white shadow-inner shadow-gray-500/60 rounded-r-xl">
        <div onClick={(e) => e.stopPropagation()}>
          <GameForm id={game._id} refetch={refetchGames} sessionId={slug as string} />
        </div>
        {game?.end ? (
          <Button
            onClick={() => router.push("/admin/sessions/summary/game/" + game._id)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center h-10 w-10 rounded-full"
          >
            <FileText className="!h-6 !w-6" />
          </Button>
        ) : (
          <Button
            variant="destructive"
            onClick={() => handleEndGame(game._id)}
            className="flex items-center justify-center h-10 w-10 rounded-full"
          >
            <CircleStop className="!h-6 !w-6" />
          </Button>
        )}
      </div>
    </div>
  )

  const renderEmptyState = () => (
    <Card className="w-full max-w-md text-center p-6 mt-5 mx-auto">
      <CardContent>
        <div className="flex flex-col items-center">
          <Frown className="w-16 h-16 text-gray-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No games available
          </h2>
          <p className="text-sm text-gray-600">
            It seems like there are no Games Scheduled/Created. Try
            checking back later!
          </p>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-4 p-4">
      <Card className="p-5 w-full max-w-xl mx-auto shadow-inner flex items-center justify-center bg-opacity-100 shadow-gray-500/60">
        <CardContent className="flex flex-col items-center text-center pb-2">
          <span className="block text-muted-foreground font-semibold text-lg">
            {session.start
              ? format(new Date(session.start), "MMMM dd, YYY")
              : "TBA"}
          </span>
          {allGames.games.length > 0 && (
            <span className="block text-muted-foreground font-semibold text-lg">
              {format(new Date(session.start), "hh:mm a")} to{" "}
              {
                (() => {
                  const endedGames = allGames.games.filter((game: any) => game.end)
                  if (endedGames.length === 0) return "Ongoing"

                  const latestEnd = endedGames.reduce((latest: any, game: any) => 
                  new Date(game.end) > new Date(latest) ? game.end : latest,
                endedGames[0].end)
                
                return format(new Date(latestEnd), "hh:mm a")
              })()}
            </span>
          )}
          <span className="block text-muted-foreground font-semibold text-lg">
            Total Shuttles Used: {totalShuttlesUsed || 0}
          </span>
        </CardContent>
      </Card>

      <div className="flex flex-row justify-center gap-4 mt-4">
        <GameForm sessionId={slug as string} 
          refetch={handleGameCreated}
          disabled={isSessionEnded}
          key={allGames.games.length}
          activeCourtTab={activeTab === "all" ? null : activeTab}
          forceKey={activeTab}
        />
        {/* <button 
          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600"
          onClick={() => setIsPlayerSelectModalOpen(true)}
        >
          <UserPlus2 className="!w-6 !h-6" />
        </button>
        <button 
            className="px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600"
            onClick={() => {
              setIsAddCourtModalOpen(true);
              fetchCourts();
            }}
          >
           <img src="/tennis-court.png" alt="Tennis Court" className="!w-6 !h-6"/>
          </button> */}
          <button 
              className="px-4 py-2 bg-indigo-500 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-600"
              onClick={() => {
                setIsSessionSettingsModalOpen(true)
                fetchUsers()
                fetchCourts()
                setActiveSettingsTab("players") // Default to players tab
                const availablePlayersIds = session?.availablePlayers?.map((player: any) => player._id) || []
                setSelectedPlayers(availablePlayersIds)
              }}
              
            >
              <SettingsIcon className="!w-6 !h-6" />
            </button>
        <button 
          className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600"
          onClick={handleRefresh}
        >
          <RefreshCcw className="!w-6 !h-6" />
        </button>

        <button
          onClick={() => router.push(`/admin/sessions/summary/session/${slug}`)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
        >
          View Summary
        </button>
        
        {!session.end ? (
          <button
            onClick={async () => {
              await toggleSession({ 
                variables: { 
                  id: session._id,
                  end: new Date().toISOString() 
                } 
              })
              await refetch()
            }}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 rounded-r-3xl h-10 w-20 flex justify-center align-center"
          >
            <CircleStop className="!w-6 !w-6" />
          </button>
        ) : (
          <button
            onClick={async (e) => {
              e.stopPropagation();
              await toggleSession({ 
                variables: { 
                  id: session._id,
                  end: null 
                } 
              });
            }}
            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 rounded-r-3xl h-10 w-20 flex justify-center align-center"
          >
            <Play className="!w-6 !h-6" />
          </button>
        )}
      </div>

      <Dialog open={isSessionSettingsModalOpen} onOpenChange={setIsSessionSettingsModalOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Session Settings</DialogTitle>
    </DialogHeader>
    
    <Tabs 
      value={activeSettingsTab} 
      onValueChange={setActiveSettingsTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="players">
          <UserPlus2 className="w-4 h-4 mr-2" />
          Players
        </TabsTrigger>
        <TabsTrigger value="courts">
          <img 
            src="/tennis-court.png" 
            alt="Tennis Court" 
            className="w-4 h-4 mr-2"
          />
          Courts
        </TabsTrigger>
      </TabsList>

      <TabsContent value="players" className="pt-4">
        <PlayerSelect
          players={usersData?.fetchUsers || []}
          selectedPlayers={selectedPlayers}
          tempSelectedPlayers={tempSelectedPlayers}
          onSelectPlayer={handlePlayerSelection}
          onToggleTempSelection={handleToggleTempSelection}
          onRemovePlayer={(playerId) => {
            handleRemovePlayers([playerId])
          }}
          refetchUsers={refetchUsers}
        />
        <div className="flex gap-2 mt-4">
          <Button 
            className="flex-1" 
            onClick={handleAddPlayers}
            disabled={selectedPlayers.length === 0 && tempSelectedPlayers.length === 0}
          >
            Add Selected Players
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="courts" className="pt-4">
        <CourtMultiSelect 
          courts={availableCourts}
          selectedCourts={selectedCourtToAdd ? [selectedCourtToAdd] : []}
          onSelectCourt={(courtId) => {
            setSelectedCourtToAdd(courtId === selectedCourtToAdd ? null : courtId)
          }}
        />
        <Button 
          className="w-full mt-4"
          onClick={() => {
            if(selectedCourtToAdd) {
              addCourtToSession({
                variables: {
                  sessionId: slug,
                  courtId: selectedCourtToAdd,
                }
              }).then(()=>{
                setIsSessionSettingsModalOpen(false)
              })
            } else {
              toast.error("Please select a court to add.")
            }
          }}
          disabled={!selectedCourtToAdd}
        >
          Add Selected Court
        </Button>
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>

<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-xl mx-auto" style={{ 
          gridTemplateColumns: `repeat(${sessionCourts.length + 1}, 1fr)`
        }}>
          {sessionCourts.map((court: any) => (
            <TabsTrigger key={court._id} value={court._id}>
              {court.name}
            </TabsTrigger>
          ))}
          <TabsTrigger value="all">All Courts</TabsTrigger>
        </TabsList>

        {sessionCourts.map((court: any) => (
          <TabsContent key={court._id} value={court._id} className="mt-4">
            <div className="grid grid-cols-1 gap-2 text-base">
              {gamesByCourt[court._id]?.games.length > 0 ? (
                [...gamesByCourt[court._id].games]
                  .sort((a: any, b: any) => new Date(b.start).getTime() - new Date(a.start).getTime())
                  .map(renderGameCard)
              ) : renderEmptyState()}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 gap-2 text-base">
            {allGames.games.length > 0 ? (
              [...allGames.games]
                .sort((a: any, b: any) => new Date(b.start).getTime() - new Date(a.start).getTime())
                .map(renderGameCard)
            ) : renderEmptyState()}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Page