import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Checkbox } from "@/components/ui/checkbox";
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
  onCreatePlayer?: (name: string) => Promise<string | null>;
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
>(({ players: initialPlayers, selectedPlayers, onSelectPlayer, refetchUsers, onCreatePlayer }, ref) => {
  useImperativeHandle(ref, () => ({
    handleAddPlayer: () => handleAddPlayer(),
  }));

  const [searchQuery, setSearchQuery] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlayers(initialPlayers);
  }, [initialPlayers]);

  const [players, setPlayers] = useState<Player[]>(initialPlayers);
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
    setSearchQuery(e.target.value);
  };

  const handleAddPlayer = async (): Promise<string | null> => {
    const newPlayerName = searchQuery.trim();
    if (!newPlayerName) return null;

    const existingPlayer = players.find(
      (player) => player.name.toLowerCase() === newPlayerName.toLowerCase()
    );

    if (existingPlayer) {
      onSelectPlayer(existingPlayer._id);
      return existingPlayer._id;
    } else {
      try {
        if (onCreatePlayer) {
          const newPlayerId = await onCreatePlayer(newPlayerName);
          return newPlayerId;
        } else {
          const response = await createUser({
            variables: { input: { name: newPlayerName, role: "user" } },
          });
          return response.data.createUser._id;
        }
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
      if (playerId) setSearchQuery("");
    }
  };

  const handleClearInput = () => {
    setSearchQuery("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsInputFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          placeholder={
            selectedPlayers
              .map((id) => players.find((p) => p._id === id)?.name)
              .filter(Boolean)
              .join(", ") || "Search Players..."
          }
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsInputFocused(true)}
          onKeyDown={handleKeyDown}
          className="pr-10"
        />
        {searchQuery && (
          <button onClick={handleClearInput} className="absolute right-3 top-3 text-gray-500 hover:text-gray-700">
            <X size={16} />
          </button>
        )}
      </div>

      {(isInputFocused || searchQuery) && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg">
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
          {searchQuery && !filteredPlayers.some((player) => player.name.toLowerCase() === searchQuery.toLowerCase()) && (
            <div className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer" onClick={handleAddPlayer}>
              <span className="text-sm text-blue-600">+ Create &quot;{searchQuery}&quot;</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

PlayerSelect.displayName = "PlayerSelect";
