// import { Select, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { useState, forwardRef, useImperativeHandle } from "react";
// import { Input } from "../ui/input";
// import { X } from "lucide-react";
// import { useMutation, gql } from "@apollo/client";

// interface Player {
//   _id: string;
//   name: string;
//   role?: string;
// }

// interface PlayerSelectProps {
//   players: Player[];
//   selectedPlayers: string[];
//   onSelectPlayer: (playerId: string) => void;
//   refetchUsers: () => void;
// }

// const CREATE_USER = gql`
//   mutation CreateUser($input: UserInput!) {
//     createUser(input: $input) {
//       _id
//       name
//     }
//   }
// `;

// export const PlayerSelect = forwardRef<
//   { handleAddPlayer: () => Promise<string | null> },
//   PlayerSelectProps
// >(({ players: initialPlayers, selectedPlayers, onSelectPlayer, refetchUsers }, ref) => {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [players, setPlayers] = useState<Player[]>(initialPlayers);

//   const [createUser] = useMutation(CREATE_USER, {
//     onCompleted: (data) => {
//       const newUser = data.createUser;
//       setPlayers((prev) => [...prev, newUser]); 
//       onSelectPlayer(newUser._id); 
//       setSearchQuery("");
//       refetchUsers(); 
//     },
//     onError: (error) => {
//       console.error("Error creating user:", error);
//     },
//   });

//   const selectedPlayerNames =
//     selectedPlayers
//       .map((id) => players.find((p) => p._id === id)?.name)
//       .filter(Boolean)
//       .join(", ") || "Search Players...";

//   const filteredPlayers = players.filter((player) =>
//     player.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setSearchQuery(value);
//   };

//   const handleAddPlayer = async (): Promise<string | null> => {
//     const newPlayerName = searchQuery.trim();
//     if (!newPlayerName) {
//       return null; 
//     }

//     const existingPlayer = players.find(
//       (player) => player.name.toLowerCase() === newPlayerName.toLowerCase()
//     );

//     if (existingPlayer) {
//       onSelectPlayer(existingPlayer._id); 
//       return existingPlayer._id; 
//     } else {
//       try {
//         const response = await createUser({
//           variables: {
//             input: {
//               name: newPlayerName,
//               role: "user",
//             },
//           },
//         });
//         return response.data.createUser._id;
//       } catch (error) {
//         console.error("Failed to create user:", error);
//         return null; // Return null if the mutation fails
//       }
//     }
//   };

//   useImperativeHandle(ref, () => ({
//     handleAddPlayer: () => handleAddPlayer(), 
//   }));

//   const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const playerId = await handleAddPlayer();
//       if (playerId) {
//         setSearchQuery("");
//       }
//     }
//   };

//   const handleClearInput = () => {
//     setSearchQuery("");
//   };

//   return (
//     <Select>
//       <SelectTrigger className="truncate">
//         <div className="truncate">
//           {selectedPlayers.length
//             ? selectedPlayers.map((id) => players.find((p) => p._id === id)?.name).join(", ")
//             : "Available Players"}
//         </div>
//       </SelectTrigger>
//       <SelectContent className="z-50 bg-white shadow-lg rounded-md p-2 max-h-60 overflow-y-auto">
//         <div className="p-2">
//           <Input
//             placeholder={selectedPlayerNames}
//             value={searchQuery}
//             onChange={handleInputChange}
//             onKeyDown={handleKeyDown} 
//             className="pr-10"
//           />
//           {searchQuery && (
//             <button
//               onClick={handleClearInput}
//               className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 bg-white px-1"
//             >
//               <X size={16} />
//             </button>
//           )}
//         </div>

//         {filteredPlayers.map((player) => (
//           <div key={player._id} className="flex items-center gap-2 p-2 hover:bg-gray-100">
//             <Checkbox
//               id={player._id}
//               checked={selectedPlayers.includes(player._id)}
//               onCheckedChange={() => onSelectPlayer(player._id)}
//             />
//             <label htmlFor={player._id} className="text-sm">
//               {player.name}
//             </label>
//           </div>
//         ))}
//       </SelectContent>
//     </Select>
//   );
// });

// PlayerSelect.displayName = "PlayerSelect";

import { Select, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, forwardRef, useEffect, useImperativeHandle  } from "react";
import { Input } from "../ui/input";
import { X } from "lucide-react";
import { useMutation, gql } from "@apollo/client";

interface Player {
  _id: string;
  name: string;
  role?: string;
}

interface PlayerSelectProps {
  players: Player[];
  selectedPlayers: string[];
  onSelectPlayer: (playerId: string) => void;
  refetchUsers: () => void;
}

const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      _id
      name
    }
  }
`;

export const PlayerSelect = forwardRef<
  { handleAddPlayer: () => Promise<string | null> },
  PlayerSelectProps
>(({ players: initialPlayers, selectedPlayers, onSelectPlayer, refetchUsers }, ref) => {
  useImperativeHandle(ref, () => ({
    handleAddPlayer: () => handleAddPlayer(),
  }))
  const [searchQuery, setSearchQuery] = useState("");
  const [players, setPlayers] = useState<Player[]>(initialPlayers);

  // Update players state when initialPlayers prop changes
  useEffect(() => {
    setPlayers(initialPlayers);
  }, [initialPlayers]);

  const [createUser] = useMutation(CREATE_USER, {
    onCompleted: (data) => {
      const newUser = data.createUser;
      setPlayers((prev) => [...prev, newUser]);
      onSelectPlayer(newUser._id);
      setSearchQuery("");
      refetchUsers();
    },
    onError: (error) => {
      console.error("Error creating user:", error);
    },
  });

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleAddPlayer = async (): Promise<string | null> => {
    const newPlayerName = searchQuery.trim();
    if (!newPlayerName) {
      return null;
    }

    const existingPlayer = players.find(
      (player) => player.name.toLowerCase() === newPlayerName.toLowerCase()
    );

    if (existingPlayer) {
      onSelectPlayer(existingPlayer._id);
      return existingPlayer._id;
    } else {
      try {
        const response = await createUser({
          variables: {
            input: {
              name: newPlayerName,
              role: "user",
            },
          },
        });
        return response.data.createUser._id;
      } catch (error) {
        console.error("Failed to create user:", error);
        return null;
      }
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const playerId = await handleAddPlayer();
      if (playerId) {
        setSearchQuery("");
      }
    }
  };

  const handleClearInput = () => {
    setSearchQuery("");
  };

  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select players">
          {selectedPlayers.length
            ? selectedPlayers
                .map((id) => players.find((p) => p._id === id)?.name)
                .join(", ")
            : "Select players"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="p-2">
        <div className="relative">
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="pr-10"
          />
          {searchQuery && (
            <button
              onClick={handleClearInput}
              className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="mt-2 max-h-60 overflow-y-auto">
          {filteredPlayers.map((player) => (
            <div key={player._id} className="flex items-center gap-2 p-2 hover:bg-gray-100">
              <Checkbox
                id={player._id}
                checked={selectedPlayers.includes(player._id)}
                onCheckedChange={() => onSelectPlayer(player._id)}
              />
              <label htmlFor={player._id} className="text-sm">
                {player.name}
              </label>
            </div>
          ))}
        </div>
      </SelectContent>
    </Select>
  );
});

PlayerSelect.displayName = "PlayerSelect";