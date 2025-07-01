// import {
//     useState,
//     useRef,
//     useEffect,
//     forwardRef,
//     useImperativeHandle,
// } from 'react'
// import { Checkbox } from '@/components/ui/checkbox'
// import { Input } from '../ui/input'
// import { X } from 'lucide-react'
// import { useMutation, gql } from '@apollo/client'

// interface Player {
//     _id: string
//     name: string
//     role?: string
// }

// interface PlayerSelectProps {
//     players: Player[]
//     selectedPlayers: string[]
//     tempSelectedPlayers?: string[]
//     onSelectPlayer: (playerId: string) => void
//     onToggleTempSelection?: (playerId: string) => void
//     onRemovePlayer?: (playerId: string) => void
//     refetchUsers: () => void
//     onCreatePlayer?: (name: string) => Promise<string | null>
// }

// const CREATE_USER = gql`
//     mutation CreateUser($input: UserInput!) {
//         createUser(input: $input) {
//             _id
//             name
//         }
//     }
// `

// export const PlayerSelect = forwardRef<
//     { handleAddPlayer: () => Promise<string | null> },
//     PlayerSelectProps
// >(
//     (
//         {
//             players: initialPlayers,
//             selectedPlayers,
//             tempSelectedPlayers = [],
//             onSelectPlayer,
//             onToggleTempSelection,
//             onRemovePlayer,
//             refetchUsers,
//             onCreatePlayer,
//         },
//         ref
//     ) => {
//         useImperativeHandle(ref, () => ({
//             handleAddPlayer: () => handleAddPlayer(),
//         }))

//         const [searchQuery, setSearchQuery] = useState('')
//         const [players, setPlayers] = useState<Player[]>(initialPlayers)
//         const [newPlayerName, setNewPlayerName] = useState('')

//         useEffect(() => {
//             setPlayers(initialPlayers)
//         }, [initialPlayers])

//         const [createUser] = useMutation(CREATE_USER, {
//             onCompleted: (data) => {
//                 const newUser = data.createUser
//                 setPlayers((prev) => [...prev, newUser])
//                 onSelectPlayer(newUser._id)
//                 refetchUsers()
//                 setNewPlayerName('')
//             },
//             onError: (error) => {
//                 console.error('Error creating user:', error)
//             },
//         })

//         const filteredPlayers = players.filter((player) =>
//             player.name.toLowerCase().includes(searchQuery.toLowerCase())
//         )

//         const handleAddPlayer = async (): Promise<string | null> => {
//             const nameToAdd = newPlayerName.trim()
//             if (!nameToAdd) return null

//             const existingPlayer = players.find(
//                 (player) => player.name.toLowerCase() === nameToAdd.toLowerCase()
//             )

//             if (existingPlayer) {
//                 onSelectPlayer(existingPlayer._id)
//                 if (onToggleTempSelection) {
//                     onToggleTempSelection(existingPlayer._id)
//                 }
//                 return existingPlayer._id
//             } else {
//                 try {
//                     if (onCreatePlayer) {
//                         const newPlayerId = await onCreatePlayer(nameToAdd)
//                         if (newPlayerId && onToggleTempSelection) {
//                             onToggleTempSelection(newPlayerId)
//                         }
//                         return newPlayerId
//                     } else {
//                         const response = await createUser({
//                             variables: {
//                                 input: { name: nameToAdd, role: 'user' },
//                             },
//                         })
//                         return response.data.createUser._id
//                     }
//                 } catch (error) {
//                     console.error('Failed to create user:', error)
//                     return null
//                 }
//             }
//         }

//         const handlePlayerToggle = (playerId: string) => {
//             if (selectedPlayers.includes(playerId)) {
//                 // If player is in selectedPlayers (permanent selection), remove them
//                 if (onRemovePlayer) {
//                     onRemovePlayer(playerId)
//                 }
//             } else if (tempSelectedPlayers?.includes(playerId)) {
//                 // If player is in tempSelectedPlayers, toggle them
//                 if (onToggleTempSelection) {
//                     onToggleTempSelection(playerId)
//                 }
//             } else {
//                 // If player is not selected at all, add them
//                 if (onToggleTempSelection) {
//                     onToggleTempSelection(playerId)
//                 } else {
//                     onSelectPlayer(playerId)
//                 }
//             }
//         }

