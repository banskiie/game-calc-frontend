"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { gql, useLazyQuery } from "@apollo/client"
import { Loader2 } from "lucide-react"
// import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import ShuttleForm from "../shuttles/form"
import UserForm from "./form"
import { useRouter } from "next/navigation"

const FETCH_USERS = gql`
  query FetchUsers {
    fetchUsers {
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
  }
`

const page = () => {
  const [fetchMore, { data, refetch, loading }] = useLazyQuery(FETCH_USERS, {
    onCompleted: (data) => console.log(data),
  })
  const users = data?.fetchUsers
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      await fetchMore()
    }
    fetchData()
  }, [fetchMore])

  if (loading)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    )

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2">
      <div className="sticky top-0 w-full bg-slate-200 p-2">
      <UserForm refetch={refetch} />
      </div>
      {users?.map((user: any) => (
        <Card key={user._id} className="mx-2"
        onClick={() => router.push("/admin/users/" + user._id)}
        >
          <CardHeader>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription className="flex flex-col gap-1">
              <span>
                <span className="font-semibold">Contact No: </span>
                <span>{user.contact}</span>
              </span>
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
      <Button
        variant="link"
        onClick={() => {
          fetchMore()
        }}
        className="font-bold"
      >
        LOAD MORE?
      </Button>
    </div>
  )
}

export default page
