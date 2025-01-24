"use client"

import { useRouter, useParams } from "next/navigation"
import { gql, useQuery } from "@apollo/client"
import { Loader } from "lucide-react"
import ShuttleForm from "../form"

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
`

const Page = () => {
  const { slug } = useParams()
  const { data, loading, error } = useQuery(FETCH_SESSION, {
    ssr: false,
    skip: !slug,
    variables: { id: slug },
  })

  const session = data?.fetchSession
  const router = useRouter()

  if (loading) return <Loader />
  if (error) return <div>Error: {error.message}</div>
  if (!session) return <div>No session data available</div>

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2 p-2">
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
        <span className="block text-muted-foreground">Games</span>
        {session.games.length > 0 ? (
          session.games.map((game: any, index: number) => (
            <div key={game._id} className="mb-4">
              <div>
                <span className="block font-semibold">Game {index + 1}</span>
                <span className="block text-muted-foreground">Court Name:</span>
                <span className="block font-semibold">
                  {game.court?.name || "No court assigned"}
                </span>
                <span className="block text-muted-foreground">Shuttles Used:</span>
                {game.shuttlesUsed.length > 0 ? (
                  game.shuttlesUsed.map((shuttleUsed: any, idx: number) => (
                    <div key={idx} className="ml-4">
                      <span>Name: {shuttleUsed.shuttle?.name || "Unknown"}</span>
                      <span> - Quantity: {shuttleUsed.quantity || 0}</span>
                    </div>
                  ))
                ) : (
                  <span>No shuttles used</span>
                )}
               
              </div>

               {/* Fix this name where it will display the name */}
               {game.A1.length > 0 ? (game.A1.map((player: any, idx: number) => (
                  <div key={idx} className="ml-4">
                    <span>Name: {player.name || "Unknown"} </span>
                    </div>
                    ))
                ) : (
                  <span>No Name available</span>
                )}
            </div>
          ))
        ) : (
          <span>No games available</span>
        )}
        
      </div>
    </div>
  )
}

export default Page
