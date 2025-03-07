import { useState } from "react"
import { Checkbox } from "../ui/checkbox"
import { Select, SelectContent, SelectTrigger } from "../ui/select"
import { Input } from "../ui/input"
import { X } from "lucide-react"

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
    const [searchQuery, setSearchQuery] = useState("")
    
    const selectedSponsorNames = selectSponsors
    .map(id => sponsors.find(p => p._id === id)?.name)
    .filter(Boolean)
    .join(", ") || "Search Sponsors..."

    const filteredsponsors = sponsors.filter((player) =>
        player.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
      <Select>
        <SelectTrigger className="truncate">
          <div className="truncate">
            {selectSponsors.length
              ? selectSponsors
                  .map((id) => sponsors.find((p) => p._id === id)?.name)
                  .join(", ")
              : "Select Sponsor"} 
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
          {filteredsponsors.map((player) => (
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