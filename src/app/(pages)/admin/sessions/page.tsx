"use client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { gql, useLazyQuery, useMutation } from "@apollo/client"
import { differenceInMinutes, format } from "date-fns"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"

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
    }
  }
`

const START_SESSION = gql`
  mutation StartSession {
    startSession {
      _id
    }
  }
`

// const END_SESSION = gql`
//   mutation EndSession($id: ID!) {
//     endSession(_id: $id) {
//       _id
//     }
//   }
// `

const page = () => {
  const [limit, setLimit] = useState<number>(5)
  const [fetchMore, { data, refetch, loading }] = useLazyQuery(FETCH_SESSIONS, {
    onCompleted: (data) => console.log(data),
    variables: { limit },
    onError: (error) => console.log(error),
  })
  const [startSession] = useMutation(START_SESSION, {
    onCompleted: () => refetch(),
  })
  const sessions = data?.fetchSessions
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      await fetchMore({ variables: { limit } })
    }
    fetchData()
  }, [limit, fetchMore])

  if (loading)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    )

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2">
      <div className="sticky top-0 w-full bg-slate-200 p-2">
        <Button className="w-full " onClick={async () => await startSession()}>
          Add Session
        </Button>
      </div>
      {sessions?.map((session: any) => (
        <Card
          key={session._id}
          onClick={() => router.push("/admin/sessions/" + session._id)}
          className="mx-2"
        >
          <CardHeader>
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
                    <span className="block text-muted-foreground">
                      {format(new Date(session.games[0].start), "h:mm a")} to{" "}
                      {session.games[session.games.length - 1].end
                        ? format(
                            new Date(
                              session.games[session.games.length - 1].end
                            ),
                            "h:mm a"
                          )
                        : "TBA"}{" "}
                    </span>
                  </>
                )}
              </span>
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
          setLimit(limit + 5)
          fetchMore({ variables: { limit } })
        }}
        className="font-bold"
      >
        LOAD MORE?
      </Button>
    </div>
  )
}

export default page
