"use client";

import { useParams } from "next/navigation";
import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Frown, Loader2, NotebookTabs } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FETCH_SESSION_BETS_SUMMARY = gql`
  query FetchSessionBetsSummary($id: ID!, $betType: String) {
    fetchSessionBetsSummary(_id: $id, betType: $betType) {
      session {
        _id
        start
        end
      }
      playerStats {
        user {
          _id
          name
        }
        wins
        losses
        total
        competitors {
          user {
            _id
            name
          }
          wins
          losses
          total
        }
      }
      totalBets
      totalAmount
      totalWins
      totalLosses
    }
  }
`;

const FETCH_BET_TYPES = gql`
  query FetchDistinctBetTypes($sessionId: ID!) {
    fetchDistinctBetTypes(sessionId: $sessionId)
  }
`;

const BetSummaryPage = () => {
  const { slug } = useParams();
  const [betTypes, setBetTypes] = useState<string[]>([]);
  const [selectedBetType, setSelectedBetType] = useState<string | null>(null);

  // Fetch bet types specific sa current session
  const {
    data: dataBetTypes,
    loading: loadingBetTypes,
    error: errorBetTypes,
  } = useQuery(FETCH_BET_TYPES, {
    variables: { sessionId: slug },
  });

  // Fetch session bets summary
  const { data, loading, error, refetch } = useQuery(
    FETCH_SESSION_BETS_SUMMARY,
    {
      variables: { id: slug, betType: selectedBetType },
    }
  );
  useEffect(() => {
    if (data) {
      console.log("Session Bets Summary:", data.fetchSessionBetsSummary);
    }
  }, [data]);

  // Gi load ang napili nga filter gikan sa localStorage sa pag-mount sa component
  useEffect(() => {
    const savedFilter = localStorage.getItem(`selectedBetType-${slug}`);
    if (savedFilter) {
      setSelectedBetType(savedFilter);
    }
  }, [slug]);

  // I save ang napili nga filter sa localStorage every naay changes
  useEffect(() => {
    if (selectedBetType) {
      localStorage.setItem(`selectedBetType-${slug}`, selectedBetType);
    }
  }, [selectedBetType, slug]);

  useEffect(() => {
    refetch({ id: slug, betType: selectedBetType });
  }, [slug, refetch, selectedBetType]);

  useEffect(() => {
    if (dataBetTypes && dataBetTypes.fetchDistinctBetTypes) {
      setBetTypes(dataBetTypes.fetchDistinctBetTypes);
    }
  }, [dataBetTypes]);

  const handleBetTypeChange = (betType: string) => {
    setSelectedBetType(betType);
    refetch({ id: slug, betType });
  };

  if (loading || loadingBetTypes)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    );

  if (error) return <div>Error: {error.message}</div>;
  if (errorBetTypes) return <div>Error: {errorBetTypes.message}</div>;

  const sessionBetsSummary = data?.fetchSessionBetsSummary;

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-4 p-4">
      <Card className="p-3 w-full max-w-md mx-auto shadow-inner flex items-center justify-center bg-opacity-100 shadow-gray-500/60">
        <CardContent className="flex flex-col items-center text-center pb-2">
          <CardTitle className="text-2xl font-bold mb-4">Bet Summary</CardTitle>
          <CardDescription>
            Bets Session:{" "}
            <span className="font-bold">
              {sessionBetsSummary?.session.start
                ? format(
                    new Date(sessionBetsSummary.session.start),
                    "MMMM dd, YYY"
                  )
                : "TBA"}
            </span>
          </CardDescription>
          <CardDescription>
            Total Bets:{" "}
            <span className="font-bold">{sessionBetsSummary?.totalBets}</span>
          </CardDescription>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold border-b pb-2 flex items-center justify-between">
              <div className="flex items-center">
                <NotebookTabs className="w-6 h-6 text-green-500 mr-3" /> Bettors
                Lists
                {selectedBetType && (
                  <span className="ml-2 text-lg text-gray-600">
                    (Bet:
                    {selectedBetType})
                  </span>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    {selectedBetType
                      ? `Filter: ${selectedBetType}`
                      : "Filter by Bet Type"}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {betTypes.length > 0 ? (
                    betTypes.map((bet: any) => (
                      <DropdownMenuItem
                        key={bet}
                        onClick={() => handleBetTypeChange(bet)}
                      >
                        {bet}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>
                      No bet types available
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessionBetsSummary?.playerStats?.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {sessionBetsSummary?.playerStats.map((player: any) => (
                <AccordionItem
                  key={player.user._id}
                  value={player.user._id}
                  className="border-b"
                >
                  <AccordionTrigger className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <span className="font-medium">{player.user.name}</span>
                    <span className="text-sm text-gray-800">
                      <span className="font-bold text-green-500"> Wins: </span>{" "}
                      <span className="font-bold">{sessionBetsSummary?.totalWins ? player.wins ?? 0 : 0}</span> |
                      <span className="font-bold text-red-500"> Losses: </span>{" "}
                      <span className="font-bold"> {sessionBetsSummary?.totalWins ? player.losses ?? 0 : 0}</span> |
                      <span className="font-bold text-blue-500"> Total: </span>{" "}
                      <span className="font-bold">{sessionBetsSummary?.totalWins ? player.total ?? 0 : 0}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
                    <div className="p-4 space-y-2">
                      <div className="">
                        <h3 className="font-semibold text-base mb-7 border-b-2 pb-3">
                          Counter Bettor
                        </h3>
                        <table className="w-full">
                          <thead>
                            <tr className="text-left border-b">
                              <th className="pb-2">#</th>
                              <th className="pb-2">Name</th>
                              <th className="pb-2">Wins</th>
                              <th className="pb-2">Losses</th>
                              <th className="pb-2">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {player.competitors?.map(
                              (competitor: any, index: number) => (
                                <tr
                                  key={competitor.user._id}
                                  className={`border-b ${
                                    index % 2 === 1 ? "" : "bg-gray-100"
                                  }`}
                                >
                                  <td className="py-2 px-4">{index + 1}</td>
                                  <td className="py-2 px-4 font-semibold">
                                    {competitor.user.name}
                                  </td>
                                  <td className="py-2 px-4">
                                  {sessionBetsSummary?.totalWins ? competitor.wins ?? 0 : 0}
                                  </td>
                                  <td className="py-2 px-4">
                                  {sessionBetsSummary?.totalWins ? competitor.losses ?? 0 : 0}
                                  </td>
                                  <td className="py-2 px-4 font-semibold">
                                  {sessionBetsSummary?.totalWins ? competitor.total ?? 0 : 0}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            ) : (
              <Card className="w-full max-w-md text-center p-6 mt-5 mx-auto">
              <CardContent>
                <div className="flex flex-col items-center">
                  <Frown className="w-16 h-16 text-gray-500 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">No bet available for this game</h2>
                  <p className="text-sm text-gray-600">It seems like there are no Bet Created. Try checking back later!</p>
                </div>
              </CardContent>
            </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BetSummaryPage;
