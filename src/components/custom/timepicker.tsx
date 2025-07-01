import React, { useState, useRef, useEffect, forwardRef } from 'react';

interface TimePickerProps {
  initialTime?: string;
  onChange?: (time: string) => void;
  syncHour?: boolean;
  onHourChange?: (hour: number) => void;
}

export interface TimePickerRef {
  setTime: (time: string) => void;
}

const TimePicker = forwardRef<TimePickerRef, TimePickerProps>(({
  initialTime = '05:00 PM',
  onChange,
  syncHour = false,
  onHourChange,
}, ref) => {
  const parseInitialTime = () => {
    const match = initialTime.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
    return {
      hour: match ? parseInt(match[1]) : 5,
      minute: match ? parseInt(match[2]) : 0,
      ampm: match ? match[3].toUpperCase() : 'PM',
    };
  };

  const [hour, setHour] = useState<number>(parseInitialTime().hour);
  const [minute, setMinute] = useState<number>(parseInitialTime().minute);
  const [ampm, setAmpm] = useState<string>(parseInitialTime().ampm);
  const [isInitialized, setIsInitialized] = useState(false);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const amPmOptions = ['AM', 'PM'];

  const duplicates = 20;

  const hoursContainerRef = useRef<HTMLDivElement>(null);
  const minutesContainerRef = useRef<HTMLDivElement>(null);
  const ampmContainerRef = useRef<HTMLDivElement>(null);

  const repeated = (items: any[]) => Array(duplicates).fill(items).flat();

  const centerScroll = (ref: HTMLDivElement | null, value: any, _list: any[]) => {
    if (!ref) return;
    const children = Array.from(ref.querySelectorAll('div[data-value]'));
    const midIndex = Math.floor(children.length / 2);
    const matching = children.filter(c => c.getAttribute('data-value') == value);
    const target = matching.length ? matching[Math.floor(matching.length / 2)] : children[midIndex];
    if (target) {
      const containerRect = ref.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const scroll = ref.scrollTop + (targetRect.top - containerRect.top) - containerRect.height / 2 + targetRect.height / 2;
      ref.scrollTo({ top: scroll, behavior: 'instant' as any });
    }
  };

  const getScrollValue = (ref: HTMLDivElement | null, list: any[]) => {
    if (!ref) return list[0];
    const rect = ref.getBoundingClientRect();
    const centerY = rect.top + rect.height / 2;
    const items = Array.from(ref.querySelectorAll('div[data-value]'));
    let closest = items[0];
    let closestDist = Infinity;
    items.forEach(el => {
      const elRect = el.getBoundingClientRect();
      const elCenter = elRect.top + elRect.height / 2;
      const dist = Math.abs(centerY - elCenter);
      if (dist < closestDist) {
        closest = el;
        closestDist = dist;
      }
    });
    return closest.getAttribute('data-value');
  };

  const handleScroll = (type: 'hour' | 'minute' | 'ampm') => {
    let scrollTimeout: NodeJS.Timeout;

    return () => {
      const container =
        type === 'hour'
          ? hoursContainerRef.current
          : type === 'minute'
            ? minutesContainerRef.current
            : ampmContainerRef.current;

      const list = type === 'hour' ? hours : type === 'minute' ? minutes : amPmOptions;
      if (!container) return;

      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        const value = getScrollValue(container, list);
        const parsedValue = typeof list[0] === 'number' ? parseInt(value as string) : value;

        if (type === 'hour') setHour(parsedValue);
        if (type === 'minute') setMinute(parsedValue);
        if (type === 'ampm') setAmpm(parsedValue);

        // recenter on selected value
        centerScroll(container, parsedValue, list);
      }, 150);
    };
  };

  React.useImperativeHandle(ref, () => ({
    setTime: (time: string) => {
      const match = time.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
      if (match) {
        setHour(parseInt(match[1]));
        setMinute(parseInt(match[2]));
        setAmpm(match[3].toUpperCase());

        setTimeout(() => {
          centerScroll(hoursContainerRef.current, parseInt(match[1]), hours);
          centerScroll(minutesContainerRef.current, parseInt(match[2]), minutes);
          centerScroll(ampmContainerRef.current, match[3].toUpperCase(), amPmOptions);
        }, 50);
      }
    }
  }));

  useEffect(() => {
    if (!isInitialized) {
      const init = () => {
        centerScroll(hoursContainerRef.current, hour, hours);
        centerScroll(minutesContainerRef.current, minute, minutes);
        centerScroll(ampmContainerRef.current, ampm, amPmOptions);
        setIsInitialized(true);
      };
      setTimeout(init, 50);
    }
  }, [isInitialized, hour, hours, minute, minutes, ampm, amPmOptions]);

  useEffect(() => {
    onChange?.(
      `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${ampm}`
    );
  }, [hour, minute, ampm]);

  useEffect(() => {
    if (syncHour && onHourChange) {
      onHourChange(hour);
    }
  }, [hour, syncHour]);

  const renderItems = (items: any[], selected: any) => {
    return repeated(items).map((item, i) => (
      <div
        key={`${item}-${i}`}
        data-value={item}
        className={`snap-center h-10 flex items-center justify-center ${selected === item ? 'text-black font-bold text-lg' : 'text-gray-500 text-lg'
          }`}
      >
        {typeof item === 'number' ? item.toString().padStart(2, '0') : item}
      </div>
    ));
  };

  return (
    <div className="relative bg-gray-100 rounded-lg shadow p-2">
      <div className="absolute inset-x-0 top-[50%] transform -translate-y-1/2 h-10 pointer-events-none z-0" />
      <div className="flex items-center justify-center space-x-2 text-xl">
        {/* Hour */}
        <div className="w-14">
          <div
            ref={hoursContainerRef}
            className="h-12 overflow-y-auto snap-y snap-mandatory scroll-smooth scrollbar-none mask-gradient [&::-webkit-scrollbar]:hidden"
            onScroll={handleScroll('hour')}
          >
            <div className="py-20">{renderItems(hours, hour)}</div>
          </div>
        </div>

        {/* Colon */}
        <span className="text-gray-700 font-bold">:</span>

        {/* Minute */}
        <div className="w-14">
          <div
            ref={minutesContainerRef}
            className="h-12 overflow-y-auto snap-y snap-mandatory scroll-smooth scrollbar-none mask-gradient [&::-webkit-scrollbar]:hidden"
            onScroll={handleScroll('minute')}
          >
            <div className="py-20">{renderItems(minutes, minute)}</div>
          </div>
        </div>

        {/* Colon */}
        <span className="text-gray-700 font-bold">:</span>

        {/* AM/PM */}
        <div className="w-14">
          <div
            ref={ampmContainerRef}
            className="h-10 overflow-y-auto snap-y snap-mandatory scroll-smooth scrollbar-none mask-gradient [&::-webkit-scrollbar]:hidden"
            onScroll={handleScroll('ampm')}
          >
            <div className="py-20">
              {amPmOptions.map((item, i) => (
                <div
                  key={item}
                  data-value={item}
                  className={`snap-center h-10 flex items-center justify-center ${ampm === item ? 'text-black font-bold text-lg' : 'text-gray-500 text-lg'
                    }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TimePicker.displayName = 'TimePicker';

export default TimePicker;