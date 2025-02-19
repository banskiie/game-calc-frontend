// import { useState, useRef, useEffect } from "react";
// import { ChevronDown } from "lucide-react";
// import { ScrollArea } from "../ui/scroll-area";

// interface TimePickerProps {
//   initialTime?: string;
//   onChange?: (time: string) => void;
// }

// const TimePicker: React.FC<TimePickerProps> = ({ initialTime = "12:00 AM", onChange }) => {
//   const safeInitialTime = initialTime || "12:00 AM";
//   const timeParts = safeInitialTime.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/);
//   const parsedHour = timeParts ? parseInt(timeParts[1]) : 12;
//   const parsedMinute = timeParts ? parseInt(timeParts[2]) : 0;
//   const parsedAmPm = timeParts ? timeParts[3] : "AM";

//   const [hour, setHour] = useState<number>(parsedHour);
//   const [minute, setMinute] = useState<number>(parsedMinute);
//   const [ampm, setAmpm] = useState<string>(parsedAmPm);
//   const [isAmPmOpen, setIsAmPmOpen] = useState<boolean>(false);
//   const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);

//   const pickerRef = useRef<HTMLDivElement>(null);

//   const handleClickOutside = (event: MouseEvent) => {
//     if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
//       setIsPickerOpen(false);
//       setIsAmPmOpen(false);
//     }
//   };

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const hours = Array.from({ length: 12 }, (_, i) => i + 1);
//   const minutes = Array.from({ length: 60 }, (_, i) => i);

//   const handleScroll = (e: React.UIEvent<HTMLDivElement>, setValue: (val: number) => void, range: number[]) => {
//     const { scrollTop, clientHeight } = e.currentTarget;
//     const itemHeight = clientHeight / 3;
//     let index = Math.round(scrollTop / itemHeight) % range.length;
//     if (index < 0) index += range.length;
//     setValue(range[index]);
//   };

//   useEffect(() => {
//     const newTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${ampm}`;
//     onChange?.(newTime);
//   }, [hour, minute, ampm, onChange]);

//   return (
//     <div className="relative w-full" ref={pickerRef}>
//       <input
//         type="text"
//         className="w-full p-2 border border-gray-300 rounded text-center cursor-pointer"
//         value={`${hour.toString().padStart(2, "0")}  :  ${minute.toString().padStart(2, "0")} ${ampm}`}
//         onClick={() => setIsPickerOpen(!isPickerOpen)}
//         readOnly
//       />

//       {isPickerOpen && (
//         <div className="absolute bg-white border rounded shadow-lg p-2 mt-1 w-full">
//           <div className="relative flex gap-1 justify-center items-center">
//             <div className="relative w-12 h-10 overflow-hidden text-center py-2 hover:bg-gray-300 hover:text-white rounded-lg">
//               <ScrollArea className="h-12 snap-y snap-mandatory scroll-smooth" onScroll={(e) => handleScroll(e, setHour, hours)}>
//                 {hours.map((h) => (
//                   <div key={h} className={`h-7 flex items-center justify-center cursor-pointer ${h === hour ? "text-blue-500 font-bold" : "text-gray-700 hover:text-gray-900"}`} onClick={() => setHour(h)}>
//                     {h.toString().padStart(2, "0")}
//                   </div>
//                 ))}
//               </ScrollArea>
//             </div>

//             <span className=""> : </span>

//             <div className="relative w-12 h-10 overflow-hidden text-center py-2 hover:bg-gray-300 hover:text-white rounded-lg cursor-pointer ">
//               <ScrollArea className="h-12 snap-y snap-mandatory scroll-smooth" onScroll={(e) => handleScroll(e, setMinute, minutes)}>
//                 {minutes.map((m) => (
//                   <div key={m} className={`h-7 flex items-center justify-center cursor-pointer ${m === minute ? "text-blue-500 font-bold" : "text-gray-700 hover:text-gray-900"}`} onClick={() => setMinute(m)}>
//                     {m.toString().padStart(2, "0")}
//                   </div>
//                 ))}
//               </ScrollArea>
//             </div>

