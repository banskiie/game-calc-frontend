"use client";
import { gql, useQuery } from "@apollo/client";
import { Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
import BetsForm from "../form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FETCH_GAME = gql`
  query FetchGame($id: ID!) {
    fetchGame(_id: $id) {
      _id
      start
      end
      winner
      status
      active
      A1 {
        _id
        name
      }
      A2 {
        _id
        name
      }
      B1 {
        _id
        name
      }
      B2 {
        _id
        name
      }
    }
  }
`;

const FETCH_BETS_BY_GAME = gql`
  query FetchBetsByGame($game: ID!) {
    fetchBetsByGame(game: $game) {
      _id
      betType
      betAmount
      paid
      active
      bettors {
        bettorForA {
          _id
          name
        }
        bettorForB {
          _id
          name
        }
      }
      game {
        _id
        start
        end
        winner
        status
        active
      }
    }
  }
`;

const FETCH_SESSION = gql`
  query FetchSession($id: ID!) {
    fetchSession(_id: $id) {
      _id
      end
    }
  }
`;

const Page = () => {
  const { slug } = useParams();
  const { data: gameData, loading: gameLoading, error: gameError } = useQuery(FETCH_GAME, {
    variables: { id: slug },
    skip: !slug,
  });

  const { data: betsData, loading: betsLoading, error: betsError, refetch } = useQuery(FETCH_BETS_BY_GAME, {
    variables: { game: slug },
  });

  const { data: sessionData, loading: sessionLoading } = useQuery(FETCH_SESSION, {
    variables: { id: gameData?.fetchGame?.session?._id },
    skip: !gameData?.fetchGame?.session?._id,
  });

  useEffect(() => console.log(betsData), [betsData]);

  if (gameLoading || betsLoading || sessionLoading)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    );
  if (gameError) return <div>Error: {gameError.message}</div>;
  if (betsError) return <div>Error: {betsError.message}</div>;

  const game = gameData?.fetchGame;
  const bets = betsData?.fetchBetsByGame;

  const isSessionEnded = sessionData?.fetchSession?.end
    ? new Date(sessionData.fetchSession.end) < new Date()
    : false;

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-4 p-4">
      {game ? (
        <div>
          <h1 className="text-2xl font-bold mb-4 text-center">Bets for Game</h1>
          <p className="mb-6 text-center">
            <span className="font-semibold italic">{game.A1.name} / {game.A2?.name || 'N/A'}</span>{" "}
            <span className="font-semibold">vs</span>{" "}
            <span className="font-semibold italic"> {game.B1.name} / {game.B2?.name || 'N/A'}</span>
          </p>

          <BetsForm gameId={slug as string} refetch={refetch} disabled={isSessionEnded} />

          <div className="grid grid-cols-1 gap-4 mt-6">
            {bets && bets.length > 0 ? (
              bets.map((bet: any) => {
                // Extract unique bettors for A and B
                const bettorsForA = Array.from(
                  new Set(
                    bet.bettors
                      .map((pair: any) => pair.bettorForA?.name)
                      .filter((name: string) => name)
                  )
                ).join(", ");

                const bettorsForB = Array.from(
                  new Set(
                    bet.bettors
                      .map((pair: any) => pair.bettorForB?.name)
                      .filter((name: string) => name)
                  )
                ).join(", ");

                return (
                  <Card key={bet._id} className="shadow-sm">
                    <CardHeader>
                      <CardTitle>{bet.betType}</CardTitle>
                      <CardDescription>
                        Bet Amount: {bet.betAmount.toFixed(2)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <p>
                          <span className="font-semibold">Bettor For A:</span>{" "}
                          {bettorsForA}
                        </p>
                        <p>
                          <span className="font-semibold">Bettor For B:</span>{" "}
                          {bettorsForB}
                        </p>
                        <p>
                          <span className="font-semibold">Status:</span>{" "}
                          {bet.paid ? (
                            <span className="text-green-400">Paid</span>
                          ) : (
                            <span className="text-red-400">Unpaid</span>
                          )}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-start text-sm">
                      <BetsForm
                        id={bet._id}
                        gameId={slug as string}
                        refetch={refetch}
                        disabled={isSessionEnded}
                      />
                    </CardFooter>
                  </Card>
                );
              })
            ) : (
              <Card className="w-full max-w-md text-center p-6 mx-auto">
                <CardContent>
                  <div className="flex flex-col items-center">
                    <p className="text-muted-foreground">
                      No bets have been created for this game yet.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <p>No game found.</p>
      )}
    </div>
  );
};

export default Page
