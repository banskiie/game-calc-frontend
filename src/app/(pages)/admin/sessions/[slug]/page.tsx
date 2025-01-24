"use client";

import { useRouter, useParams } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import { Loader, Loader2 } from "lucide-react";
import ShuttleForm from "../form";
import { Card, CardContent } from "@/components/ui/card";

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

  if (loading)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    )
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
      <div className="grid grid-cols-1 gap-4">
        {session.games.length > 0 ? (
          session.games.map((game: any, index: number) => (
            <Card key={game._id} className="p-4">
              <CardContent>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-bold mb-4">Game {index + 1}</span>
                </div>

                <div className="grid grid-rows-3 grid-cols-3 gap-2">
                  {/* Top Row */}
                  <div className="text-left">
                    <span className="block text-muted-foreground">Start:</span>
                    <span className="block font-semibold">
                      {game.start || "No start time"}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="block text-muted-foreground">Court:</span>
                    <span className="block font-semibold">
                      {game.court?.name || "No court assigned"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-muted-foreground">End:</span>
                    <span className="block font-semibold">
                      {game.end || "No end time"}
                    </span>
                  </div>

                  {/* Middle Row */}
                  {/* <div className="text-left">
                    <span className="block font-semibold">
                      {game.A1?.name || "No Name available"}
                    </span>
                    <span className="block font-semibold">
                      {game.A2?.name || "No Name available"}
                    </span>
                  </div>
                  <div className="text-center flex items-center justify-center font-semibold text-lg">
                    v.s.
                  </div>
                  <div className="text-right">
                    <span className="block font-semibold">
                      {game.B1?.name || "No Name available"}
                    </span>
                    <span className="block font-semibold">
                      {game.B2?.name || "No Name available"}
                    </span>
                  </div> */}
                    {["A1", "A2"].map((player) => (
                    <div className="text-left" key={player}>
                      <span className="block font-semibold">
                        {game[player]?.name || "No Name available"}
                      </span>
                    </div>
                  ))}
                  <div className="text-center flex items-center justify-center font-semibold text-lg">
                    v.s.
                  </div>
                  {["B1", "B2"].map((player) => (
                    <div className="text-right" key={player}>
                      <span className="block font-semibold">
                        {game[player]?.name || "No Name available"}
                      </span>
                    </div>
                  ))}

                  {/* Bottom Row */}
                  <div className="text-left">
                    <span className="block text-muted-foreground">Shuttles Used:</span>
                    {game.shuttlesUsed.length > 0 ? (
                      game.shuttlesUsed.map((shuttleUsed: any, idx: number) => (
                        <div key={idx}>
                          <span>
                            {shuttleUsed.shuttle?.name || "Unknown"}
                          </span>
                          <span> - Quantity: {shuttleUsed.quantity || 0}</span>
                        </div>
                      ))
                    ) : (
                      <span>No shuttles used</span>
                    )}
                  </div>
                  <div className="text-center">
                    <span className="block text-muted-foreground">Winner:</span>
                    <span className="block font-semibold">
                      {game.winner === "a" ? (
                        <span className="text-green-600 underline">Team A</span>
                      ) : (
                        <span className="text-green-600 underline">Team B</span>
                      )}
                    </span>
                  </div>
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
