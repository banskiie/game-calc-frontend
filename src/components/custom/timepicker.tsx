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

      <div className="flex items-center gap-8 text-sm text-gray-500">
        <span>Hour</span>
        <span>Min</span>
      </div>
    </div>
  )
}

export default TimePicker