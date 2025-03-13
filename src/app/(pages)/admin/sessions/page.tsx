"use client";
import { PlayerSelect } from "@/components/custom/PlayerSelect";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { differenceInMinutes, format } from "date-fns";
import { Loader2, X } from "lucide-react"; // Import X icon for the close button
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Add the REMOVE_SESSION mutation
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
`;

const START_SESSION = gql`
  mutation StartSession($courtId: ID!, $shuttleId: ID!) {
    startSession(courtId: $courtId, shuttleId: $shuttleId) {
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
    }
  }
`;

const ADD_PLAYERS_TO_SESSION = gql`
  mutation AddPlayersToSession($sessionId: ID!, $playerIds: [ID!]!) {
    addPlayersToSession(sessionId: $sessionId, playerIds: $playerIds) {
      _id
      players {
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
      setSelectCourt(null)
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
  const [selectedCourt, setSelectCourt] = useState<string | null>(null)
  const [selectedShuttle, setSelectedShuttle] = useState<string | null>(null)
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [loadingSessionId, setLoadingSessionId] = useState<string | null>(null)

  const handleCardClick = (sessionId: string) => {
    setLoadingSessionId(sessionId);
    router.push("/admin/sessions/" + sessionId)
  }

  const handleOpenModal = async () => {
    setOpen(true);
    await fetchCourts();
    await fetchShuttles();
    await fetchUsers();
  }

  const handleCreateSession = async () => {
    if (!selectedCourt || !selectedShuttle) {
      return alert("Please select a court and a shuttle.");
    }

    const sessionResponse = await startSession({
      variables: {
        courtId: selectedCourt,
        shuttleId: selectedShuttle,
      },
    })

    const sessionId = sessionResponse.data.startSession._id;

    if (selectedPlayers.length > 0) {
      await addPlayersToSession({
        variables: {
          sessionId,
          playerIds: selectedPlayers,
        },
      });
    }

    localStorage.setItem("availablePlayers", JSON.stringify(selectedPlayers));
    refetchUsers()
  };

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
      setSelectCourt(null)
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a New Session</DialogTitle>
          </DialogHeader>

          <Select onValueChange={(value) => setSelectCourt(value)}>
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
          </Select>

          <Select onValueChange={(value) => setSelectedShuttle(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a shuttle" />
            </SelectTrigger>
            <SelectContent>
              {shuttlesData?.fetchShuttles.map((shuttle: any) => (
                <SelectItem key={shuttle._id} value={shuttle._id}>
                  {shuttle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <PlayerSelect
            players={usersData?.fetchUsers || []}
            selectedPlayers={selectedPlayers}
            onSelectPlayer={handlePlayerSelection}
            refetchUsers={refetchUsers} 
          />

          <Button className="w-full" onClick={handleCreateSession} disabled={startLoading}>
            {startLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : "Create Session"}
          </Button>
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
              {format(new Date(session.start), "MMMM d, yyyy")}
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
                {format(new Date(session.start), "h:mm a")} to{" "}
                {session.end ? format(new Date(session.end), "h:mm a") : "TBA"}
              </span>

              <span className="font-bold"> Court: {session.court?.name || "Unknown"} </span>
              <span className="font-bold">Shuttle: {session.shuttle?.name || "Unknown"}</span>
              <Badge
                className={`${
                  session?.end ? "bg-green-900/80" : "bg-blue-600/80"
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