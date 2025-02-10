import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


interface BetSummaryModalProps {
  sessionId: string;
  betTypes: string[];
  games: { _id: string; court: { name: string }; start: string }[];
}

const BetSummaryModal = ({ sessionId, betTypes, games }: BetSummaryModalProps) => {
  const [selectedBetType, setSelectedBetType] = useState("");
  const [selectedGame, setSelectedGame] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
        >
          View Bet Summary
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bet Summary</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bet Type</label>
            <Select onValueChange={setSelectedBetType} value={selectedBetType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a bet type" />
              </SelectTrigger>
              <SelectContent>
                {betTypes.map((betType) => (
                  <SelectItem key={betType} value={betType}>
                    {betType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BetSummaryModal;