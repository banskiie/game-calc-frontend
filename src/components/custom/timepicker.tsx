import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface TimePickerProps {
  initialTime?: string
}

const TimePicker: React.FC<TimePickerProps> = ({ initialTime = "12:00 AM" }) => {
  const [hour, setHour] = useState<number>(parseInt(initialTime.split(":")[0]))
  const [minute, setMinute] = useState<number>(
    parseInt(initialTime.split(":")[1].split(" ")[0])
  )
  const [ampm, setAmpm] = useState<string>(initialTime.split(" ")[1])
  const [isAmPmOpen, setIsAmPmOpen] = useState<boolean>(false)

  const ampmRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ampmRef.current) {
      const selectedElement = ampmRef.current.querySelector(".selected")
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "center", behavior: "smooth" })
      }
    }
  }, [isAmPmOpen])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center gap-2 border border-gray-300 rounded px-4 py-2 text-lg">
        <div className="relative w-16 h-10 overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none before:absolute before:top-0 before:left-0 before:w-full before:h-6 before:bg-gradient-to-b before:from-white before:via-white/50 before:to-transparent after:absolute after:bottom-0 after:left-0 after:w-full after:h-6 after:bg-gradient-to-t after:from-white after:via-white/50 after:to-transparent"></div>
          <div className="overflow-y-scroll h-10 snap-y snap-mandatory scrollbar-hide">
            {[...Array(12).keys()].map((h) => (
              <div
                key={h}
                className={`p-1 snap-center ${
                  h + 1 === hour ? "text-blue-500 font-bold" : "text-gray-700"
                }`}
                onClick={() => setHour(h + 1)}
              >
                {(h + 1).toString().padStart(2, "0")}
              </div>
            ))}
          </div>
        </div>

        <span>:</span>

        <div className="relative w-16 h-10 overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none before:absolute before:top-0 before:left-0 before:w-full before:h-6 before:bg-gradient-to-b before:from-white before:via-white/50 before:to-transparent after:absolute after:bottom-0 after:left-0 after:w-full after:h-6 after:bg-gradient-to-t after:from-white after:via-white/50 after:to-transparent"></div>
          <div className="overflow-y-scroll h-10 snap-y snap-mandatory scrollbar-hide">
            {[...Array(60).keys()].map((m) => (
              <div
                key={m}
                className={`p-1 snap-center ${
                  m === minute ? "text-blue-500 font-bold" : "text-gray-700"
                }`}
                onClick={() => setMinute(m)}
              >
                {m.toString().padStart(2, "0")}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setIsAmPmOpen(!isAmPmOpen)}
          >
            {ampm}
            <ChevronDown className="ml-1 w-5 h-5 text-gray-500" />
          </div>
          {isAmPmOpen && (
            <div ref={ampmRef} className="absolute mt-1 w-16 bg-white border rounded shadow-lg z-10">
              {["AM", "PM"].map((period) => (
                <div
                  key={period}
                  className={`p-2 text-center cursor-pointer ${
                    period === ampm ? "bg-blue-500 text-white selected" : "hover:bg-gray-200"
                  }`}
                  onClick={() => {
                    setAmpm(period)
                    setIsAmPmOpen(false)
                  }}
                >
                  {period}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex mr-16 items-center gap-14 text-sm text-gray-500">
        <span>Hour</span>
        <span>Min</span>
      </div>
    </div>
  )
}

export default TimePicker



// import { useState, useRef, useEffect } from "react";
// import { ChevronDown } from "lucide-react";

// interface TimePickerProps {
//   initialTime?: string | null; // Allow initialTime to be null
//   onChange?: (time: string) => void; // Add onChange prop
// }

// const TimePicker: React.FC<TimePickerProps> = ({
//   initialTime = "12:00 AM", // Default value if initialTime is null or undefined
//   onChange,
// }) => {
//   const [time, setTime] = useState<string>(initialTime || "12:00 AM"); // Fallback to "12:00 AM" if initialTime is null
//   const [isAmPmOpen, setIsAmPmOpen] = useState<boolean>(false);
//   const ampmRef = useRef<HTMLDivElement>(null);

//   // Parse the initial time into hours, minutes, and AM/PM
//   const [hour, minute] = time.split(":");
//   const [minuteValue, ampm] = minute.split(" ");

//   // Convert 12-hour time to 24-hour format for the native input
//   const convertTo24HourFormat = (time12h: string): string => {
//     const [time, period] = time12h.split(" ");
//     let [hours, minutes] = time.split(":");
//     if (period === "PM" && hours !== "12") {
//       hours = String(Number(hours) + 12);
//     } else if (period === "AM" && hours === "12") {
//       hours = "00";
//     }
//     return `${hours}:${minutes}`;
//   };

//   // Convert 24-hour time to 12-hour format for the custom dropdown
//   const convertTo12HourFormat = (time24h: string): string => {
//     let [hours, minutes] = time24h.split(":");
//     const period = Number(hours) >= 12 ? "PM" : "AM";
//     hours = String(Number(hours) % 12 || 12); // Convert 0 to 12 for AM
//     return `${hours}:${minutes} ${period}`;
//   };

//   // Handle time change from the native input
//   const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const newTime24h = e.target.value; // Format: "HH:MM"
//     const newTime12h = convertTo12HourFormat(newTime24h); // Convert to 12-hour format
//     setTime(newTime12h);
//     if (onChange) onChange(newTime12h); // Trigger onChange callback
//   };

//   // Handle AM/PM change from the custom dropdown
//   const handleAmPmChange = (period: string) => {
//     const [hour, minute] = time.split(":");
//     const newTime12h = `${hour}:${minute.split(" ")[0]} ${period}`;
//     setTime(newTime12h);
//     if (onChange) onChange(newTime12h); // Trigger onChange callback
//     setIsAmPmOpen(false);
//   };

//   // Close AM/PM dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (ampmRef.current && !ampmRef.current.contains(e.target as Node)) {
//         setIsAmPmOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="flex flex-col items-center gap-2">
//       <div className="relative flex items-center gap-2 border border-gray-300 rounded px-4 py-2 text-lg">
//         {/* Native Time Input */}
//         <input
//           type="time"
//           value={convertTo24HourFormat(time)} // Convert to 24-hour format for the input
//           onChange={handleTimeChange}
//           className="text-sm w-full border-none outline-none bg-transparent"
//         />

//         {/* AM/PM Selector */}
//         <div className="relative">
//           <div
//             className="flex items-center cursor-pointer"
//             onClick={() => setIsAmPmOpen(!isAmPmOpen)}
//           >
//             {ampm}
//             <ChevronDown className="ml-1 w-5 h-5 text-gray-500" />
//           </div>
//           {isAmPmOpen && (
//             <div
//               ref={ampmRef}
//               className="absolute mt-1 w-16 bg-white border rounded shadow-lg z-10"
//             >
//               {["AM", "PM"].map((period) => (
//                 <div
//                   key={period}
//                   className={`p-2 text-center cursor-pointer ${
//                     period === ampm
//                       ? "bg-blue-500 text-white selected"
//                       : "hover:bg-gray-200"
//                   }`}
//                   onClick={() => handleAmPmChange(period)}
//                 >
//                   {period}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TimePicker;