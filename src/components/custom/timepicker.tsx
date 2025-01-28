import React, { useState, useEffect } from 'react';

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

  const handleChange = (field: 'time' | 'period', newValue: string) => {
    const [currentHours, currentMinutes] = value.split(':');
    let formattedTime = `${currentHours}:${currentMinutes} ${newValue}`;

    if (field === 'time') {
      const [newHours, newMinutes] = newValue.split(':');
      formattedTime = `${newHours}:${newMinutes} ${currentPeriod}`;
    }

    onChange(formattedTime);
  };

  const [currentHours, currentMinutes, currentPeriod = "PM"] = value.split(/[: ]/);

  return (
    <div className="flex items-center space-x-1">
      {/* Time input field */}
      <input
        type="time"
        id={`${id}-time`}
        value={`${currentHours}:${currentMinutes}`}
        onChange={(e) => handleChange('time', e.target.value)}
        aria-label={ariaLabel}
        className="w-32 p-2 border rounded-md text-center"
      />
      {/* Period input (AM/PM) */}
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
