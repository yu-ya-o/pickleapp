import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { ja } from 'date-fns/locale';
import { format } from 'date-fns';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useInteractions,
  FloatingPortal,
} from '@floating-ui/react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

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
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedHour, setSelectedHour] = useState('09');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss]);

  // Parse ISO string to Date and time
  useEffect(() => {
    if (!value) return;
    const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})T(\d{2}):(\d{2})/);
    if (match) {
      const [, year, month, day, hours, minutes] = match;
      setSelectedDate(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
      setSelectedHour(hours);
      setSelectedMinute(minutes);
    }
  }, [value]);

  // Convert to ISO string and emit
  const emitChange = (date: Date | undefined, hour: string, minute: string) => {
    if (!date) {
      onChange('');
      return;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    onChange(`${year}-${month}-${day}T${hour}:${minute}`);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    emitChange(date, selectedHour, selectedMinute);
  };

  const handleTimeChange = (hour: string, minute: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    emitChange(selectedDate, hour, minute);
  };

  // Format display value
  const displayValue = selectedDate
    ? `${format(selectedDate, 'yyyy/M/d', { locale: ja })} ${selectedHour}:${selectedMinute}`
    : '';

  // Generate time options
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        ref={refs.setReference}
        {...getReferenceProps()}
        className={`w-full h-11 px-4 rounded-xl border bg-white text-left flex items-center gap-3 transition-all duration-200 focus:outline-none focus:ring-2 ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-200 hover:border-gray-300 focus:ring-blue-500 focus:border-transparent'
        }`}
      >
        <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
          {displayValue || '日時を選択'}
        </span>
      </button>

      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}

      {/* Floating Calendar Popover */}
      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200"
          >
            {/* Calendar */}
            <div className="p-4">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                locale={ja}
                showOutsideDays
                hideNavigation={false}
                formatters={{
                  formatCaption: (date) => format(date, 'yyyy年 M月', { locale: ja }),
                }}
                classNames={{
                  root: 'w-full',
                  months: 'flex flex-col',
                  month: 'space-y-4',
                  month_caption: 'flex justify-center relative items-center h-10',
                  caption_label: 'text-sm font-semibold text-gray-900',
                  nav: 'flex items-center gap-1',
                  button_previous: 'absolute left-0 p-2 rounded-lg hover:bg-gray-100 transition-colors',
                  button_next: 'absolute right-0 p-2 rounded-lg hover:bg-gray-100 transition-colors',
                  weekdays: 'flex',
                  weekday: 'w-10 h-10 flex items-center justify-center text-xs font-medium text-gray-500',
                  week: 'flex',
                  day: 'w-10 h-10 flex items-center justify-center',
                  day_button: 'w-9 h-9 rounded-full text-sm font-medium transition-all duration-150 hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  today: 'font-bold',
                  selected: 'bg-blue-500 text-white hover:bg-blue-600 hover:text-white',
                  outside: 'text-gray-300',
                  disabled: 'text-gray-300 cursor-not-allowed',
                }}
                components={{
                  Chevron: ({ orientation }) =>
                    orientation === 'left' ? (
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    ),
                }}
              />
            </div>

            {/* Time Selector */}
            <div className="border-t border-gray-100 p-4 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">時刻</span>
                <div className="flex items-center gap-2 ml-auto">
                  <select
                    value={selectedHour}
                    onChange={(e) => handleTimeChange(e.target.value, selectedMinute)}
                    className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-300 transition-colors"
                  >
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-400 font-medium">:</span>
                  <select
                    value={selectedMinute}
                    onChange={(e) => handleTimeChange(selectedHour, e.target.value)}
                    className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-300 transition-colors"
                  >
                    {minutes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Done Button */}
            <div className="border-t border-gray-100 p-3 bg-white">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full h-10 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                完了
              </button>
            </div>
          </div>
        </FloatingPortal>
      )}
    </div>
  );
}
