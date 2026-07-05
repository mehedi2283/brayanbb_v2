import { Calendar, X } from 'lucide-react';
import DatePicker from 'react-datepicker';

interface HeaderProps {
  isClientMode?: boolean;
  dateRange: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
}

export function Header({ isClientMode, dateRange, setDateRange }: HeaderProps) {
  const [startDate, endDate] = dateRange;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 gap-4">
      <div className="flex-1"></div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 transition-colors group relative">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <DatePicker
            selectsRange={true}
            startDate={startDate ?? undefined}
            endDate={endDate ?? undefined}
            onChange={(update) => setDateRange(update)}
            dateFormat="MMM d, yyyy"
            className="bg-transparent text-sm text-slate-600 font-medium outline-none border-none focus:ring-0 p-0 w-44 text-center cursor-pointer pr-4"
            placeholderText="Select date range"
          />
          {(startDate || endDate) && (
            <button 
              onClick={() => setDateRange([null, null])} 
              className="absolute right-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full p-0.5 flex items-center justify-center"
              title="Clear date range"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
