"use client";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

const FETCH_SUMMARY = gql`
  query FetchSummary($id: ID!) {
    fetchSessionSummary(_id: $id) {
      totalShuttlesUsed
      shuttleTotal
      courtTotal
      playerTotal
      playerSummaryRates {
        _id
        game
        name
        totalRate
      }
      sponsorSummaryRates {
        _id
        name
        totalRate
      }
      durationPerCourt {
        totalDuration
        court {
          _id
          name
          price
          active
          createdAt
          updatedAt
        }
      }
      session {
        games {
          A1 {
            _id
            name
            sponsoredBy {
              _id
              name
            }
          }
          A2 {
            _id
            name
            sponsoredBy {
              _id
              name
            }
          }
          B1 {
            _id
            name
            sponsoredBy {
              _id
              name
            }
          }
          B2 {
            _id
            name
            sponsoredBy {
              _id
              name
            }
          }
        }
      }
    }
  }
`

const Page = () => {
  const { slug } = useParams();
  const { data, loading, error } = useQuery(FETCH_SUMMARY, {
    ssr: false,
    skip: !slug,
    variables: { id: slug },
    fetchPolicy: "network-only",
  });

  if (data) {
    console.log("Fetched User Data:", data.fetchSessionSummary);
  }

  const formatNumberWithCommas = (number: number) => {
    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const sortedPlayerSummaryRates = data?.fetchSessionSummary?.playerSummaryRates
    ? [...data.fetchSessionSummary.playerSummaryRates].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    : [];

  const isPlayerSponsored = (playerId: string) => {
    const games = data?.fetchSessionSummary?.session?.games || [];
    for (const game of games) {
      const players = [game.A1, game.A2, game.B1, game.B2];
      for (const player of players) {
        if (player?._id === playerId && player?.sponsoredBy?.length > 0) {
          return true; 
        }
      }
    }
    return false; 
  };

  const getPlayersSponsoredBy = (sponsorId: string) => {
    const games = data?.fetchSessionSummary?.session?.games || [];
    const sponsoredPlayers: { name: string; _id: string }[] = [];

    for (const game of games) {
      const players = [game.A1, game.A2, game.B1, game.B2];
      for (const player of players) {
        if (
          player?.sponsoredBy?.some((sponsor: any) => sponsor._id === sponsorId)
        ) {
          sponsoredPlayers.push({ name: player.name, _id: player._id });
        }
      }
    }

    return sponsoredPlayers;
  };

  // Function to get sponsor rate by sponsor ID
  const getSponsorRate = (sponsorId: string) => {
    const sponsor = data?.fetchSessionSummary?.sponsorSummaryRates?.find(
      (s: any) => s._id === sponsorId
    );
    return sponsor ? sponsor.totalRate : 0;
  };

  if (loading)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    );
  if (error) {
    console.error("GraphQL Error:", error);
    return <div>Error fetching Summary.</div>;
  }

  const summary = data?.fetchSessionSummary;

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2 p-2">
      <div>
        <span className="block font-semibold text-muted-foreground">ID</span>
        <span className="block font-bold text-muted-foreground">{slug}</span>
      </div>
      {summary?.durationPerCourt.map((court: any) => (
        <div key={court.court._id}>
          <span className="block font-semibold text-muted-foreground">
            Court Duration
          </span>
          <span className="block font-bold text-muted-foreground">
            {court.court.name} - {court.totalDuration}mins
          </span>
        </div>
      ))}
      <div>
        <span className="block font-semibold text-muted-foreground">
          Shuttles Used
        </span>
        <span className="block font-bold text-muted-foreground">
          {summary?.totalShuttlesUsed} shuttles
        </span>
      </div>
      <Separator className="bg-slate-400" />
      <div className="grid grid-cols-2">
        <div>
          <span className="block font-semibold text-muted-foreground">
            Court Total
          </span>
          <span className="block font-bold text-muted-foreground">
            {formatNumberWithCommas(summary?.courtTotal)}
          </span>
        </div>
        <div>
          <span className="block font-semibold text-muted-foreground">
            Shuttle Total
          </span>
          <span className="block font-bold text-muted-foreground">
            {formatNumberWithCommas(summary?.shuttleTotal)}
          </span>
        </div>
        <div>
          <span className="block font-semibold text-muted-foreground">
            Player Total
          </span>
          <span className="block font-bold text-muted-foreground">
            {formatNumberWithCommas(summary?.playerTotal)}
          </span>
        </div>
      </div>

      <Separator className="bg-slate-400" />
      <div className="grid grid-cols-2">
        {sortedPlayerSummaryRates
          .filter((player) => !isPlayerSponsored(player._id)) // Filter out sponsored players
          .map((player: any) => {
            const sponsoredPlayers = getPlayersSponsoredBy(player._id);
            return (
              <div key={player._id}>
                <span className="block font-semibold text-muted-foreground">
                  {player.name}
                </span>
                <span className="block font-bold text-muted-foreground">
                  {formatNumberWithCommas(player.totalRate)}
                </span>
                {sponsoredPlayers.length > 0 && (
                  <div className="block text-sm text-muted-foreground">
                    <span>Sponsors:</span>
                    {sponsoredPlayers.map((p) => {
                      const sponsorRate = getSponsorRate(player._id);
                      return (
                        <div key={p._id}>
                          <span>{p.name}</span>
                          <span className="ml-2">
                            (Rate: {formatNumberWithCommas(sponsorRate)})
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default Page