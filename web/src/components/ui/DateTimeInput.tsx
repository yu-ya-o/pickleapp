import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DateTimeInputProps {
  label?: string;
  value: string; // ISO format: YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

export function DateTimeInput({
  label,
  value,
  onChange,
  required,
  error,
}: DateTimeInputProps) {
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');

  // Parse ISO value to date and time
  useEffect(() => {
    if (value) {
      // Parse ISO format directly: YYYY-MM-DDTHH:mm
      const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{2}):(\d{2})/);
      if (match) {
        const [, year, month, day, hours, minutes] = match;
        setDateValue(`${year}/${parseInt(month)}/${parseInt(day)}`);
        setTimeValue(`${hours}:${minutes}`);
      }
    } else {
      setDateValue('');
      setTimeValue('');
    }
  }, [value]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDateValue(newDate);
    updateValue(newDate, timeValue);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    updateValue(dateValue, newTime);
  };

  const updateValue = (date: string, time: string) => {
    if (date && time) {
      // Parse date in format YYYY/M/D or YYYY/MM/DD
      const dateParts = date.split('/');
      if (dateParts.length === 3) {
        const year = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]);
        const day = parseInt(dateParts[2]);

        // Parse time in format HH:mm
        const timeParts = time.split(':');
        if (timeParts.length === 2) {
          const hours = parseInt(timeParts[0]);
          const minutes = parseInt(timeParts[1]);

          if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(hours) && !isNaN(minutes)) {
            const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            onChange(isoDate);
          }
        }
      }
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={dateValue}
          onChange={handleDateChange}
          placeholder="2026/1/12"
          required={required}
          className={cn(
            'flex-1 h-11 px-4 rounded-xl border border-[var(--border)] bg-white',
            'text-base placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
            'transition-all duration-200',
            error && 'border-[var(--destructive)] focus:ring-[var(--destructive)]'
          )}
        />
        <input
          type="text"
          value={timeValue}
          onChange={handleTimeChange}
          placeholder="09:00"
          required={required}
          className={cn(
            'w-24 h-11 px-4 rounded-xl border border-[var(--border)] bg-white',
            'text-base placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent',
            'transition-all duration-200',
            error && 'border-[var(--destructive)] focus:ring-[var(--destructive)]'
          )}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-[var(--destructive)]">{error}</p>
      )}
    </div>
  );
}
