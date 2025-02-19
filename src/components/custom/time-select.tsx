import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface TimeSelectProps {
  currentTime: string
  onTimeSelect: (time: string) => void
}

export function TimeSelect({ currentTime, onTimeSelect }: TimeSelectProps) {
  const [selectedHour, setSelectedHour] = useState('12')
  const [selectedMinute, setSelectedMinute] = useState('00')
  const [selectedPeriod, setSelectedPeriod] = useState('AM')

  useEffect(() => {
    const [time, period] = currentTime.split(' ')
    const [hour, minute] = time.split(':')
    setSelectedHour(hour)
    setSelectedMinute(minute)
    setSelectedPeriod(period)
  }, [currentTime])

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))
  const periods = ['AM', 'PM']

  const handleSelect = () => {
    const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`
    onTimeSelect(formattedTime)
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Hour</div>
          <ScrollArea className="h-[200px] rounded-md border">
            <div className="p-2">
              {hours.map((hour) => (
                <Button
                 type='button'
                  key={hour}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start font-normal",
                    selectedHour === hour && "bg-primary/10 font-medium"
                  )}
                  onClick={() => setSelectedHour(hour)}
                >
                  {hour}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div>
          <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Minute</div>
          <ScrollArea className="h-[200px] rounded-md border">
            <div className="p-2">
              {minutes.map((minute) => (
                <Button
                type='button'
                  key={minute}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start font-normal",
                    selectedMinute === minute && "bg-primary/10 font-medium"
                  )}
                  onClick={() => setSelectedMinute(minute)}
                >
                  {minute}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div>
          <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Period</div>
          <div className="space-y-2">
            {periods.map((period) => (
              <Button
              type='button'
                key={period}
                variant="outline"
                className={cn(
                  "w-full",
                  selectedPeriod === period && "bg-primary text-primary-foreground"
                )}
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Button 
        className="w-full"
        onClick={handleSelect}
      >
        Select Time
      </Button>
    </div>
  )
}
