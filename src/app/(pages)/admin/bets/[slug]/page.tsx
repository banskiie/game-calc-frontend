"use client"
import { gql, useQuery } from '@apollo/client'
import { Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import React from 'react'
import CourtForm from '../../courts/form'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import BetsForm from '../../sessions/bets/form'
import { Badge } from '@/components/ui/badge'

const FETCH_BET = gql`
    query FetchBet($id: ID!) {
        fetchBet(_id: $id) {
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
    }
`

function page() {
    const {slug} = useParams()
    const {data, loading} = useQuery(FETCH_BET, {
        ssr: false,
        skip: !slug,
        variables: {id: slug}
    })

    const bet = data?.fetchBet
    console.log(bet)
    if (loading) return <Loader2 />
  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2 p-2">
         <div>
        <BetsForm id={slug as string} />
      </div>
        <Card
          key={bet._id}
          className="mx-2 cursor-pointer hover:shadow-lg transition-all"
        >
          <CardHeader>
            <CardTitle className="flex justify-between">
            {bet.bettorForA.name} vs {bet.bettorForB.name}
              <Badge className={`${bet.paid ? "bg-green-700" : "bg-red-600"} text-white`}>
                {bet.paid ? "Paid" : "Unpaid"}
              </Badge>
            </CardTitle>
            <CardDescription className="flex flex-col gap-1">
              <span className="font-bold text-muted-foreground">
              <span>{bet.betType}</span>
              </span>
              <span className="text-lg font-semibold">${bet.betAmount}</span>
              <span className="text-sm"> Court: {bet.game[0]?.court?.name || 'Court info not available'}</span>
              <span> Bet A: {bet.game[0]?.A1.name + " " + "&" + " " + bet.game[0]?.A2.name}  </span>
              <span> Bet B: {bet.game[0]?.B1.name + " " + "&" + " " + bet.game[0]?.B2.name}  </span>
            </CardDescription>
          </CardHeader>
        </Card>
    </div>
  )
}

export default page