//             <div className="relative ">
//               <div className="flex items-center cursor-pointer" onClick={() => setIsAmPmOpen(!isAmPmOpen)}>
//                 {ampm} <ChevronDown className="ml-1 w-4 h-4 text-gray-500" />
//               </div>
//               {isAmPmOpen && (
//                 <div className="absolute mt-1 w-14 bg-white border rounded shadow-lg z-10">
//                   {["AM", "PM"].map((period) => (
//                     <div key={period} className={`p-1 text-center cursor-pointer ${period === ampm ? "bg-blue-500 text-white" : "hover:bg-gray-100"}`} onClick={() => { setAmpm(period); setIsAmPmOpen(false); }}>
//                       {period}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TimePicker;
import { useState, useRef, useEffect } from "react";
import { Clock } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface TimePickerProps {
  initialTime?: string;
  onChange?: (time: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ initialTime = "--:-- PM", onChange }) => {
  const timeParts = initialTime.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/);
  const parsedHour = timeParts ? parseInt(timeParts[1]) : 12;
  const parsedMinute = timeParts ? parseInt(timeParts[2]) : 0;
  const parsedAmPm = timeParts ? timeParts[3] : "PM";

  const [hour, setHour] = useState<number>(parsedHour);
  const [minute, setMinute] = useState<number>(parsedMinute);
  const [ampm, setAmpm] = useState<string>(parsedAmPm);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const hourRef = useRef<HTMLDivElement | null>(null);
  const minuteRef = useRef<HTMLDivElement | null>(null);
  const ampmRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const newTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${ampm}`;
    onChange?.(newTime);
  }, [hour, minute, ampm, onChange]);

  useEffect(() => {
    if (isPickerOpen) {
      hourRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      minuteRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      ampmRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isPickerOpen]);

  return (
    <div className="relative w-full" ref={pickerRef}>
      <div
        className="w-full pl-3 pr-10 py-2 border rounded-md bg-background text-sm cursor-pointer flex items-center justify-between"
        onClick={() => setIsPickerOpen(!isPickerOpen)}
      >
        {`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${ampm}`}
        <Clock className="h-5 w-5 text-muted-foreground" />
      </div>

      {isPickerOpen && (
        <div className="absolute inset-0 bg-popover text-popover-foreground rounded-lg border shadow-lg flex items-center justify-center p-6">
          <div className="flex items-center gap-4">
            <ScrollArea className="h-8 w-12 overflow-hidden flex flex-col items-center">
              {[...Array(12).keys()].map((h) => (
                <div
                  key={h}
                  ref={h + 1 === hour ? hourRef : null}
                  className={`p-1 text-center cursor-pointer rounded ${h + 1 === hour ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                  onClick={() => setHour(h + 1)}
                >
                  {(h + 1).toString().padStart(2, "0")}
                </div>
              ))}
            </ScrollArea>

            <span className="text-lg">:</span>

            <ScrollArea className="h-8 w-12 overflow-hidden flex flex-col items-center">
              {[...Array(60).keys()].map((m) => (
                <div
                  key={m}
                  ref={m === minute ? minuteRef : null}
                  className={`p-1 text-center cursor-pointer rounded ${m === minute ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                  onClick={() => setMinute(m)}
                >
                  {m.toString().padStart(2, "0")}
                </div>
              ))}
            </ScrollArea>

            <ScrollArea className="h-8 w-12 overflow-hidden flex flex-col items-center">
              {["AM", "PM"].map((period) => (
                <div
                  key={period}
                  ref={period === ampm ? ampmRef : null}
                  className={`p-1 text-center cursor-pointer rounded ${period === ampm ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                  onClick={() => setAmpm(period)}
                >
                  {period}
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;