//         const isSelected = (playerId: string) => {
//             return selectedPlayers.includes(playerId) ||
//                 tempSelectedPlayers?.includes(playerId)
//         }

//         return (
//             <div className="space-y-4">
//                 {/* Search filter (optional) */}
//                 <div className="relative">
//                     <Input
//                         placeholder="Filter players..."
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         className="pr-10 mb-4"
//                     />
//                     {searchQuery && (
//                         <button
//                             onClick={() => setSearchQuery('')}
//                             className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
//                         >
//                             <X size={18} />
//                         </button>
//                     )}
//                 </div>

//                 {/* Players List */}
//                 <div className="max-h-64 overflow-y-auto border rounded-md p-2">
//                     {filteredPlayers.length > 0 ? (
//                         filteredPlayers.map((player) => (
//                             <div
//                                 key={player._id}
//                                 className={`flex items-center gap-3 p-2 hover:bg-green-50 cursor-pointer rounded ${isSelected(player._id) ? 'bg-green-50' : ''
//                                     }`}
//                                 onClick={() => handlePlayerToggle(player._id)}
//                             >
//                                 <Checkbox
//                                     id={player._id}
//                                     checked={isSelected(player._id)}
//                                     onCheckedChange={() => handlePlayerToggle(player._id)}
//                                     className="text-green-500 border-green-300"
//                                 />
//                                 <label
//                                     htmlFor={player._id}
//                                     className="text-sm flex-1 cursor-pointer py-1.5"
//                                 >
//                                     {player.name}
//                                 </label>
//                             </div>
//                         ))
//                     ) : (
//                         <div className="p-3 text-center text-sm text-gray-500">
//                             No players found
//                         </div>
//                     )}
//                 </div>

//                 {/* Add New Player */}
//                 <div className="flex gap-2 mt-4">
//                     <Input
//                         placeholder="Add new player..."
//                         value={newPlayerName}
//                         onChange={(e) => setNewPlayerName(e.target.value)}
//                         onKeyDown={(e) => {
//                             if (e.key === 'Enter') {
//                                 handleAddPlayer()
//                             }
//                         }}
//                     />
//                     <button
//                         onClick={handleAddPlayer}
//                         disabled={!newPlayerName.trim()}
//                         className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
//                     >
//                         Add
//                     </button>
//                 </div>

//                 {/* Selected Players */}
//                 {(selectedPlayers.length > 0 ||
//                     (tempSelectedPlayers?.length || 0) > 0) && (
//                         <div className="mt-4">
//                             <p className="text-sm text-gray-500 mb-2">
//                                 Selected player(s):
//                             </p>
//                             <div className="flex flex-wrap gap-2">
//                                 {Array.from(
//                                     new Set([
//                                         ...selectedPlayers,
//                                         ...(tempSelectedPlayers || []),
//                                     ])
//                                 ).map((playerId) => {
//                                     const player = players.find(
//                                         (p) => p._id === playerId
//                                     )
//                                     return player ? (
//                                         <div
//                                             key={playerId}
//                                             className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
//                                         >
//                                             <span>{player.name}</span>
//                                             <button
//                                                 onClick={() =>
//                                                     handlePlayerToggle(playerId)
//                                                 }
//                                                 className="text-green-600 hover:text-green-700"
//                                             >
//                                                 <X size={14} />
//                                             </button>
//                                         </div>
//                                     ) : null
//                                 })}
//                             </div>
//                         </div>
//                     )}
//             </div>
//         )
//     }
// )

// PlayerSelect.displayName = 'PlayerSelect'

import {
  useState,
  // useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "../ui/input";
import { X } from "lucide-react";
import { useMutation, gql } from "@apollo/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Player {
  _id: string;
  name: string;
  role?: string;
}

