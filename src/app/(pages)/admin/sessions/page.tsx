"use client";
import { CourtMultiSelect } from "@/components/custom/MultipleCourts"
import { PlayerSelect } from "@/components/custom/PlayerSelect";
import { ShuttleSingleSelect } from "@/components/custom/ShuttleSelect"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { differenceInMinutes } from "date-fns";
import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// DEFAULT
const DEFAULT_COURT_ID = ["6791993543683b5ac0a1ccc8"] //Wood
const DEFAULT_SHUTTLE_ID = "6791995a43683b5ac0a1cccc" // XP2 shuttle
const DEFAULT_PLAYER_IDS = [
  "67c6a24c0bb4c89568b35dae", // Jordan
  "67a02c8406a191cd4b0151a6", // Jojo
  "67a02ca506a191cd4b0151ac", // Gary
  "67a02c8c06a191cd4b0151a9", // Aying
  "67a02c5d06a191cd4b01519a", // Atty Leo
  "67a02c7d06a191cd4b0151a3", // Edward
  "67a02c6306a191cd4b01519d", // Wagi
  "67cbe2c9af620805319c9ea7", // Clyde
  "67cb8df9df6cb1bed2b64557", // Alex
  "67c6be2d7a3a5a8302cbe5f7", // Cocoi
]


const REMOVE_SESSION = gql`
  mutation RemoveSession($_id: ID!) {
    removeSession(_id: $_id) {
      _id
      start
      end
      createdAt
      updatedAt
    }
  }
`;

const FETCH_SESSIONS = gql`
  query FetchSessions($limit: Int!) {
    fetchSessions(limit: $limit) {
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
      court {
        _id
        name
        price
        active
        createdAt
        updatedAt
      }
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
`

const START_SESSION = gql`
  mutation StartSession($courtId: [ID!]!, $shuttleId: ID!, $playerIds: [ID!]!) {
    startSession(courtId: $courtId, shuttleId: $shuttleId, playerIds: $playerIds) {
      _id
      start
      court {
        _id
        name
      }
      shuttle {
        _id
        name
      }
      availablePlayers {
        _id
        name
      }
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

const FETCH_COURTS = gql`
  query FetchCourts {
    fetchCourts {
      _id
      name
    }
  }
`;

const FETCH_SHUTTLES = gql`
  query FetchShuttles {
    fetchShuttles {
      _id
      name
    }
  }
`;

const FETCH_USERS = gql`
  query FetchUsers {
    fetchUsers {
      _id
      name
    }
  }
