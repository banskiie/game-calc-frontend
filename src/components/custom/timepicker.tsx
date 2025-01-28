import React from 'react';

interface TimePickerProps {
  value: string;
  onChange: (newTime: string) => void;
  id: string;
  ariaLabel: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ value, onChange, id, ariaLabel }) => {
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')); // Hours 00-23
  const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')); // Minutes 00-59

  const handleChange = (field: 'hours' | 'minutes', newValue: string) => {
    const [currentHours, currentMinutes] = value.split(':');
    if (field === 'hours') {
      onChange(`${newValue}:${currentMinutes}`);
    } else {
      onChange(`${currentHours}:${newValue}`);
    }
  };

  const [currentHours, currentMinutes] = value.split(':');

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
    </div>
  );
};

export default TimePicker;
