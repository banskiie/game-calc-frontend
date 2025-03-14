import { useState, useRef, useEffect } from "react"; // Add useRef and useEffect
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export interface Sponsor {
  _id: string;
  name: string;
}

interface SponsorSelectProps {
  sponsors: Sponsor[];
  selectedSponsors: string[];
  setSelectedSponsors: (sponsors: string[]) => void;
  onSelectSponsor: (sponsorId: string) => void;
  onCreateSponsor?: (name: string) => Promise<string | null>;
}

export const SponsorSelect = ({
  sponsors,
  selectedSponsors,
  setSelectedSponsors,
  onSelectSponsor,
  onCreateSponsor,
}: SponsorSelectProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref for the dropdown container

  const handleClearInput = () => {
    setSearchQuery("");
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsInputFocused(false);
    }, 200);
  };

  const handleCreateNewSponsor = async () => {
    if (onCreateSponsor && searchQuery.trim()) {
      const newSponsorId = await onCreateSponsor(searchQuery.trim());
      if (newSponsorId) {
        console.log("New sponsor ID:", newSponsorId);
        setSelectedSponsors([...selectedSponsors, newSponsorId]);
        setSearchQuery("");
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsInputFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredSponsors = sponsors.filter((sponsor) =>
    sponsor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Input
          placeholder={
            selectedSponsors
              .map((id) => {
                const sponsor = sponsors.find((p) => p._id === id);
                return sponsor?.name;
              })
              .filter(Boolean)
              .join(", ") || "Search Sponsors..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsInputFocused(true)}
          onBlur={handleInputBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleCreateNewSponsor()
            }
          }}
          className="pr-10"
        />
        {(searchQuery || selectedSponsors.length > 0) && (
          <button
            onClick={handleClearInput}
            className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 bg-white px-1"
          >
            <X size={16} />
          </button>
        )}
      </div>
      {(isInputFocused || searchQuery) && (
        <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg">
          {filteredSponsors.map((sponsor) => (
            <div
              key={sponsor._id}
              className="flex items-center gap-2 p-2 hover:bg-gray-100"
            >
              <Checkbox
                id={sponsor._id}
                checked={selectedSponsors.includes(sponsor._id)}
                onCheckedChange={() => onSelectSponsor(sponsor._id)}
              />
              <label htmlFor={sponsor._id} className="text-sm">
                {sponsor.name}
              </label>
            </div>
          ))}
          {searchQuery &&
            !filteredSponsors.some(
              (sponsor) =>
                sponsor.name.toLowerCase() === searchQuery.toLowerCase()
            ) && (
              <div
                className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                onClick={handleCreateNewSponsor}
              >
                <span className="text-sm text-blue-600">
                + Create &quot;{searchQuery}&quot;
                </span>
              </div>
            )}
        </div>
      )}
    </div>
  );
};