// import { Badge } from "../ui/badge"

export const ShuttleSingleSelect = ({ 
    shuttles, 
    selectedShuttle, 
    onSelectShuttle 
  }: {
    shuttles: any[],
    selectedShuttle: string | null,
    onSelectShuttle: (shuttleId: string) => void
  }) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Select Shuttle</label>
        <div className="flex flex-wrap gap-2">
          {shuttles?.map((shuttle) => (
            <div
              key={shuttle._id}
              onClick={() => onSelectShuttle(shuttle._id)}
              className={`px-4 py-1 rounded-full border cursor-pointer transition-colors ${
                selectedShuttle === shuttle._id
                  ? 'bg-green-700 text-white'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {shuttle.name}
            </div>
          ))}
        </div>
         
        {/* {selectedShuttle && (
          <div className="mt-2">
            <p className="text-sm text-gray-500 mt-3">Selected shuttle:</p>
            <div className="flex flex-wrap gap-1 mt-1">
              <Badge className="bg-green-100 text-green-800">
                {shuttles.find(s => s._id === selectedShuttle)?.name || 'Unknown'}
              </Badge>
            </div> */}
             {/* divider*/}
             {/* <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
            </div> */}
          </div>
        // )}
    //   </div>
    );
  };