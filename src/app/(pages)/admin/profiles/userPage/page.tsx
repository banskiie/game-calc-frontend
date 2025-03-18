"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { Loader2, Search, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";
import UserForm from "../form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sponsor, SponsorSelect } from "@/components/custom/SponsorSelect";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const FETCH_USERS = gql`
  query FetchUsers {
    fetchUsers {
      _id
      name
      contact
      username
      role
      active
      sponsors {
        _id
        name
      }
      sponsoredBy {
        _id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

const UPDATE_USER_SPONSORS = gql`
  mutation UpdateUserSponsors($input: UpdateUserSponsorsInput!) {
    updateUserSponsors(input: $input) {
      _id
      name
      sponsors {
        _id
        name
      }
      sponsoredBy {
        _id
        name
      }
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      _id
      name
      role
    }
  }
`;

const Page = () => {
  const [fetchMore, { data, refetch, loading }] = useLazyQuery(FETCH_USERS, {
    onCompleted: (data) => console.log("Fetched users:", data),
    onError: (error) => console.error("Error fetching users:", error),
  });
  const [updateUserSponsors] = useMutation(UPDATE_USER_SPONSORS);
  const [createUser] = useMutation(CREATE_USER);
  const users = data?.fetchUsers;
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState<boolean>(false);
  const [isSponsorDialogOpen, setIsSponsorDialogOpen] = useState<boolean>(false);
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      await fetchMore();
    };
    fetchData();
  }, [fetchMore]);

  useEffect(() => {
    if (users) {
      setSponsors(users);
    }
  }, [users]);

  const filteredUsers = users?.filter((user: any) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setIsEditFormOpen(true);
  };

  const handleAddSponsorClick = async (user: any) => {
    setSelectedUser(user);
    // Safely handle null/undefined sponsors
    setSelectedSponsors(user.sponsors?.map((sponsor: any) => sponsor._id) ?? []);
    setIsSponsorDialogOpen(true);
  };

  const handleSelectSponsor = (sponsorId: string) => {
    setSelectedSponsors((prev) =>
      prev.includes(sponsorId)
        ? prev.filter((id) => id !== sponsorId)
        : [...prev, sponsorId]
    );
  };

  const handleCreateSponsor = async (name: string) => {
    try {
      const response = await createUser({
        variables: {
          input: {
            name: name,
            role: "user",
          },
        },
      })

      if (response.data?.createUser) {
        const newSponsor = response.data.createUser;
        setSponsors((prev) => [...prev, newSponsor]);
        setSelectedSponsors((prev) => [...prev, newSponsor._id]);
        toast.success("Sponsor created successfully!");
        return newSponsor._id;
      }
    } catch (error) {
      console.error("Failed to create sponsor. Please try again.", error);
      return null;
    }
  };

  const handleAddSponsor = async () => {
    if (!selectedUser) {
      toast.error("Please select a user.");
      return;
    }

    try {
      const response = await updateUserSponsors({
        variables: {
          input: {
            _id: selectedUser._id,
            sponsors: selectedSponsors,
          },
        },
      });

      if (response.data?.updateUserSponsors) {
        toast.success("Sponsors updated successfully!");
        setIsSponsorDialogOpen(false);
        setSelectedSponsors([]);
        refetch(); // Refetch data to update the UI
      }
    } catch (error) {
      console.error("Error adding sponsors:", error);
      toast.error("Failed to update sponsors. Please try again.");
    }
  };

  if (loading)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    );

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2">
      <div className="sticky top-0 w-full p-2">
           {selectedUser && selectedUser._id ? (
        <UserForm
          id={selectedUser._id}
          refetch={refetch}
          open={isEditFormOpen}
          onOpenChange={setIsEditFormOpen}
        />
      ):
      (
          <UserForm
          refetch={refetch}
          open={isEditFormOpen}
          onOpenChange={setIsEditFormOpen} 
          />
      )}

      </div>

      <div className="sticky top-11 w-full p-2 bg-white z-10">
        <div className="relative">
          <Input
            placeholder="Search users..."
            value={searchQuery ?? ""}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        </div>
      </div>

      {filteredUsers?.map((user: any) => (
        <Card key={user._id} className="mx-2">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription className="flex flex-col gap-1">
                  <div className="flex flex-col mt-2">
                    <span>
                      <span className="font-semibold">Contact No: </span>
                      <span>{user.contact}</span>
                    </span>
                    {user.sponsors?.length > 0 && (
                      <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-bold p-2 rounded-lg shadow-lg border border-yellow-400 tracking-wider">
                        <span className="font-semibold">Sponsoring: </span>
                        <span>
                          {user.sponsors.map((sponsor: any) => sponsor.name).join(", ")}
                        </span>
                      </span>
                    )}
                    {user.sponsoredBy?.length > 0 && (
                      <span className="bg-gradient-to-r from-yellow-200 to-yellow-400 text-black font-semibold p-2 rounded-lg shadow-md tracking-wider">
                        <span className="font-semibold">Sponsored By: </span>
                        <span>
                          {user.sponsoredBy.map((sponsor: any) => sponsor.name).join(", ")}
                        </span>
                      </span>
                    )}
                  </div>
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
                  Add Sponsors
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
        </Card>
      ))}

      <Button
        variant="link"
        onClick={() => {
          fetchMore();
        }}
        className="font-bold"
      >
        LOAD MORE?
      </Button>

     
      <Dialog open={isSponsorDialogOpen} onOpenChange={setIsSponsorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            {selectedUser && (
              <DialogTitle className="mb-2">
              <span className="underline">{selectedUser.name}</span> is Sponsoring for:{" "} 
              </DialogTitle>
            )}
            <DialogDescription>
              Select one or more sponsors from the list below.
            </DialogDescription>
          </DialogHeader>
          <SponsorSelect
            sponsors={sponsors}
            selectedSponsors={selectedSponsors}
            setSelectedSponsors={setSelectedSponsors}
            onSelectSponsor={handleSelectSponsor}
            onCreateSponsor={handleCreateSponsor}
          />
          <DialogFooter>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleAddSponsor}
            >
              Add Sponsors
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Page;