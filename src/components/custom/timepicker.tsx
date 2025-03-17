import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface TimePickerProps {
  initialTime?: string;
  onChange?: (time: string) => void;
  syncHour?: boolean;
  onHourChange?: (hour: number) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({
  initialTime = '05:00 PM',
  onChange,
  syncHour = false,
  onHourChange,
}) => {
  const timeParts = initialTime.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/);
  const parsedHour = timeParts ? parseInt(timeParts[1]) : 5;
  const parsedMinute = timeParts ? parseInt(timeParts[2]) : 0;
  const parsedAmPm = timeParts ? timeParts[3] : 'PM';

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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const newTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`;
    onChange?.(newTime);
  }, [hour, minute, ampm, onChange]);

  useEffect(() => {
    if (isPickerOpen) {
      setTimeout(() => {
        if (hourRef.current) hourRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
        if (minuteRef.current) minuteRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
        if (ampmRef.current) ampmRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
      }, 0);
    }
  }, [isPickerOpen]);

  useEffect(() => {
    if (syncHour && onHourChange) {
      onHourChange(hour); // Notify parent component of hour change
    }
  }, [hour, syncHour, onHourChange]);

  return (
    <div className="relative w-full" ref={pickerRef}>
      <div
        className="w-full pl-3 pr-10 py-2 border rounded-md bg-background text-base cursor-pointer flex items-center gap-2"
        onClick={() => setIsPickerOpen(!isPickerOpen)}
      >
        <Clock className="h-5 w-5 text-muted-foreground" />
        {`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`}
      </div>

      {isPickerOpen && (
        <div className="absolute left-0 right-0 bg-white rounded-lg border shadow-lg flex items-center justify-center p-4">
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg">
            <ScrollArea className="h-32 w-16 overflow-y-auto flex flex-col items-center bg-white rounded-md">
              {[...Array(12).keys()].map((h) => (
                <div
                  key={h}
                  ref={h + 1 === hour ? hourRef : null}
                  className={`p-2 text-base text-center cursor-pointer rounded ${h + 1 === hour ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
                  onClick={() => setHour(h + 1)}
                >
                  {(h + 1).toString().padStart(2, '0')}
                </div>
              ))}
            </ScrollArea>

            <span className="text-lg">:</span>

            <ScrollArea className="h-32 w-16 overflow-y-auto flex flex-col items-center bg-white rounded-md">
              {[...Array(60).keys()].map((m) => (
                <div
                  key={m}
                  ref={m === minute ? minuteRef : null}
                  className={`p-2 text-base text-center cursor-pointer rounded ${m === minute ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
                  onClick={() => setMinute(m)}
                >
                  {m.toString().padStart(2, '0')}
                </div>
              ))}
            </ScrollArea>

            <ScrollArea className="h-32 w-16 overflow-y-auto flex flex-col items-center bg-white rounded-md">
              {['AM', 'PM'].map((period) => (
                <div
                  key={period}
                  ref={period === ampm ? ampmRef : null}
                  className={`p-2 text-base text-center cursor-pointer rounded ${period === ampm ? 'bg-primary text-white' : 'hover:bg-gray-200'}`}
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