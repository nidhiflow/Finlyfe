import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { transactionsAPI } from "../services/api";

export function CalendarScreen() {
  const [baseDate, setBaseDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthData = async () => {
      setLoading(true);
      try {
        // Fetch all transactions (ideally should be filtered by date, but since API doesn't guarantee filter support, we'll fetch and filter client-side for now)
        const allTx = await transactionsAPI.getAll();
        if (allTx) setTransactions(allTx);
      } catch (error) {
        console.error("Failed to load transactions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthData();
  }, []);

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const currentMonthStr = baseDate.toLocaleString("en-US", { month: "long", year: "numeric" });
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setBaseDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setBaseDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  // Group transactions by day for current month
  const currentMonthTx = transactions.filter(tx => {
    if (!tx.date) return false;
    const d = new Date(tx.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const dayTransactions: Record<number, any[]> = {};
  currentMonthTx.forEach(tx => {
    const d = new Date(tx.date).getDate();
    if (!dayTransactions[d]) dayTransactions[d] = [];
    dayTransactions[d].push(tx);
  });

  const dayStats = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const txs = dayTransactions[day] || [];
    const income = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = Math.abs(txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0));
    return { day, income, expense };
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <button onClick={handlePrevMonth} className="w-10 h-10 rounded-xl bg-[#1B2130] flex items-center justify-center hover:bg-white/10 transition-colors">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-xl font-semibold text-white">{currentMonthStr}</h2>
        <button onClick={handleNextMonth} className="w-10 h-10 rounded-xl bg-[#1B2130] flex items-center justify-center hover:bg-white/10 transition-colors">
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-xs text-white/50 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Days */}
          {dayStats.map((stat) => {
            const hasIncome = stat.income > 0;
            const hasExpense = stat.expense > 0;
            const isSelected = selectedDay === stat.day;

            return (
              <button
                key={stat.day}
                onClick={() => setSelectedDay(stat.day)}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-colors ${
                  isSelected
                    ? "bg-[#7C5CFF] text-white"
                    : "bg-[#0D0F14] text-white/70 hover:bg-[#0D0F14]/70"
                }`}
              >
                <span className="text-sm font-medium">{stat.day}</span>
                <div className="flex gap-0.5 mt-1">
                  {hasIncome && (
                    <div className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[#22C55E]"}`} />
                  )}
                  {hasExpense && (
                    <div className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-[#EF4444]"}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            {baseDate.toLocaleString('en-US', { month: 'long' })} {selectedDay}, {year}
          </h3>

          <div className="space-y-3 mb-4">
            {(!dayTransactions[selectedDay] || dayTransactions[selectedDay].length === 0) ? (
              <div className="text-center py-6 bg-[#1B2130] rounded-xl border border-white/5">
                <p className="text-sm text-white/50">No transactions this day</p>
              </div>
            ) : (
              dayTransactions[selectedDay].map((tx: any, i: number) => {
                const amt = Number(tx.amount);
                const isIncome = tx.type === "income";
                return (
                  <div
                    key={tx.id || i}
                    className="flex items-center justify-between p-4 bg-[#1B2130] rounded-xl border border-white/5"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{tx.title || "Transaction"}</p>
                      <p className="text-xs text-white/50 capitalize">{tx.type} {tx.category?.name ? `• ${tx.category.name}` : ''}</p>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        isIncome ? "text-[#22C55E]" : "text-white"
                      }`}
                    >
                      {isIncome ? "+" : ""}{formatCurrency(Math.abs(amt))}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Day Summary */}
          {dayTransactions[selectedDay] && dayTransactions[selectedDay].length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#22C55E]/10 border border-[#22C55E]/30 rounded-xl p-4">
                <p className="text-xs text-white/50 mb-1">Income</p>
                <p className="text-xl font-bold text-[#22C55E]">{formatCurrency(dayStats[selectedDay - 1]?.income || 0)}</p>
              </div>
              <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl p-4">
                <p className="text-xs text-white/50 mb-1">Expense</p>
                <p className="text-xl font-bold text-[#EF4444]">{formatCurrency(dayStats[selectedDay - 1]?.expense || 0)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
