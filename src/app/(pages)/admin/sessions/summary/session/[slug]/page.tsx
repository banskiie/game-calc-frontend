"use client";
import React from "react";
import { gql, useQuery } from "@apollo/client";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Instagram, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import html2canvas from "html2canvas";
import { differenceInMinutes } from "date-fns"

const FETCH_SUMMARY = gql`
  query FetchSummary($id: ID!) {
    fetchSessionSummary(_id: $id) {
      totalShuttlesUsed
      shuttleTotal
      courtTotal
      playerTotal
      shuttleDetails {
        shuttleName
        quantity
        totalPrice
      }
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
        _id
        start
        end
        createdAt
        updatedAt
        games {
          _id
          start
          end
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

  // Kani mag display sa error na base64 style pero working sya
  // const handleScreenshot = () => {
  //   const tableElement = document.getElementById("game-summary-table");
  //   if (tableElement) {
  //     html2canvas(tableElement).then((canvas) => {
  //       const link = document.createElement("a");
  //       link.download = "game-summary.png";
  //       link.href = canvas.toDataURL();
  //       link.click();
  //     });
  //   }
  // }

  const handleScreenshot = () => {
    const sessionSummaryTime = document.getElementById('session-summary-time')
    const gameSummaryTable = document.getElementById('game-summary-table')

    if (sessionSummaryTime && gameSummaryTable) {
      const tempContainer = document.createElement('div')
      tempContainer.style.position = 'absolute'
      tempContainer.style.left = '-9999px'
      document.body.appendChild(tempContainer)
  
      const clonedSessionSummaryTime = sessionSummaryTime.cloneNode(true);
      const clonedGameSummaryTable = gameSummaryTable.cloneNode(true);
  
      tempContainer.appendChild(clonedSessionSummaryTime)
      tempContainer.appendChild(clonedGameSummaryTable)
  
      html2canvas(tempContainer).then((canvas) => {
        const sessionDate = formatDate(summary?.session?.start).replace(/\//g, '-')
        const courtDuration = summary?.durationPerCourt
          .map((court: any) => `${court.court.name} - ${court.totalDuration} mins`)
          .join(', ');
        const shuttleDuration = summary?.totalShuttlesUsed
        const filename = `Game_Summary_${sessionDate}_Court_${courtDuration}_Shuttle_${shuttleDuration}.png`
  
        canvas.toBlob((blob: any) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a')
          link.href = url
          link.download = filename
          link.style.display = 'none'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url); 
        }, 'image/png')
      }).catch((error) => {
        console.error('Error capturing screenshot:', error)
      }).finally(() => {
        tempContainer.remove()
      })
    }
  }
  
  if (data) {
    console.log("Fetched User Data:", data.fetchSessionSummary);
  }

  const formatNumberWithCommas = (number: number) => {
    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const groupPlayersBySponsor = () => {
    const players = data?.fetchSessionSummary?.playerSummaryRates || [];
    const groupedPlayers: { [key: string]: any[] } = {};

    players.forEach((player: any) => {
      const isSponsored = player.name.includes("(");
      if (isSponsored) {
        const sponsorName = player.name.split(" ")[0];
        if (!groupedPlayers[sponsorName]) {
          groupedPlayers[sponsorName] = [];
        }
        groupedPlayers[sponsorName].push(player);
      } else {
        if (!groupedPlayers[player.name]) {
          groupedPlayers[player.name] = [];
        }
        groupedPlayers[player.name].push(player);
      }
    });

    return groupedPlayers;
  };

  const groupedPlayers = groupPlayersBySponsor();

  const sortedGroupedPlayers = Object.entries(groupedPlayers).sort(([a], [b]) =>
    a.localeCompare(b)
  );

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

  const summary = data?.fetchSessionSummary
  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";

    const date = new Date(isoString)
    return date.toLocaleDateString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  }

  const calculateGameDuration = (start: string, end: string) => {
    return differenceInMinutes(new Date(summary?.session.games[summary.session.games.length - 1].end),
      new Date(summary?.session.games[0].start))
      console.log("this is the start and end" , start, end)
  }

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2 p-2">
      <div className="flex flex-wrap gap-4 justify-between mb-4 mt-4" id="session-summary-time">
        <Card className="shadow-md border flex-1 min-w-[200px]">
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold">
              Date Session
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground font-semibold">
            {formatDate(summary?.session?.start)}
          </CardContent>
        </Card>

        <Card className="shadow-md border flex-1 min-w-[200px]">
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold">
              Court Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground font-semibold">
          {summary?.session?.games?.length > 0 && (
              <div>
                {calculateGameDuration(
                  summary.session.games[0].start,
                  summary.session.games[summary.session.games.length - 1].end
                )}{" "}
                mins
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md border flex-1 min-w-[200px]">
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold">
              Shuttles Used
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground font-semibold">
            {summary?.totalShuttlesUsed} shuttles
          </CardContent>
        </Card>
      </div>

      <Separator className="bg-slate-400" />

      {/* Game Summary Table */}
      <div id="game-summary-table">
        <Table className="border mb-2 mt-2">
        <TableBody>
  {/* Court Total */}
  <TableRow className="bg-white">
    <TableCell className="font-semibold border py-2">
      Court Total
    </TableCell>
    <TableCell className="font-bold border"></TableCell>
    <TableCell className="font-bold border">
      {formatNumberWithCommas(summary?.courtTotal)}
    </TableCell>
  </TableRow>

  {/* Shuttle Details */}
  {summary?.shuttleDetails.map((shuttle: any, index: number) => (
    <TableRow
      key={index}
      className={(index + 1) % 2 === 0 ? "bg-gray-50" : "bg-white"}
    >
      <TableCell className="font-semibold border">
        {shuttle.shuttleName}
      </TableCell>
      <TableCell className="font-bold border">
        {shuttle.quantity} pcs
      </TableCell>
      <TableCell className="font-bold border">
        {formatNumberWithCommas(shuttle.totalPrice)}
      </TableCell>
    </TableRow>
  ))}

  {/* Shuttle Total */}
  <TableRow
    className={
      (summary?.shuttleDetails.length + 1) % 2 === 0
        ? "bg-gray-50"
        : "bg-white"
    }
  >
    <TableCell className="font-semibold border">
      Shuttle Total
    </TableCell>
    <TableCell className="font-bold border"></TableCell>
    <TableCell className="font-bold border">
      {formatNumberWithCommas(summary?.shuttleTotal)}
    </TableCell>
  </TableRow>

  {/* Overall Total */}
  <TableRow className="bg-gray-100">
    <TableCell className="font-semibold border">
      Overall Total
    </TableCell>
    <TableCell className="font-bold border"></TableCell>
    <TableCell className="font-bold border">
      {formatNumberWithCommas(
        (summary?.courtTotal || 0) + (summary?.shuttleTotal || 0)
      )}
    </TableCell>
  </TableRow>
</TableBody>
        </Table>
      </div>
      <Separator className="bg-slate-400" />

      {/* Player Summary Table */}
      <Table className="border mt-2">
        <TableHeader>
          <TableRow>
            <TableHead
              colSpan={2}
              className="text-center text-lg font-bold bg-white text-black"
            >
              Player Summary
            </TableHead>
          </TableRow>
          <TableRow className="bg-gray-100">
            <TableHead className="border font-bold">Name</TableHead>
            <TableHead className="border font-bold">Player Rate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Player Data */}
          {sortedGroupedPlayers.map(([sponsorName, players], index) => (
            <React.Fragment key={sponsorName}>
              <TableRow className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <TableCell className="font-semibold border">
                  {sponsorName}
                </TableCell>
                <TableCell className="font-bold border">
                  {formatNumberWithCommas(
                    players.reduce((acc, player) => acc + player.totalRate, 0)
                  )}
                </TableCell>
              </TableRow>
              {players
                .filter((player) => player.name.includes("("))
                .map((player: any) => (
                  <TableRow
                    key={player._id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <TableCell className="pl-8 text-sm text-muted-foreground border">
                      (
                      {player.name
                        .split(" ")[1]
                        .replace("(", "")
                        .replace(")", "")}
                      )
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground border">
                      {formatNumberWithCommas(player.totalRate)}
                    </TableCell>
                  </TableRow>
                ))}
            </React.Fragment>
          ))}

          <TableRow className="bg-gray-100">
            <TableHead className="text-right font-bold border text-black">
              Player Total:
            </TableHead>
            <TableCell className="font-bold border">
              {formatNumberWithCommas(summary?.playerTotal)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Separator className="bg-slate-400" />
      <div className="flex flex-row gap-2 justify-center items-center">
        <span> Click here to Screenshot: </span>
        <button onClick={handleScreenshot} className="p-2 bg-green-800 text-white rounded">
          <Instagram />
        </button>
      </div>
    </div>
  );
};

export default Page;