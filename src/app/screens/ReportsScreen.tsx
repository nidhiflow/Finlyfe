import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { statsAPI } from "../services/api";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function ReportsScreen() {
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [summary, setSummary] = useState<any>(null);
  const [byCategory, setByCategory] = useState<any[]>([]);
  const [tab, setTab] = useState<"expense" | "income">("expense");

  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumData, catData] = await Promise.all([
        statsAPI.summary({ month: monthKey }).catch(() => null),
        statsAPI.byCategory({ month: monthKey, type: tab }).catch(() => []),
      ]);
      setSummary(sumData);
      setByCategory(Array.isArray(catData) ? catData : []);
    } catch {} finally { setLoading(false); }
  }, [monthKey, tab]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalAmount = byCategory.reduce((s, c) => s + (c.total || c.amount || 0), 0);

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Month Nav */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
          className="w-9 h-9 rounded-lg bg-[#1B2130] flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <span className="text-sm text-white font-semibold">{monthLabel}</span>
        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
          className="w-9 h-9 rounded-lg bg-[#1B2130] flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-white/50 mb-1">Income</p>
            <p className="text-xl font-bold text-[#22C55E]">{formatCurrency(summary.total_income || 0)}</p>
            <div className="flex items-center gap-1 text-xs text-[#22C55E] mt-1">
              <TrendingUp className="w-3 h-3" /><span>This month</span>
            </div>
          </div>
          <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
            <p className="text-xs text-white/50 mb-1">Expense</p>
            <p className="text-xl font-bold text-[#EF4444]">{formatCurrency(summary.total_expense || 0)}</p>
            <div className="flex items-center gap-1 text-xs text-[#EF4444] mt-1">
              <TrendingDown className="w-3 h-3" /><span>This month</span>
            </div>
          </div>
        </div>
      )}

      {/* Type Tabs */}
      <div className="flex gap-2 p-1 bg-[#1B2130] rounded-xl">
        <button onClick={() => setTab("expense")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${tab === "expense" ? "bg-[#EF4444] text-white" : "text-white/50"}`}>
          Expenses
        </button>
        <button onClick={() => setTab("income")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${tab === "income" ? "bg-[#22C55E] text-white" : "text-white/50"}`}>
          Income
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#7C5CFF] animate-spin" />
        </div>
      ) : (
        <>
          {/* Visual Pie-like Breakdown */}
          {byCategory.length > 0 && (
            <div className="bg-[#1B2130] rounded-2xl p-5 border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-4">
                {tab === "expense" ? "Expense" : "Income"} Breakdown
              </h3>
              {/* Horizontal stacked bar */}
              <div className="h-4 rounded-full overflow-hidden flex mb-4">
                {byCategory.map((cat, i) => {
                  const pct = totalAmount > 0 ? ((cat.total || cat.amount || 0) / totalAmount) * 100 : 0;
                  const colors = ["#7C5CFF", "#4CC9F0", "#22C55E", "#FFA500", "#EF4444", "#E91E63", "#FF6B6B", "#00BCD4"];
                  return (
                    <div
                      key={i}
                      style={{ width: `${pct}%`, backgroundColor: cat.color || colors[i % colors.length] }}
                      className="h-full"
                    />
                  );
                })}
              </div>

              {/* Category list */}
              <div className="space-y-3">
                {byCategory.map((cat, i) => {
                  const amount = cat.total || cat.amount || 0;
                  const pct = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
                  const colors = ["#7C5CFF", "#4CC9F0", "#22C55E", "#FFA500", "#EF4444", "#E91E63", "#FF6B6B", "#00BCD4"];
                  const color = cat.color || colors[i % colors.length];
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white truncate">{cat.icon || ""} {cat.category_name || cat.name || "Other"}</span>
                          <span className="text-sm font-medium text-white ml-2">{formatCurrency(amount)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden mr-3">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                          </div>
                          <span className="text-xs text-white/50 w-8 text-right">{pct}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
                <span className="text-sm text-white/50">Total</span>
                <span className="text-sm font-semibold text-white">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}

          {byCategory.length === 0 && (
            <div className="text-center py-16">
              <p className="text-white/50 text-sm">No data for this period</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
