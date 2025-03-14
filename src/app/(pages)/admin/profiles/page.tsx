"use client"
import { signOut, useSession } from "next-auth/react"
import React, { useEffect, useState } from "react"
import { Users, LogOut, ChevronRight, Loader2, ScrollText } from "lucide-react"
// import { useRouter } from "next/navigation"
import Link from "next/link"
import { gql, useQuery } from "@apollo/client"

declare module "next-auth" {
  interface User {
    _id?: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
    username?: string;
  }

  interface Session {
    user?: User;
  }
}

const FETCH_USER = gql`
 query FetchUser($id: ID!) {
    fetchUser(_id: $id) {
      _id
      name
      contact
      username
      password
      role
    }
  }
`

const Page = () => {
  const { data: session } = useSession()
  // const router = useRouter()
  const [userData, setUserData] = useState<any>(null)

  const { data, loading } = useQuery(FETCH_USER, {
    variables: { id: session?.user?._id },
    skip: !session?.user?._id,
  });

  useEffect(() => {
    if (data?.fetchUser) {
      setUserData(data.fetchUser);
    }
  }, [data])

  if (loading) return <Loader2 />

  // const firstLetterName = userData?.name ? userData.name.charAt(0).toUpperCase() : "N/A"
  const firstLetterName = userData?.name ? userData.name.split(" ").map((word: any) => word.charAt(0).toUpperCase()).join("") : "N/A"
  console.log(firstLetterName)
  const fullName = userData?.name || "Guest User"
  const userRole = userData?.role || "No Role"
  
  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col items-center">
      <div className="w-full h-52 bg-green-600 rounded-b-2xl relative">
        {/* <Link href="/admin/profiles/userPage/editPage">
        <button className="absolute right-6 bottom-[-20px] bg-white text-gray-700 p-3 rounded-full shadow-md hover:bg-gray-200 transition">
          <Pencil size={22} />
        </button>
        </Link> */}
      </div>

      <div className="relative -mt-16 w-32 h-32 bg-green-900 text-white flex items-center justify-center rounded-full border-4 border-white shadow-lg">
        <span className="text-5xl font-bold uppercase">{firstLetterName}</span>
      </div>

      <div className="mt-6 text-center">
        <h1 className="text-3xl font-bold capitalize">{fullName}</h1>
        <p className="text-lg text-gray-600 capitalize">{userRole}</p>
      </div>

      <div className="w-full mt-8">
        <Link href="/admin/profiles/userPage/" className="block">
        <button 
        className="flex items-center justify-between w-full px-12 py-6 text-lg text-gray-700 bg-white hover:bg-gray-100 transition border-t border-gray-300 mb-4">
          <div className="flex items-center">
            <Users className="mr-4" size={26} /> Users
          </div>
          <ChevronRight size={22} className="text-gray-400" />
        </button>
        </Link>
        
        {/* <button className="flex items-center justify-between w-full px-12 py-6 text-lg text-gray-700 bg-white hover:bg-gray-100 transition border-t border-gray-300 mb-4">
          <div className="flex items-center">
            <History className="mr-4" size={26} /> Sessions
          </div>
          <ChevronRight size={22} className="text-gray-400" />
        </button> */}

        {/* <button className="flex items-center justify-between w-full px-12 py-6 text-lg text-gray-700 bg-white hover:bg-gray-100 transition border-t border-gray-300 mb-4">
          <div className="flex items-center">
            <Gamepad2 className="mr-4" size={26} /> Game History
          </div>
          <ChevronRight size={22} className="text-gray-400" />
        </button> */}

    <Link href="/admin/profiles/summaryHistory/">
        <button className="flex items-center justify-between w-full px-12 py-6 text-lg text-gray-700 bg-white hover:bg-gray-100 transition border-t border-gray-300 mb-4">
          <div className="flex items-center">
            <ScrollText className="mr-4" size={26} /> Summary History
          </div>
          <ChevronRight size={22} className="text-gray-400" />
        </button>
        </Link>

        <button
          onClick={() => signOut()}
          className="flex items-center justify-between w-full px-12 py-6 text-lg text-red-600 bg-white hover:bg-red-100 transition border-t border-gray-300"
        >
          <div className="flex items-center">
            <LogOut className="mr-4" size={26} /> Logout
          </div>
          <ChevronRight size={22} className="text-red-400" />
        </button>
      </div>
    </div>
  )
}

export default Page