interface PlayerSelectProps {
  players: Player[];
  selectedPlayers: string[];
  tempSelectedPlayers?: string[];
  onSelectPlayer: (playerId: string) => void;
  onToggleTempSelection?: (playerId: string) => void;
  onRemovePlayer?: (playerId: string) => void;
  refetchUsers: () => void;
  onCreatePlayer?: (name: string) => Promise<string | null>;
  defaultActiveTab?: "players" | "selected";
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
>(
  (
    {
      players: initialPlayers,
      selectedPlayers,
      tempSelectedPlayers = [],
      onSelectPlayer,
      onToggleTempSelection,
      onRemovePlayer,
      refetchUsers,
      onCreatePlayer,
      defaultActiveTab = "players",
    },
    ref
  ) => {
    useImperativeHandle(ref, () => ({
      handleAddPlayer: () => handleAddPlayer(),
    }));

    const [searchQuery, setSearchQuery] = useState("");
    const [players, setPlayers] = useState<Player[]>(initialPlayers);
    const [newPlayerName, setNewPlayerName] = useState("");

    useEffect(() => {
      setPlayers(initialPlayers);
    }, [initialPlayers]);

    const [createUser] = useMutation(CREATE_USER, {
      onCompleted: (data) => {
        const newUser = data.createUser;
        setPlayers((prev) => [...prev, newUser]);
        onSelectPlayer(newUser._id);
        refetchUsers();
        setNewPlayerName("");
      },
      onError: (error) => {
        console.error("Error creating user:", error);
      },
    });

    const sortedPlayers = useMemo(() => {
      return [...initialPlayers].sort((a, b) => a.name.localeCompare(b.name));
    }, [initialPlayers]);

    useEffect(() => {
      setPlayers(sortedPlayers);
    }, [sortedPlayers]);
    // Get all selected player IDs (both permanent and temporary)
    const allSelectedPlayerIds = useMemo(
      () => Array.from(new Set([...selectedPlayers, ...tempSelectedPlayers])),
      [selectedPlayers, tempSelectedPlayers]
    );
    // Filter out selected players and apply search filter
    const filteredPlayers = useMemo(
      () =>
        players.filter(
          (player) =>
            !allSelectedPlayerIds.includes(player._id) &&
            player.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      [players, allSelectedPlayerIds, searchQuery]
    );

    // Split into columns with max 10 players per column
    // const columnCount = 3;
    // const maxPlayersPerColumn = 10;
    // const playerColumns = Array.from({ length: columnCount }, (_, i) =>
    //   filteredPlayers.slice(
    //     i * maxPlayersPerColumn,
    //     (i + 1) * maxPlayersPerColumn
    //   )
    // );

    const handleAddPlayer = useCallback(async (): Promise<string | null> => {
      const nameToAdd = newPlayerName.trim();
      if (!nameToAdd) return null;

      const existingPlayer = players.find(
        (p) => p.name.toLowerCase() === nameToAdd.toLowerCase()
      );

      if (existingPlayer) {
        onSelectPlayer(existingPlayer._id);
        onToggleTempSelection?.(existingPlayer._id);
        return existingPlayer._id;
      }

      try {
        if (onCreatePlayer) {
          const newPlayerId = await onCreatePlayer(nameToAdd);
          if (newPlayerId) onToggleTempSelection?.(newPlayerId);
          return newPlayerId;
        } else {
          const response = await createUser({
            variables: { input: { name: nameToAdd, role: "user" } },
            onCompleted: (data) => {
              const newUser = data.createUser;
              setPlayers((prev) => [...prev, newUser]);
              onSelectPlayer(newUser._id);
              refetchUsers();
              setNewPlayerName("");
            },
            onError: (error) => {
              console.error("Error creating user:", error);
            },
          });
          return response.data?.createUser._id;
        }
      } catch (error) {
        console.error("Failed to create user:", error);
        return null;
      }
    }, [
      newPlayerName,
      players,
      onCreatePlayer,
      createUser,
      onSelectPlayer,
      onToggleTempSelection,
      refetchUsers,
    ]);

    useImperativeHandle(ref, () => ({
      handleAddPlayer,
    }));

    // Combined handlers for better performance
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleAddPlayer();
      },
      [handleAddPlayer]
    );

    const handleClearSearch = useCallback(() => setSearchQuery(""), []);
    // const handlePlayerToggle = useCallback(
    //   (playerId: string) => {
    //     if (selectedPlayers.includes(playerId)) {
    //       onRemovePlayer?.(playerId);
    //     } else if (tempSelectedPlayers?.includes(playerId)) {
    //       onToggleTempSelection?.(playerId);
    //     } else {
    //       onToggleTempSelection
    //         ? onToggleTempSelection(playerId)
    //         : onSelectPlayer(playerId);
    //     }
    //   },
    //   [
    //     selectedPlayers,
    //     tempSelectedPlayers,
    //     onRemovePlayer,
    //     onToggleTempSelection,
    //     onSelectPlayer,
    //   ]
    // );
const handlePlayerToggle = useCallback(
      (playerId: string) => {
        if (selectedPlayers.includes(playerId)) {
          onRemovePlayer?.(playerId);
        } else if (tempSelectedPlayers?.includes(playerId)) {
          onToggleTempSelection?.(playerId);
        } else {
          if (onToggleTempSelection) {
            onToggleTempSelection(playerId);
          } else {
            onSelectPlayer(playerId);
          }
        }
      },
      [
        selectedPlayers,
        tempSelectedPlayers,
        onRemovePlayer,
        onToggleTempSelection,
        onSelectPlayer,
      ]
    );
    return (
      <div className="space-y-4">
        <h2 className="text-base font-semibold">Session Settings</h2>

        {/* Search filter (positioned outside tabs to maintain consistency) */}
        {/* Search and Add Player Section */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add new player..."
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleAddPlayer}
              disabled={!newPlayerName.trim()}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Add
            </button>
          </div>

          <div className="relative">
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <Tabs defaultValue={defaultActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="players" className="text-base">Players</TabsTrigger>
            <TabsTrigger value="selected" className="text-base">
              Selected Players ({allSelectedPlayerIds.length})
            </TabsTrigger>
          </TabsList>

          {/* Container with fixed height for both tabs */}
          <div className="border rounded-md p-4 h-[270px] overflow-y-auto">
            <TabsContent value="players" className="mt-0">
              {/* Players Tab Content */}
              {filteredPlayers.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2">
                  {filteredPlayers.map((player) => (
                    <div
                      key={player._id}
                      className="flex items-center gap-2 p-2 hover:bg-green-50 cursor-pointer rounded text-md bg-green-50 hover:bg-green-100 cursor-pointer"
                      onClick={() => handlePlayerToggle(player._id)}
                    >
                      <Checkbox
                        id={player._id}
                        checked={allSelectedPlayerIds.includes(player._id)}
                        className="text-green-500 border-green-300 h-7 w-7"
                      />
                      <label
                        htmlFor={player._id}
                        className="text-base cursor-pointer font-medium text-gray-800"
                      >
                        {player.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-sm text-gray-500 h-full flex items-center justify-center">
                  {searchQuery
                    ? "No matching players found"
                    : "No players available"}
                </div>
              )}
            </TabsContent>

            <TabsContent value="selected" className="mt-0">
              {/* Selected Players Tab Content */}
              {allSelectedPlayerIds.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2">
                  {allSelectedPlayerIds.map((playerId) => {
                    const player = players.find((p) => p._id === playerId);
                    return player ? (
                      <div
                        key={playerId}
                        className="flex items-center gap-2 p-2 bg-green-50 hover:bg-green-100 cursor-pointer rounded text-md"
                        onClick={() => handlePlayerToggle(playerId)}
                      >
                        <Checkbox
                          id={`selected-${playerId}`}
                          checked={true}
                          className="text-green-500 border-green-300 h-7 w-7"
                        />
                        <label
                          htmlFor={`selected-${playerId}`}
                          className="text-base cursor-pointer font-medium text-gray-800"
                        >
                          {player.name}
                        </label>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="p-3 text-center text-sm text-gray-500 h-full flex items-center justify-center">
                  No players selected
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

      </div>
    );
  }
);

PlayerSelect.displayName = "PlayerSelect";
