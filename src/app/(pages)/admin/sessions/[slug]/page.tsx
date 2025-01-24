"use client";

import { useRouter, useParams } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import { Loader } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ShuttleForm from "../form";

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

const Page = () => {
  const { slug } = useParams();
  const { data, loading, error } = useQuery(FETCH_SESSION, {
    ssr: false,
    skip: !slug,
    variables: { id: slug },
  });

  const session = data?.fetchSession;
  const router = useRouter();

  if (loading) return <Loader />;
  if (error) return <div>Error: {error.message}</div>;
  if (!session) return <div>No session data available</div>;

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-4 p-4">
      <div>
        <ShuttleForm id={slug as string} />
      </div>
      <div>
        <span className="block text-muted-foreground">Session ID</span>
        <span className="block font-semibold text-muted-foreground">
          {session._id || "No session ID"}
        </span>
      </div>
      <div>
        <span className="block text-muted-foreground font-bold">List of Games</span>
        {session.games.length > 0 ? (
          session.games.map((game: any, index: number) => (
            <Card key={game._id} className="mb-4">
              <CardHeader>
                <CardTitle>Game {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <span className="block text-muted-foreground">Court Name:</span>
                  <span className="block font-semibold">
                    {game.court?.name || "No court assigned"}
                  </span>
                </div>
                <div>
                  <span className="block text-muted-foreground">
                    Shuttles Used:
                  </span>
                  {game.shuttlesUsed.length > 0 ? (
                    game.shuttlesUsed.map((shuttleUsed: any, idx: number) => (
                      <div key={idx} className="ml-4">
                        <span>
                          Name: {shuttleUsed.shuttle?.name || "Unknown"}
                        </span>
                        <span> - Quantity: {shuttleUsed.quantity || 0}</span>
                      </div>
                    ))
                  ) : (
                    <span>No shuttles used</span>
                  )}
                </div>
                {/* Players */}
                {["A1", "A2", "B1", "B2"].map((playerKey) => (
                  <div className="ml-4" key={playerKey}>
                    <span className="block text-muted-foreground">
                      {playerKey} Player:
                    </span>
                    <span className="block font-semibold">
                      {game[playerKey]?.name || "No Name available"}
                    </span>
                  </div>
                ))}

                <div>
                  <span className="block text-muted-foreground">Status:</span>
                  <span className="block font-semibold">
                    {game.status || "No status available"}
                  </span>
                </div>

                <div>
                  <span className="block text-muted-foreground">Winner:</span>
                  <span className="block font-semibold">
                    {game.winner === "a" ? (
                      <span className="text-green-600 underline">Team A</span>
                    ) : (
                      <span className="text-green-600 underline">Team B</span>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <span>No games available</span>
        )}
      </div>
    </div>
  );
};

export default Page;
