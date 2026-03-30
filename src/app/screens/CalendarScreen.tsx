import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { statsAPI } from "../services/api";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await statsAPI.calendar(year, month + 1);
      setCalendarData(data);
    } catch {} finally { setLoading(false); }
  }, [year, month]);

  useEffect(() => { loadData(); }, [loadData]);

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dayEntries = calendarData?.days || {};

  const getDayData = (day: number) => {
    const key = String(day).padStart(2, "0");
    return dayEntries[key] || dayEntries[day] || null;
  };

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Month Nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
          className="w-9 h-9 rounded-lg bg-[#1B2130] flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <span className="text-sm text-white font-semibold">{monthLabel}</span>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
          className="w-9 h-9 rounded-lg bg-[#1B2130] flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#7C5CFF] animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary */}
          {calendarData && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1B2130] rounded-xl p-3 border border-white/5 text-center">
                <p className="text-xs text-white/50">Income</p>
                <p className="text-lg font-bold text-[#22C55E]">{formatCurrency(calendarData.total_income || 0)}</p>
              </div>
              <div className="bg-[#1B2130] rounded-xl p-3 border border-white/5 text-center">
                <p className="text-xs text-white/50">Expense</p>
                <p className="text-lg font-bold text-[#EF4444]">{formatCurrency(calendarData.total_expense || 0)}</p>
              </div>
            </div>
          )}

          {/* Calendar Grid */}
          <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs text-white/40 font-medium py-1">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const data = getDayData(day);
                const hasExpense = data?.expense > 0;
                const hasIncome = data?.income > 0;
                const isSelected = selectedDay === day;
                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors relative ${
                      isSelected
                        ? "bg-[#7C5CFF] text-white"
                        : isToday
                        ? "bg-[#7C5CFF]/20 text-white"
                        : "text-white/70 hover:bg-white/5"
                    }`}
                  >
                    <span className="font-medium">{day}</span>
                    {(hasExpense || hasIncome) && (
                      <div className="flex gap-0.5 mt-0.5">
                        {hasIncome && <div className="w-1 h-1 rounded-full bg-[#22C55E]" />}
                        {hasExpense && <div className="w-1 h-1 rounded-full bg-[#EF4444]" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Details */}
          {selectedDay && getDayData(selectedDay) && (
            <div className="bg-[#1B2130] rounded-xl p-4 border border-white/5 space-y-2">
              <h3 className="text-sm font-semibold text-white">
                {currentDate.toLocaleDateString("en-US", { month: "short" })} {selectedDay}
              </h3>
              {getDayData(selectedDay)?.income > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-white/50">Income</span>
                  <span className="text-sm font-medium text-[#22C55E]">
                    +{formatCurrency(getDayData(selectedDay).income)}
                  </span>
                </div>
              )}
              {getDayData(selectedDay)?.expense > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-white/50">Expense</span>
                  <span className="text-sm font-medium text-[#EF4444]">
                    -{formatCurrency(getDayData(selectedDay).expense)}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
