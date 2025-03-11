"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { gql, useQuery } from "@apollo/client"
// import { useSession } from "next-auth/react"

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
      court {
        _id
        name
        price
        active
        createdAt
        updatedAt
      }
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
`

interface SessionContextType {
  sessions: any[]
  limit: number
  setLimit: (limit: number) => void
  loading: boolean
}

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  // const { data: session } = useSession()
  const [limit, setLimit] = useState<number>(50)
  const [sessions, setSessions] = useState<any[]>([])
  const { data, loading } = useQuery(FETCH_SESSIONS, {
    variables: { limit },
    fetchPolicy: "cache-and-network",
  })

  useEffect(() => {
    if (data?.fetchSessions) setSessions(data.fetchSessions)
  }, [data?.fetchSessions])

  return (
    <SessionContext.Provider
      value={{ sessions, loading, limit, setLimit }}
    >
      {children}
    </SessionContext.Provider>
  )
}

export const useSessions = () => {
  const context = useContext(SessionContext)
  if (!context)
    throw new Error("useSessions must be used within a SessionProvider")
  return context
}