`

const page = () => {
  const [limit, setLimit] = useState<number>(5);
  const [fetchMore, { data, refetch, loading }] = useLazyQuery(FETCH_SESSIONS, {
    onCompleted: (data) => console.log(data),
    variables: { limit },
    onError: (error) => console.log(error),
  });
  const [fetchCourts, { data: courtsData }] = useLazyQuery(FETCH_COURTS);
  const [fetchShuttles, { data: shuttlesData }] = useLazyQuery(FETCH_SHUTTLES);
  const [fetchUsers, { data: usersData, refetch: refetchUsers }] = useLazyQuery(FETCH_USERS);
  const [startSession, { loading: startLoading }] = useMutation(START_SESSION, {
    onCompleted: () => {
      refetch()
      setOpen(false)
      setSelectCourts([])
      setSelectedShuttle(null)
      setSelectedPlayers([])
    },
    onError: (error) => console.log(error),
  })
  const [addPlayersToSession] = useMutation(ADD_PLAYERS_TO_SESSION, {
    onError: (error) => console.log(error),
  })
  const [removeSession] = useMutation(REMOVE_SESSION, {
    onCompleted: () => {
      refetch()
    },
    onError: (error) => console.log(error),
  })
  const router = useRouter()
  const sessions = data?.fetchSessions

  const [open, setOpen] = useState(false)
  const [selectedCourts, setSelectCourts] = useState<string[]>([])
  const [selectedShuttle, setSelectedShuttle] = useState<string | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null)

  const handleCardClick = (sessionId: string) => {
    setLoadingSessionId(sessionId);
    router.push("/admin/sessions/" + sessionId)
  }

  const handleOpenModal = async () => {
    setOpen(true)
    await fetchCourts()
    await fetchShuttles()
    await fetchUsers()

    setSelectCourts(DEFAULT_COURT_ID)
    setSelectedShuttle(DEFAULT_SHUTTLE_ID)
    setSelectedPlayers(DEFAULT_PLAYER_IDS)
  }

  const handleCreateSession = async () => {
    if (selectedCourts.length === 0 || !selectedShuttle) {
      return alert("Please select a court and a shuttle.");
    }

    const sessionResponse = await startSession({
      variables: {
        courtId: selectedCourts,
        shuttleId: selectedShuttle,
        playerIds: selectedPlayers,
      },
    });

    const sessionId = sessionResponse.data.startSession._id;

    if (selectedPlayers.length > 0) {
      await addPlayersToSession({
        variables: {
          sessionId,
          playerIds: selectedPlayers,
        },
      });
    }

    refetchUsers();
  }
  // TIME AND DATE
  // Manila (PHT) is UTC+8
  // So 2025-03-19T23:01:01.542Z + 8 hours = 2025-03-20T07:01:01 in PHT → 7:01 AM
  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";

    const date = new Date(isoString)
    return date.toLocaleDateString("en-US", {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  }

  // SERVER IF DILI SIYA MA FIX IF ANG TIME IS LIKE 9:00:00 UTC and NOT UTC-8 PH TIME
  // const formatDate = (isoString: string) => {
  //   if (!isoString) return "N/A";

  //   const date = new Date(isoString)
  //   return date.toLocaleDateString("en-US", {
  //     timeZone: "UTC",
  //     year: "numeric",
  //     month: "long",
  //     day: "2-digit",
  //   });
  // }
  const formatTimeUTC = (isoString: string) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleTimeString("en-US", {
      timeZone: "Asia/Manila",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Manila (PHT) is UTC+8
  // So 2025-03-19T23:01:01.542Z + 8 hours = 2025-03-20T07:01:01 in PHT → 7:01 AM
  // SERVER IF DILI SIYA MA FIX
  // const formatTimeUTC = (isoString: string) => {
  //   if (!isoString) return "N/A";

  //   return new Date(isoString).toLocaleTimeString("en-US", {
  //     timeZone: "Asia/Manila",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     hour12: true,
  //   })
  // }
  // --TIME AND DATE--

  const handleRemoveSession = async (sessionId: string) => {
    await removeSession({
      variables: {
        _id: sessionId,
      },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchMore({ variables: { limit } });
    };
    fetchData();
  }, [limit, fetchMore]);

  const handlePlayerSelection = (playerId: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    )
  }

  const handleDialogClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedPlayers([])
      setSelectCourts([])
      setSelectedShuttle(null)
    }
    setOpen(isOpen);
  };

  if (loading)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    );

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2">
      <div className="sticky top-0 w-full bg-slate-200 p-2">
        <Button className="w-full " onClick={handleOpenModal}>
          Add Session
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="max-h-[80vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Create a New Session</DialogTitle>
          </DialogHeader>

          {/* <Select onValueChange={(value) => setSelectCourt(value)} value={selectedCourt || ""}>
            <SelectTrigger>
              <SelectValue placeholder="Select a court" />
            </SelectTrigger>
            <SelectContent>
              {courtsData?.fetchCourts.map((court: any) => (
                <SelectItem key={court._id} value={court._id}>
                  {court.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}


          <div className="overflow-y-auto flex-1 py-4">
            {courtsData?.fetchCourts && (
              <CourtMultiSelect
                courts={courtsData.fetchCourts}
                selectedCourts={selectedCourts}
                onSelectCourt={(courtId) => {
                  setSelectCourts(prev =>
                    prev.includes(courtId)
                      ? prev.filter(id => id !== courtId)
                      : [...prev, courtId]
                  );
                }}
              />
            )}
            <div className="border-t border-gray-200 my-4" />

            {shuttlesData?.fetchShuttles && (
              <ShuttleSingleSelect
                shuttles={shuttlesData.fetchShuttles}
                selectedShuttle={selectedShuttle}
                onSelectShuttle={setSelectedShuttle}
              />
            )}
            <div className="border-t border-gray-200 my-4" />

            <PlayerSelect
              players={usersData?.fetchUsers || []}
              selectedPlayers={selectedPlayers}
              tempSelectedPlayers={selectedPlayers}
              onSelectPlayer={handlePlayerSelection}
              onToggleTempSelection={handlePlayerSelection}
              onRemovePlayer={(playerId) => {
                setSelectedPlayers(prev => prev.filter(id => id !== playerId));
              }}
              refetchUsers={refetchUsers}
              defaultActiveTab="selected"
            />
          </div>

          {/* Fixed footer */}
          <div className="flex-shrink-0 pt-4 border-t border-gray-200">
            <Button
              className="w-full"
              onClick={handleCreateSession}
              disabled={startLoading || selectedCourts.length === 0}
            >
              {startLoading ? (
                <Loader2 className="animate-spin mr-2" size={16} />
              ) : "Create Session"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {sessions?.map((session: any) => (
        <Card
          key={session._id}
          onClick={() => handleCardClick(session._id)}
          className="mx-2 relative"
        >
          {loadingSessionId === session._id && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="animate-spin" size={40} />
            </div>
          )}
          <CardHeader>
            {!session.end && (
              <div className="absolute top-2 right-2">

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveSession(session._id);
                  }}
                >
                  <X className="!h-6 !w-6 text-red-600" />
                </Button>
              </div>
            )}
            <CardTitle>
              {formatDate(session.start)}
            </CardTitle>
            <CardDescription className="flex flex-col gap-1">
              <span className="block">
                {session.games.length > 0 && (
                  <>
                    <span className="block font-bold text-muted-foreground">
                      {session.games.length}{" "}
                      {session.games.length > 1 ? "games" : "game"} (
                      {differenceInMinutes(
                        new Date(session.games[session.games.length - 1].end),
                        new Date(session.games[0].start)
                      )}{" "}
                      mins total)
                    </span>
                  </>
                )}
              </span>
              <span>
                {session.games.length > 0 ? (
                  <>
                    {
                      formatTimeUTC(session.games[0].start)
                    } to {" "}
                    {(() => {
                      const endedGames = session.games.filter((game: any) => game.end)

                      if (endedGames.length === 0) return "Ongoing"

                      const latestEnd = endedGames.reduce((latest: string, game: any) =>
                        new Date(game.end) > new Date(latest) ? game.end : latest,
                        endedGames[0].end
                      )
                      return formatTimeUTC(latestEnd)
                    })()}
                  </>
                ) : (
                  "No games yet"
                )}
              </span>

              <span className="font-bold"> Court: {session.court?.map((c: any) => c.name).join(", ") || "Unknown"} </span>
              <span className="font-bold">Shuttle: {session.shuttle?.name || "Unknown"}</span>
              <Badge
                className={`${session?.end ? "bg-green-900/80" : "bg-blue-600/80"
                  } w-fit`}
              >
                {session?.end ? "Finished" : "Ongoing"}
              </Badge>
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
      <Button
        variant="link"
        onClick={() => {
          setLimit(limit + 5);
          fetchMore({ variables: { limit } });
        }}
        className="font-bold"
      >
        LOAD MORE?
      </Button>
    </div>
  )
}

export default page;