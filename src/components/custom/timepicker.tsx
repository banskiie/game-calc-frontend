import { useState, useRef, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface TimePickerProps {
    initialTime?: string
    onChange?: (time: string) => void
    syncHour?: boolean
    onHourChange?: (hour: number) => void
}

const TimePicker: React.FC<TimePickerProps> = ({
    initialTime = '05:00 PM',
    onChange,
    syncHour = false,
    onHourChange,
}) => {
    // Parse the initial time only once when the component mounts
    const parseInitialTime = () => {
        const timeParts = initialTime.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i)
        if (!timeParts) return { hour: 5, minute: 0, ampm: 'PM' }

        return {
            hour: parseInt(timeParts[1]),
            minute: parseInt(timeParts[2]),
            ampm: timeParts[3].toUpperCase(),
        }
    }

    const [hour, setHour] = useState<number>(parseInitialTime().hour)
    const [minute, setMinute] = useState<number>(parseInitialTime().minute)
    const [ampm, setAmpm] = useState<string>(parseInitialTime().ampm)
    const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false)
    const pickerRef = useRef<HTMLDivElement>(null)

    const hoursContainerRef = useRef<HTMLDivElement>(null)
    const minutesContainerRef = useRef<HTMLDivElement>(null)
    const ampmContainerRef = useRef<HTMLDivElement>(null)
    // Generate data arrays
    const hours = Array.from({ length: 12 }, (_, i) => i + 1)
    const minutes = Array.from({ length: 60 }, (_, i) => i)
    const amPmOptions = ['AM', 'PM']

    // Track scrolling state
    const isScrolling = useRef(false)
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null)

    // Get the centered value from scroll position
    const getCenteredValue = (container: HTMLDivElement, items: any[]) => {
        const containerRect = container.getBoundingClientRect()
        const highlightCenter = containerRect.top + containerRect.height / 2

        // Find which item is at the exact center of the highlight
        const itemsElements = container.querySelectorAll(
            'div[class*="snap-center"]'
        )
        let closestItem = null
        let smallestDistance = Infinity

        itemsElements.forEach((item) => {
            const itemRect = item.getBoundingClientRect()
            const itemCenter = itemRect.top + itemRect.height / 2
            const distance = Math.abs(itemCenter - highlightCenter)

            if (distance < smallestDistance) {
                smallestDistance = distance
                closestItem = item
            }
        })

        if (!closestItem) return items[0]

        const itemIndex = parseInt(
            (closestItem as HTMLElement).getAttribute('data-index') || '0'
        )
        return items[itemIndex % items.length]
    }

    // Scroll to center the selected item
    const scrollToCenter = (
        container: HTMLDivElement | null,
        items: any[],
        selected: any
    ) => {
        if (!container) return

        isScrolling.current = true

        const selectedIndex = items.indexOf(selected)
        const itemsElements = container.querySelectorAll(
            'div[class*="snap-center"]'
        )
        const targetElement = itemsElements[items.length + selectedIndex] // Middle section

        if (targetElement) {
            const containerRect = container.getBoundingClientRect()
            const targetRect = targetElement.getBoundingClientRect()
            const highlightCenter = containerRect.top + containerRect.height / 2
            const scrollPosition =
                container.scrollTop +
                (targetRect.top - highlightCenter) +
                targetRect.height / 2

            container.scrollTo({
                top: scrollPosition,
                behavior: 'auto',
            })
        }

        setTimeout(() => (isScrolling.current = false), 300)
    }

    // Handle scroll events
    const handleScroll = (type: 'hour' | 'minute' | 'ampm') => {
        return () => {
            if (isScrolling.current) return

            clearTimeout(scrollTimeout.current as NodeJS.Timeout)

            scrollTimeout.current = setTimeout(() => {
                const container =
                    type === 'hour'
                        ? hoursContainerRef.current
                        : type === 'minute'
                        ? minutesContainerRef.current
                        : ampmContainerRef.current

                const items =
                    type === 'hour'
                        ? hours
                        : type === 'minute'
                        ? minutes
                        : amPmOptions

                if (!container) return

                const centeredValue = getCenteredValue(container, items)

                if (type === 'hour' && centeredValue !== hour)
                    setHour(centeredValue)
                if (type === 'minute' && centeredValue !== minute)
                    setMinute(centeredValue)
                if (type === 'ampm' && centeredValue !== ampm)
                    setAmpm(centeredValue)
            }, 100)
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                pickerRef.current &&
                !pickerRef.current.contains(event.target as Node)
            ) {
                setIsPickerOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const newTime = `${hour.toString().padStart(2, '0')}:${minute
            .toString()
            .padStart(2, '0')} ${ampm}`
        onChange?.(newTime)
    }, [hour, minute, ampm, onChange])

    useEffect(() => {
        if (syncHour && onHourChange) {
            onHourChange(hour)
        }
    }, [hour, syncHour, onHourChange])

    // Scroll to selected item when picker opens
    useEffect(() => {
        if (!isPickerOpen) return

        setTimeout(() => {
            scrollToCenter(hoursContainerRef.current, hours, hour)
            scrollToCenter(minutesContainerRef.current, minutes, minute)
            scrollToCenter(ampmContainerRef.current, amPmOptions, ampm)
        }, 0)
    }, [isPickerOpen, hour, minute, ampm])

    // Render item
    const renderItem = (
        value: number | string,
        selectedValue: number | string
    ) => {
        const isSelected = value === selectedValue
        const displayValue =
            typeof value === 'number'
                ? value.toString().padStart(2, '0')
                : value

        return (
            <div
                className={`
          h-10 flex items-center justify-center
          ${
              isSelected
                  ? 'text-primary font-bold text-xl'
                  : 'text-muted-foreground'
          }
          transition-all duration-200
        `}
            >
                {displayValue}
            </div>
        )
    }

    return (
        <div className="relative w-full" ref={pickerRef}>
          {/* Time display button */}
          {/* <div
            className="w-full pl-3 pr-10 py-2 border rounded-md bg-background text-base cursor-pointer flex items-center gap-2"
            onClick={() => setIsPickerOpen(!isPickerOpen)}
          > */}
            {/* <Clock className="h-5 w-5 text-muted-foreground" />
            {`${hour.toString().padStart(2, '0')}:${minute
              .toString()
              .padStart(2, '0')} ${ampm}`} */}
          {/* </div> */}
    
          {/* Time picker dropdown */}
          {/* {isPickerOpen && ( */}
            <div className=" z-50 mt-1 left-0 right-0 bg-white rounded-lg border shadow-lg ">
              <div className="flex items-center justify-center gap-6">
                {/* <span>hour</span> -- Add here the Hour sa taas apila ang Minute like same sa timer sa android jud*/}
                {/* Hours */}
                <div
                  ref={hoursContainerRef}
                  className="h-40 overflow-y-auto snap-y snap-mandatory scroll-smooth hide-scrollbar"
                  onScroll={handleScroll('hour')}
                >
                    
                  <div className="py-20 text-xl">
                    {[...hours, ...hours, ...hours].map(
                      (h, index) => (
                        <div
                          key={`hour-${index}`}
                          className="snap-center h-10"
                          data-index={index % hours.length}
                        >
                      

                          {renderItem(h, hour)}
                        </div>
                      )
                    )}
                  </div>
                </div>
    
                <span className="text-lg font-bold">:</span>
    
                {/* Minutes */}
                <div
                  ref={minutesContainerRef}
                  className="h-40 overflow-y-auto snap-y snap-mandatory scroll-smooth hide-scrollbar"
                  onScroll={handleScroll('minute')}
                >
                  <div className="py-20 text-xl">
                    {[...minutes, ...minutes, ...minutes].map(
                      (m, index) => (
                        <div
                          key={`minute-${index}`}
                          className="snap-center h-10"
                          data-index={index % minutes.length}
                        >
                          {renderItem(m, minute)}
                        </div>
                      )
                    )}
                  </div>
                </div>
    
                {/* AM/PM */}
                <div
                  ref={ampmContainerRef}
                  className="h-40 overflow-y-auto snap-y snap-mandatory scroll-smooth hide-scrollbar"
                  onScroll={handleScroll('ampm')}
                >
                  <div className="py-20 text-xl">
                    <div className="snap-center h-10" data-index={1}>
                      {renderItem('PM', ampm)}
                    </div>
                    <div className="snap-center h-10" data-index={0}>
                      {renderItem('AM', ampm)}
                    </div>
                  </div>
                </div>
              </div>
    
              {/* Center highlight */}
              <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 h-10 bg-gray-100 bg-opacity-50 border-y border-gray-200 pointer-events-none"></div>
            </div>
          {/* )} */}
    
          <style jsx>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>
      )
    }
    
    export default TimePicker