"use client";

import { useRouter, useParams } from "next/navigation";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { CircleStop, FileText, Loader2, UserPlus2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Frown } from "lucide-react";
import GameForm from "../form";
import { differenceInMinutes, format } from "date-fns";
import ShuttleIcon from "@/assets/svg/shuttle.svg";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PlayerSelect } from "@/components/custom/PlayerSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

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
`;

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
`;

const END_SESSION = gql`
  mutation EndSession($id: ID!) {
    endSession(_id: $id) {
      _id
    }
  }
`;

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
`;

const FETCH_USERS = gql`
  query FetchUsers {
    fetchUsers {
      _id
      name
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
`;

const Page = () => {
  const { slug } = useParams();
  const { data, loading, error, refetch } = useQuery(FETCH_SESSION, {
    ssr: false,
    skip: !slug,
    variables: { id: slug },
  });
  const [fetchUsers, { data: usersData, refetch: refetchUsers }] = useLazyQuery(FETCH_USERS);
  const { data: gameData, refetch: refetchGames } = useQuery(
    FETCH_GAMES_BY_SESSION,
    {
      variables: { session: slug },
      skip: !slug,
      fetchPolicy: "network-only",
    }
  );
  const [endSession] = useMutation(END_SESSION);
  const [endGame] = useMutation(END_GAME, {
    onCompleted: () => {
      toast.success("Game ended successfully!");
      refetchGames();
    },
    onError: (error) => {
      toast.error(`Failed to end game: ${error.message}`);
    },
  });
  const [addPlayersToSession] = useMutation(ADD_PLAYERS_TO_SESSION, {
    onCompleted: () => {
      toast.success("Players added to session successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add players: ${error.message}`);
    },
  });

  const router = useRouter();
  const session = data?.fetchSession;

  const [isPlayerSelectModalOpen, setIsPlayerSelectModalOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  const handlePlayerSelection = (playerId: string) => {
    setSelectedPlayers((prev) => {
      const newSelection = prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId];
      console.log("New selection:", newSelection);
      localStorage.setItem("availablePlayers", JSON.stringify(newSelection));
      return newSelection;
    });
  };

  // const handleAddPlayers = async () => {
  //   if (selectedPlayers.length > 0) {
  //     await addPlayersToSession({
  //       variables: {
  //         sessionId: slug,
  //         playerIds: selectedPlayers,
  //       },
  //     });

  //     // Update localStorage with the new selected players
  //     const storedPlayers = localStorage.getItem("availablePlayers");
  //     if (storedPlayers) {
  //       const updatedPlayers = [...new Set([...JSON.parse(storedPlayers), ...selectedPlayers])];
  //       localStorage.setItem("availablePlayers", JSON.stringify(updatedPlayers));
  //     } else {
  //       localStorage.setItem("availablePlayers", JSON.stringify(selectedPlayers));
  //     }

  //     setSelectedPlayers([]);
  //     setIsPlayerSelectModalOpen(false);
  //   } else {
  //     toast.warning("No Players Selected. Please select players to add.");
  //   }
  // };

  const handleAddPlayers = () => {
    if (selectedPlayers.length > 0) {
      const existingPlayers = JSON.parse(localStorage.getItem("availablePlayers") || "[]");
  
      const updatedPlayers = [...existingPlayers, ...selectedPlayers];
  
      localStorage.setItem("availablePlayers", JSON.stringify(updatedPlayers));
  
      setSelectedPlayers([]);
      setIsPlayerSelectModalOpen(false);
  
      toast.success("Players added to session successfully!");
    } else {
      toast.warning("No Players Selected. Please select players to add.");
    }
  }
  
  useEffect(() => {
    if (isPlayerSelectModalOpen) {
      fetchUsers();

      const storedPlayers = localStorage.getItem("availablePlayers");
      if (storedPlayers) {
        setSelectedPlayers(JSON.parse(storedPlayers));
      }
    }
  }, [isPlayerSelectModalOpen, fetchUsers]);

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

  const handleEndGame = async (gameId: string) => {
    try {
      await endGame({
        variables: {
          id: gameId,
          end: new Date().toISOString(),
          status: "completed",
          session: slug,
        },
      });
    } catch (error) {
      console.error("Error ending game:", error);
    }
  };

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-4 p-4">
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
        <button 
          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600"
          onClick={() => setIsPlayerSelectModalOpen(true)}
        >
          <UserPlus2 className="!w-6 !h-6" />
        </button>
        {!session.end && (
          <button
            onClick={async () => {
              await endSession({ variables: { id: session._id } });
              await refetch();
            }}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 rounded-r-3xl h-10 w-20 flex justify-center align-center"
          >
            <CircleStop className="!w-6 !h-6" />
          </button>
        )}
      </div>

      <Dialog open={isPlayerSelectModalOpen} onOpenChange={setIsPlayerSelectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Players to Session</DialogTitle>
          </DialogHeader>
          <PlayerSelect
            players={usersData?.fetchUsers || []}
            selectedPlayers={selectedPlayers}
            onSelectPlayer={handlePlayerSelection}
            refetchUsers={refetchUsers}
          />
          <Button onClick={handleAddPlayers}>Add Players</Button>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-2">
        {gameData?.fetchGamesBySession.length > 0 ? (
          gameData?.fetchGamesBySession.map((game: any) => (
            <div key={game._id} className="relative w-full max-w-xl mx-auto flex">
              <Card className="p-1 w-full shadow-inner bg-opacity-100 shadow-gray-500/60 flex flex-col !rounded-l-xl !rounded-br-xl !rounded-tr-none">
                <span className="text-center">
                  <CardHeader className="mb-3 mt-[-0.45rem]">
                    <CardDescription>
                      <div className="flex items-start justify-center gap-52">
                        <div className="flex flex-col items-center">
                          <CardTitle className="text-center font-bold text-black text-md">{game.court.name}</CardTitle>
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-xs">
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
                                  <span className="font-bold text-xs">{shuttle.shuttle.name}</span> ({shuttle.quantity}) -
                                  <div className="flex items-center justify-center">
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
                          <span className="font-semibold text-sm">{game.A1.name}</span> & <span className="font-semibold text-sm">{game.A2?.name}</span>
                        </div>
                      </div>
                      <div className="text-center font-bold text-xl">vs</div>
                      <div className="text-center">
                        <span className="font-semibold text-sm text-gray-500">Team B</span>
                        <div className="space-y-1">
                          <span className="font-semibold text-sm">{game.B1.name}</span> & <span className="font-semibold text-sm">{game.B2?.name}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-2 p-1 bg-white mb-20 shadow-inner shadow-gray-500/60 rounded-r-xl">
                <div onClick={(e) => e.stopPropagation()}>
                  <GameForm id={game._id} refetch={refetchGames} sessionId={slug as string} />
                </div>
                {game?.end ? (
                  <Button
                    onClick={() => router.push("/admin/sessions/summary/game/" + game._id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center h- w-9 rounded-full"
                  >
                    <FileText className="!h-5 !w-5" />
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => handleEndGame(game._id)}
                    className="flex items-center justify-center h-9 w-9 rounded-full"
                  >
                    <CircleStop className="!h-5 !w-5" />
                  </Button>
                )}
              </div>
            </div>
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