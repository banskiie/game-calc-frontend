"use client";

import { useRouter, useParams } from "next/navigation";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Loader2 } from "lucide-react";
import SessionForm from "../form";
import { Card, CardContent } from "@/components/ui/card";
import { Frown } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const UPDATE_GAME = gql`
mutation UpdateGame($id: ID!, $end: DateTime!) {
    updateGame(input: {_id: $id, end: $end}) {
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
`;

const Page = () => {
  const { slug } = useParams();
  const { data, loading, error, refetch } = useQuery(FETCH_SESSION, {
    ssr: false,
    skip: !slug,
    variables: { id: slug },
  });
  const [endSession, { loading: endLoading }] = useMutation(END_SESSION);
  const [updateGame] = useMutation(UPDATE_GAME);
  const router = useRouter();
  const session = data?.fetchSession;

  if (loading)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    );
  if (error) return <div>Error: {error.message}</div>;
  if (!session) return <div>No session data available</div>;
  
  // Align session start and end with Game 1
  const game1 = session.games[0];
  const sessionStart = game1?.start || session.start;
  const sessionEnd = game1?.end || session.end;
  const handleEndGame = (gameId: any) => {
    const currentTime = new Date().toISOString(); 
    updateGame({
      variables: { id: gameId, end: currentTime },
    })
      .then(() => {
        refetch(); 
        console.log("Game ended at:", currentTime);
      })
      .catch((error) => {
        console.error("Error ending game:", error);
      });
  };
  
  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-4 p-4">
      <div>
        <SessionForm id={slug as string} />
      </div>
      <Card className="p-3 w-full max-w-md mx-auto shadow-inner flex items-center justify-center bg-opacity-100 shadow-gray-500/60">
        <CardContent className="flex flex-col items-center text-center pb-2">
          <span className="block text-muted-foreground font-semibold">
            {new Date(session.start).toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            }) || "No date available"}
          </span>
          <span className="block text-muted-foreground text-sm">
            Duration:{" "}
            <span className="font-bold">
              {new Date(session.start).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}{" "}
            </span>
            to{" "}
            <span className="font-bold">
              {session.end
                ? new Date(session.end).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                : "TBA"}
            </span>
          </span>
        </CardContent>
      </Card>
      <div className="flex flex-row justify-center gap-4 mt-4">
        {/* View Summary Button */}
        <button
          onClick={() => router.push(`/admin/view-summary/${session._id}`)}
          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700"
        >
          View Summary
        </button>
        {/* End Session Button*/}
        {!session.end && (
          <button
            onClick={() => {
              endSession({ variables: { id: session._id } });
              refetch();
              console.log("Ending session...");
            }}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700"
          >
            End Session
          </button>
        )}
      </div>
      {/* {!session?.end && (
              <Button
                size="icon"
                variant="destructive"
                onClick={() => {
                  endSession({ variables: { id: session._id } })
                  refetch()
                }}
              >
                <CircleStop />
              </Button>*/}

      <div className="grid grid-cols-1 gap-4">
        {session.games.length > 0 ? (
          session.games.map((game: any, index: number) => (
            <Card key={game._id} className="p-4">
              <CardContent>
                <div className="grid grid-rows-3 grid-cols-3 gap-2">
                  <div className="col-span-3 w-full ">
                    <Card className="p-2 shadow-md">
                      <CardContent>
                        <div className="grid grid-cols-3 gap-2 mt-2 mb-[-10px]">
                          <div className="text-left ml-[-15px] mt-2">
                            <span className="block text-muted-foreground">
                              Start
                            </span>
                            <span className="block font-semibold text-base">
                              {game.start
                                ? new Date(game.start).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : "TBA"}
                            </span>
                          </div>
                          <div className="text-center">
                            <span className="block font-bold text-lg">
                              Game {index + 1}
                            </span>
                            <span className="block font-semibold">
                              {game.court?.name || "No court assigned"}
                            </span>
                          </div>
                          <div className="text-right mr-[-15px] mt-2">
                            <span className="block text-muted-foreground">
                              End
                            </span>
                            <span className="block font-semibold text-base">
                              {game.end
                                ? new Date(game.end).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : "TBA"}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                 
                  <div className="text-left flex flex-col items-center justify-center sm:flex-row sm:justify-start mt-[-50px]">
                    <div className="flex flex-col items-center">
                      <span className="block font-bold sm:mr-2 mb-2">
                        Team A
                      </span>
                      <Card
                        className={`p-3 sm:p-4 md:p-6 lg:p-8 w-full ${
                          game.winner === "a"
                            ? "bg-green-700"
                            : game.winner === null
                            ? ""
                            : "bg-red-600"
                        }`}
                      >
                        <CardContent>
                          {["A1", "A2"].map((player, idx) => (
                            <span
                              key={idx}
                              className={`block font-semibold ${
                                game.winner === "a"
                                  ? "text-white"
                                  : game.winner === null
                                  ? ""
                                  : "text-white"
                              } ${idx === 1 ? "text-center" : ""} ${
                                idx === 1 ? "mb-[-12px]" : ""
                              } w-full`}
                            >
                              {game[player]?.name || "No Name available"}
                              {idx === 0 && (
                                <span className="block font-semibold text-center">
                                  &amp;
                                </span>
                              )}
                            </span>
                          ))}
                        </CardContent>
                      </Card>
                      {game.winner !== null && (
                        <span className={`p-2 w-full sm:w-auto text-center`}>
                          {game.winner === "a" ? (
                            <span className="text-green-600 font-bold">
                              Winner
                            </span>
                          ) : (
                            <span className="text-red-600 font-bold">Lose</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-center flex items-center justify-center font-semibold text-lg w-full sm:w-auto mt-[-50px]">
                    <span className=" px-2 py-1 rounded-xl">v.s.</span>
                  </div>

                  <div className="text-right flex flex-col items-center justify-center sm:flex-row sm:justify-end mt-[-50px]">
                    <div className="flex flex-col items-center">
                      <span className="block font-bold sm:mr-2 mb-2">
                        Team B
                      </span>
                      <Card
                        className={`p-3 sm:p-4 md:p-6 lg:p-8 w-full ${
                          game.winner === "b"
                            ? "bg-green-700 "
                            : game.winner === null
                            ? ""
                            : "bg-red-500"
                        }`}
                      >
                        <CardContent>
                          {["B1", "B2"].map((player, idx) => (
                            <span
                              key={idx}
                              className={`block font-semibold ${
                                game.winner === "b"
                                  ? "text-white"
                                  : game.winner === null
                                  ? ""
                                  : "text-white"
                              } ${idx === 1 ? "text-center" : ""} ${
                                idx === 1 ? "mb-[-12px]" : ""
                              }`}
                            >
                              {game[player]?.name || "No Name available"}
                              {idx === 0 && (
                                <span className="block font-semibold text-center">
                                  &amp;
                                </span>
                              )}
                            </span>
                          ))}
                        </CardContent>
                      </Card>
                      {game.winner !== null && (
                        <span className={`p-2 w-full sm:w-auto text-center`}>
                          {game.winner === "b" ? (
                            <span className="text-green-600 font-bold">
                              Winner
                            </span>
                          ) : (
                            <span className="text-red-600 font-bold">Lose</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-3 bg-white bg-opacity-100 shadow-inner shadow-gray-500/60 rounded-lg p-4 mt-10 mb-[26px]">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center">
                        <span className="font-semibold mb-5">Shuttlecock</span>
                        {game.shuttlesUsed?.map(
                          (shuttle: any, index: number) => (
                            <div
                              key={index}
                              className="flex flex-col items-start mb-2"
                            >
                              <span className="underline font-semibold">
                                {shuttle.shuttle.name} - {shuttle.quantity} pcs
                              </span>
                            </div>
                          )
                        )}
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="font-semibold mb-5">Status:</span>
                        <span className="ml-2">
                          {game.status === "completed" ? (
                            <span className="bg-green-600 p-3 text-white rounded-xl">
                              Completed{" "}
                            </span>
                          ) : (
                            <span className='bg-orange-300 px-3 text-white"'>
                              {" "}
                              Ongoing{" "}
                            </span>
                          )}{" "}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center mt-4">
                    {!game.end && (
                      <button
                        onClick={() => handleEndGame(game._id)}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700"
                      >
                        End Game
                      </button>
                    )}
                  </div>
              </CardContent>
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
