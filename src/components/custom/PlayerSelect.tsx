import { Select, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"
import { Input } from "../ui/input"
import { X } from "lucide-react"

interface Player {
  _id: string
  name: string
}

interface PlayerSelectProps {
  players: Player[]
  selectedPlayers: string[]
  onSelectPlayer: (playerId: string) => void
}

export const PlayerSelect: React.FC<PlayerSelectProps> = ({ players, selectedPlayers, onSelectPlayer }) => {
  // const selectedPlayerNames = players
  //   .filter((player) => selectedPlayers.includes(player._id))
  //   .map((player) => player.name)
  //   .join(", ")
  const [searchQuery, selectSearchQuery] = useState("")

  const selectedPlayerNames = selectedPlayers
  .map(id => players.find(p => p._id === id)?.name)
  .filter(Boolean)
  .join(", ") || "Search Players..."

  const filteredPlayers = players.filter((player) => 
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Select>
      <SelectTrigger className="truncate">
      <div className="truncate">{selectedPlayers.length ? selectedPlayers.map(id => players.find(p => p._id === id)?.name).join(", ") : "Available Players"}</div>
      </SelectTrigger>
      <SelectContent>

      <div className="p2">
        <Input
          placeholder= {selectedPlayerNames}
          value={searchQuery}
          onChange={(e) => selectSearchQuery(e.target.value)}
              />

        {searchQuery &&(
          <button 
            onClick={() => selectSearchQuery("")}
            className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 bg-white px-1"
          >
            <X size={16} />
          </button>
        )}
      </div>

        {filteredPlayers.map((player) => (
          <div key={player._id} className="flex items-center gap-2 p-2">
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
      </SelectContent>
    </Select>
  )
}

export default PlayerSelect