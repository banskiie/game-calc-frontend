"use client"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { gql, useQuery } from '@apollo/client'
import { Loader2 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React from 'react'
import BetsForm from '../form'
import { Badge } from '@/components/ui/badge'

const FETCH_BETS = gql`
query FetchBets {
    fetchBets {
        _id
        betType
        betAmount
        paid
        active
        bettorForA {
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
        bettorForB {
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
        game {
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
}`


const page = () => {
    const { slug } = useParams()
    const {data, refetch, loading} = useQuery(FETCH_BETS, {
        ssr: false,
        skip: !slug,
        variables: {id: slug}
    })
    const bets = data?.fetchBets
    const router = useRouter()

    if(loading) return <Loader2 />

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2">
      <div className="sticky top-0 w-full bg-slate-200 p-2">
        <BetsForm refetch={refetch} gameId={slug as string} />
      </div>

      {bets?.map((bet: any) => (
        <Card
          key={bet._id}
          onClick={() => router.push("/admin/bets/" + bet._id)}
          className="mx-2 cursor-pointer hover:shadow-lg transition-all"
        >
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>{bet.betType}</span>
              <Badge className={`${bet.paid ? "bg-green-700" : "bg-red-600"} text-white`}>
                {bet.paid ? "Paid" : "Unpaid"}
              </Badge>
            </CardTitle>
            <CardDescription className="flex flex-col gap-1">
              <span className="font-bold text-muted-foreground">
                {bet.bettorForA.name} vs {bet.bettorForB.name}
              </span>
              <span className="text-lg font-semibold">₱{bet.betAmount.toFixed(2)}</span>
              <span className="text-sm">Game Status: {bet.game.status}</span>
              <span className="text-sm">Court: {bet.game[0].court?.name || "No Court that they are Playing Right now"}</span>
            </CardDescription>
          </CardHeader>
          <CardFooter>
          <BetsForm
          id={bet._id}
          refetch={refetch}
          gameId={slug as string}
          />
          </CardFooter>
        </Card>
      ))}

      <span className="text-muted-foreground text-center mt-4">
        Total Bets: {bets?.length || 0}
      </span>
    </div>
  )
}

export default page