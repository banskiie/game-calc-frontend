import React from 'react';

interface TimePickerProps {
  value: string;
  onChange: (newTime: string) => void;
  id: string;
  ariaLabel: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, id, ariaLabel }) => {
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')); 
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
  const periods = ['AM', 'PM']; 

  const handleChange = (field: 'hours' | 'minutes' | 'period', newValue: string) => {
    const [currentHours, currentMinutes, currentPeriod] = value.split(/[: ]/);
    if (field === 'hours') {
      onChange(`${newValue}:${currentMinutes} ${currentPeriod}`);
    } else if (field === 'minutes') {
      onChange(`${currentHours}:${newValue} ${currentPeriod}`);
    } else if (field === 'period') {
      onChange(`${currentHours}:${currentMinutes} ${newValue}`);
    }
  };

  const [currentHours, currentMinutes, currentPeriod = 'PM'] = value.split(/[: ]/);

  return (
    <div className="flex items-center space-x-1">
      <select
        id={`${id}-hours`}
        value={currentHours}
        onChange={(e) => handleChange('hours', e.target.value)}
        aria-label={`${ariaLabel} - Hours`}
        className="w-16 p-2 border rounded-md text-center"
      >
        {hours.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </select>
      <span>:</span>
      <select
        id={`${id}-minutes`}
        value={currentMinutes}
        onChange={(e) => handleChange('minutes', e.target.value)}
        aria-label={`${ariaLabel} - Minutes`}
        className="w-16 p-2 border rounded-md text-center"
      >
        {minutes.map((minute) => (
          <option key={minute} value={minute}>
            {minute}
          </option>
        ))}
      </select>
      <select
        id={`${id}-period`}
        value={currentPeriod}
        onChange={(e) => handleChange('period', e.target.value)}
        aria-label={`${ariaLabel} - AM/PM`}
        className="w-16 p-2 border rounded-md text-center"
      >
        {periods.map((period) => (
          <option key={period} value={period}>
            {period}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimePicker;
