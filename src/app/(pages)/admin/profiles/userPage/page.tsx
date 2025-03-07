"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { Loader2, Settings } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

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
  }
}`

// SponsorSelect Component
interface Sponsor {
  _id: string;
  name: string;
}

interface SponsorSelectProps {
  sponsors: Sponsor[];
  selectSponsors: string[];
  onSelectSponsor: (playerId: string) => void;
}

export const SponsorSelect: React.FC<SponsorSelectProps> = ({
  sponsors,
  selectSponsors,
  onSelectSponsor,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const selectedSponsorNames =
    selectSponsors
      .map((id) => sponsors.find((p) => p._id === id)?.name)
      .filter(Boolean)
      .join(", ") || "Search Sponsors...";

  const filteredSponsors = sponsors.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Select>
      <SelectTrigger className="truncate">
        <div className="truncate">
          {selectSponsors.length
            ? selectSponsors
                .map((id) => sponsors.find((p) => p._id === id)?.name)
                .join(", ")
            : "Select Sponsors"}
        </div>
      </SelectTrigger> 
      <SelectContent>
        <div className="p-2">
          <Input
            placeholder={selectedSponsorNames}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 bg-white px-1"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {filteredSponsors.map((player) => (
          <div key={player._id} className="flex items-center gap-2 p-2">
            <Checkbox
              id={player._id}
              checked={selectSponsors.includes(player._id)}
              onCheckedChange={() => onSelectSponsor(player._id)}
            />
            <label htmlFor={player._id} className="text-sm">
              {player.name}
            </label>
          </div>
        ))}
      </SelectContent>
    </Select>
  );
};

// Main Page Component
const Page = () => {
  const [fetchMore, { data, refetch, loading }] = useLazyQuery(FETCH_USERS, {
    onCompleted: (data) => console.log("Fetched users:", data),
    onError: (error) => console.error("Error fetching users:", error),
  });
  const [updateUserSponsors] = useMutation(UPDATE_USER_SPONSORS);
  const users = data?.fetchUsers;
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState<boolean>(false);
  const [isSponsorDialogOpen, setIsSponsorDialogOpen] = useState<boolean>(false);
  const [selectedSponsors, setSelectedSponsors] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchMore();
    };
    fetchData();
  }, [fetchMore]);

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setIsEditFormOpen(true);
  };

  const handleAddSponsorClick = (user: any) => {
    setSelectedUser(user); // Set the selected user when "Add Sponsors" is clicked
    setIsSponsorDialogOpen(true);
  };

  const handleSelectSponsor = (sponsorId: string) => {
    setSelectedSponsors((prev) =>
      prev.includes(sponsorId)
        ? prev.filter((id) => id !== sponsorId)
        : [...prev, sponsorId]
    );
  };

  const handleAddSponsor = async () => {
    if (!selectedUser || selectedSponsors.length === 0) {
      console.error("Please select a user and at least one sponsor.")
      return;
    }
  
    console.log("Selected User ID:", selectedUser._id);
    console.log("Selected Sponsors:", selectedSponsors);
  
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
        console.log("Sponsors added successfully!");
        setIsSponsorDialogOpen(false);
        setSelectedSponsors([]);
        refetch();
      }
    } catch (error) {
      console.error("Error adding sponsors:", error);
      console.error("Failed to add sponsors. Please try again.");
    }
  }

  if (loading)
    return (
      <div className="flex-1 h-fit flex items-center justify-center">
        <Loader2 className="animate-spin" size={200} />
      </div>
    );

  return (
    <div className="h-fit flex-1 overflow-auto w-full flex flex-col gap-2">
      <div className="sticky top-0 w-full p-2">
        <UserForm refetch={refetch} />
      </div>
      {users?.map((user: any) => (
        <Card key={user._id} className="mx-2">
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription className="flex flex-col gap-1">
                <span>
                  <span className="font-semibold">Contact No: </span>
                  <span>{user.contact}</span>
                </span>
                {user.sponsors && user.sponsors.length > 0 && (
                  <span>
                    <span className="font-semibold">Sponsors: </span>
                    <span>
                      {user.sponsors.map((sponsor: any) => sponsor.name).join(", ")}
                    </span>
                  </span>
                )}
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
              <DialogTitle className="mb-2">
                Add Sponsors for{" "}
                <span className="underline">{selectedUser.name}</span>
              </DialogTitle>
            )}
            <DialogDescription>
              Select one or more sponsors from the list below.
            </DialogDescription>
          </DialogHeader>
          <SponsorSelect
            sponsors={users || []}
            selectSponsors={selectedSponsors}
            onSelectSponsor={handleSelectSponsor}
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