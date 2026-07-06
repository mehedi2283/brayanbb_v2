import { Calendar, X, LogOut, User } from 'lucide-react';
import DatePicker from 'react-datepicker';

interface HeaderProps {
  isClientMode?: boolean;
  dateRange: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
  user?: any;
  onLogout?: () => void;
}

export function Header({ isClientMode, dateRange, setDateRange, user, onLogout }: HeaderProps) {
  const [startDate, endDate] = dateRange;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 gap-4">
      <div className="flex-1"></div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 transition-colors group relative w-[250px] shrink-0">
          <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <DatePicker
              selectsRange={true}
              startDate={startDate ?? undefined}
              endDate={endDate ?? undefined}
              onChange={(update) => setDateRange(update)}
              dateFormat="MMM d, yyyy"
              className="bg-transparent text-sm text-slate-600 font-medium outline-none border-none focus:ring-0 p-0 w-full text-left cursor-pointer caret-transparent select-none pr-6 truncate"
              wrapperClassName="w-full"
              placeholderText="Select date range"
              onChangeRaw={(e) => e.preventDefault()}
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => setDateRange([null, null])} 
              className="absolute right-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 rounded-full p-0.5 flex items-center justify-center z-10"
              title="Clear date range"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {user && (
          <div className="flex items-center pl-4 border-l border-slate-200 space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-slate-700 leading-tight">{user.email}</p>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">{user.role}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors ml-2"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
