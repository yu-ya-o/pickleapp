import DatePicker, { registerLocale } from 'react-datepicker';
import { ja } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';

registerLocale('ja', ja);

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
  // Parse ISO string to Date object
  const parseValue = (val: string): Date | null => {
    if (!val) return null;
    const match = val.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{2}):(\d{2})/);
    if (match) {
      const [, year, month, day, hours, minutes] = match;
      return new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hours),
        parseInt(minutes)
      );
    }
    return null;
  };

  // Convert Date to ISO string
  const formatToISO = (date: Date | null): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleChange = (date: Date | null) => {
    onChange(formatToISO(date));
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <DatePicker
        selected={parseValue(value)}
        onChange={handleChange}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        dateFormat="yyyy/M/d HH:mm"
        locale="ja"
        placeholderText="2026/1/12 09:00"
        className={`w-full h-11 px-4 rounded-xl border bg-white text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-200 focus:ring-blue-500 focus:border-transparent'
        }`}
        wrapperClassName="w-full"
        required={required}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
