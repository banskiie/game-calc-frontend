"use client"
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react"

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

const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      _id
      name
      contact
      username
      password
      role
      
    }
  }
`

const EditUserPage = ({ params }: { params: { id: string } }) => {
  const { data: session } = useSession()
  const [countryCode, setCountryCode] = useState("+63")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")

  const firstLetterName = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "N/A"
  const { data, loading } = useQuery(FETCH_USER, {
    variables: { id: params.id },
  })

  const [updateUser] = useMutation(UPDATE_USER)

  useEffect(() => {
    if (data?.fetchUser) {
      const user = data.fetchUser
      setName(user.name)
      setUsername(user.username)
      setPhoneNumber(user.contact)
      setRole(user.role)
    }
  }, [data])

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})?$/);

    if (match) {
      return `${match[1]}-${match[2]}-${match[3] || ""}`;
    }
    return cleaned
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
     const input: any = {
        _id: params.id,
        name,
        contact: phoneNumber,
        username,
        role,
     }

     if(password) {
        input.password = password
     }

     const response = await updateUser({ variables: { input }})

      if (response.data.updateUser) {
        toast.success("User updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update user. Please try again.")
    }
  }

  if (loading) return <Loader2 />

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col items-center">
      <div className="w-full h-52 bg-green-600 rounded-b-2xl relative flex justify-center">
       
      </div>

      <div className="relative -mt-16 w-32 h-32 bg-green-900 text-white flex items-center justify-center rounded-full border-4 border-white shadow-lg">
        <span className="text-5xl font-bold"> {firstLetterName} </span>
      </div>

      <Card className="w-11/12 max-w-md mt-6 rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-gray-800">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-3 mb-2">
              <label className="text-left text-gray-600 font-semibold">Full Name</label>
              <Input
                type="text"
                placeholder="Enter your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 mb-2">
              <label className="text-left text-gray-600 font-semibold">Username</label>
              <Input
                type="text"
                placeholder="Enter your Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-3 mb-2">
              <label className="text-left text-gray-600 font-semibold">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>


            <div className="flex flex-col gap-3 mb-2">
              <label className="text-left text-gray-600 font-semibold">Contact No</label>
              <div className="flex items-center border rounded-md focus-within:ring-2 focus-within:ring-green-500">
                <Select onValueChange={setCountryCode} defaultValue={countryCode}>
                  <SelectTrigger className="bg-gray-100 border-r p-3 text-gray-700 w-auto">
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+63">+63</SelectItem>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+91">+91</SelectItem>
                  </SelectContent>
                </Select>

                <div className="relative flex-1">
                  <Input
                    type="text"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    className="pl-10 p-3 border-none"
                    placeholder="965-620-7152"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-2">
              <label className="text-left text-gray-600 font-semibold">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full bg-green-800 hover:bg-green-700" type="submit">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditUserPage