"use client";

import { useParams } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const FETCH_SESSION_BETS_SUMMARY = gql`
  query FetchSessionBetsSummary($id: ID!) {
    fetchSessionBetsSummary(_id: $id) {
      totalBets
      totalAmount
      session {
        _id
        start
        end
      }
      playerStats {
        wins
        losses
        total
        user {
          _id
          name
        }
      }
      totalWins
      totalLosses
    }
  }
`;

const BetSummaryPage = () => {
  const { slug } = useParams();
  const { data, loading, error } = useQuery(FETCH_SESSION_BETS_SUMMARY, {
    variables: { id: slug },
  });

  if (loading)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    );

  if (error) return <div>Error: {error.message}</div>;

  const sessionBetsSummary = data?.fetchSessionBetsSummary;

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-4 p-4">
      <Card className="p-3 w-full max-w-md mx-auto shadow-inner flex items-center justify-center bg-opacity-100 shadow-gray-500/60">
        <CardContent className="flex flex-col items-center text-center pb-2">
          <CardTitle className="text-2xl font-bold mb-4">Bet Summary</CardTitle>
          <CardDescription>
            Session:{" "}
            {sessionBetsSummary?.session.start
              ? format(new Date(sessionBetsSummary.session.start), "MMMM dd, YYY")
              : "TBA"}
          </CardDescription>
          <CardDescription>
            Total Bets: {sessionBetsSummary?.totalBets}
          </CardDescription>
          <CardDescription>
            Total Amount: ${sessionBetsSummary?.totalAmount}
          </CardDescription>
          <CardDescription>
            Total Wins: {sessionBetsSummary?.totalWins}
          </CardDescription>
          <CardDescription>
            Total Losses: {sessionBetsSummary?.totalLosses}
          </CardDescription>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Player Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Win</th>
                    <th className="px-4 py-2 text-left">Lose</th>
                    <th className="px-4 py-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionBetsSummary?.playerStats.map((player: any) => (
                    <tr key={player.user._id} className="border-b">
                      <td className="px-4 py-2">{player.user.name}</td>
                      <td className="px-4 py-2">{player.wins}</td>
                      <td className="px-4 py-2">{player.losses}</td>
                      <td className="px-4 py-2">{player.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-4">
        <Button onClick={() => window.history.back()}>Go Back</Button>
      </div>
    </div>
  );
};

export default BetSummaryPage;