"use client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { gql, useLazyQuery } from "@apollo/client"
import { Loader2, Settings } from "lucide-react"
// import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import UserForm from "../form"
import { useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import PlayerSelect from "@/components/custom/PlayerSelect"
import { SponsorSelect } from "@/components/custom/SponsorSelect"

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
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState<boolean>(false)
  const [isSponsorDialogOpen, setIsSponsorDialogOpen] = useState<boolean>(false)
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([])


  useEffect(() => {
    const fetchData = async () => {
      await fetchMore()
    }
    fetchData()
  }, [fetchMore])

  const handleEditClick = (user: any) => {
    setSelectedUser(user)
    setIsEditFormOpen(true)
  }

  const handleAddSponsorClick = (user: any) => { 
    setSelectedUser(user); // gi set ang selected user pag ang add sponsor is ma click
    setIsSponsorDialogOpen(true)
  }

  const handleSelectSponsor = (sponsorId: string) => {
    setSelectedSponsors((prev) =>
      prev.includes(sponsorId)
        ? prev.filter((id: any) => id !== sponsorId) 
        : [...prev, sponsorId] 
    )
  }

  const handleAddSponsor = () => {
    // Logic to add the selected Sponsors (Create into the backend first)
    console.log("Selected Sponsors", selectedSponsors)
    setIsSponsorDialogOpen(false)
    setSelectedSponsors([])
  }

  if (loading)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    )

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2">
      <div className="sticky top-0 w-full p-2">
      <UserForm refetch={refetch} />
      </div>
      {users?.map((user: any) => (
        <Card key={user._id} className="mx-2"
        // onClick={() => router.push("/admin/profiles/" + user._id)}
        >
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription className="flex flex-col gap-1">
              <span>
                <span className="font-semibold">Contact No: </span>
                <span>{user.contact}</span>
              </span>
            </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
              </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleEditClick(user)}>
                      Edit
                  </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddSponsorClick(user)}>
                      Add Sponsor
                  </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      {/* Edit User Form */}
      {selectedUser && (
        <UserForm
          id={selectedUser._id}
          refetch={refetch}
          open={isEditFormOpen}
          onOpenChange={setIsEditFormOpen}
        />
      )}

      {/* Sponsor Dialog */}
      <Dialog open={isSponsorDialogOpen} onOpenChange={setIsSponsorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            {selectedUser && (
              <DialogTitle className="mb-2">Add Sponsor for <span className=" underline">{selectedUser.name}</span></DialogTitle>
            )}
            <DialogDescription>
              Enter the sponsor's name below.
            </DialogDescription>
          </DialogHeader>
          {/* <Input
            value={sponsorName}
            onChange={(e) => setSponsorName(e.target.value)}
            placeholder="Sponsor Name"
          /> */}
            <SponsorSelect
              sponsors={users || []}
              selectSponsors={selectedSponsors}
              onSelectSponsor={handleSelectSponsor}
            />
          <DialogFooter>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleAddSponsor}>Add Sponsor</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default page
