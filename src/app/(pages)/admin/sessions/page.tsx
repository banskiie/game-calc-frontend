"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { gql, useMutation, useQuery } from "@apollo/client"
import { format } from "date-fns"
import { CircleStop, Eye, NotepadText } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"

const FETCH_SESSIONS = gql`
  query FetchSessions {
    fetchSessions {
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

const END_SESSION = gql`
  mutation EndSession($id: ID!) {
    endSession(_id: $id) {
      _id
    }
  }
`

const page = () => {
  const { data, refetch, loading } = useQuery(FETCH_SESSIONS, {
    onCompleted: (data) => console.log(data),
  })
  const [startSession, { loading: startLoading }] = useMutation(START_SESSION)
  const [endSession, { loading: endLoading }] = useMutation(END_SESSION)
  const sessions = data?.fetchSessions
  const router = useRouter()

  if (startLoading || endLoading || loading) return <div>Loading...</div>

  return (
    <div className="h-fit w-full flex flex-col gap-4 p-3">
      <Button
        size="lg"
        onClick={() => {
          startSession()
          refetch()
        }}
      >
        Add Session
      </Button>
      {sessions?.map((session: any) => (
        <Card key={session._id}>
          <CardHeader>
            <CardTitle>Session</CardTitle>
            <CardDescription>
              <span>
                <span className="font-bold">Start: </span>
                {format(new Date(session.start), "h:mm a MMMM d, yyyy")}
              </span>
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex gap-2 justify-end">
            <Button size="icon" className="bg-green-800 hover:bg-green-800/90">
              <Eye />
            </Button>
            <Button
              size="icon"
              className="bg-blue-800 hover:bg-blue-800/90"
              onClick={() => router.push(`/admin/sessions/${session._id}`)}
            >
              <NotepadText />
            </Button>
            {!session?.end && (
              <Button
                size="icon"
                variant="destructive"
                onClick={() => {
                  endSession({ variables: { id: session._id } })
                  refetch()
                }}
              >
                <CircleStop />
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default page
