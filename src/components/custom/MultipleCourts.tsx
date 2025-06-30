import { Badge } from "../ui/badge"

export const CourtMultiSelect = ({ 
    courts, 
    selectedCourts, 
    onSelectCourt 
  }: {
    courts: any[],
    selectedCourts: string[],
    onSelectCourt: (courtId: string) => void
  }) => {
    return (
      <div className="space-y-2">
        <label className="block text-lg font-semibold">Select Courts:</label>
        <div className="flex flex-wrap gap-2">
          {courts?.map((court) => (
            <div
              key={court._id}
              onClick={() => onSelectCourt(court._id)}
              className={`px-4 py-1 rounded-full border cursor-pointer ${
                selectedCourts.includes(court._id)
                  ? 'bg-green-700 text-white'
                  : 'bg-white text-gray-800 border-gray-300'
              }`}
            >
              {court.name}
            </div>
          ))}
        </div>
        
             {/* divider*/}
             {/* <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                    </div> */}
        {/* {selectedCourts.length > 0 && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mt-3">Selected courts:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedCourts.map(courtId => {
                const court = courts.find(c => c._id === courtId);
                return court ? (
                  <Badge key={court._id} className="bg-green-100 text-green-800">
                    {court.name}
                  </Badge>
                ) : null;
              })}
            </div> */}
          
            
        {/* )} */}
      </div>
      
    );
  };

