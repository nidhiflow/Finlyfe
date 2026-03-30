import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Award,
  Repeat,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  authAPI,
  statsAPI,
  transactionsAPI,
  accountsAPI,
  budgetsAPI,
} from "../services/api";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function DashboardScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [summary, setSummary] = useState<any>(null);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [upcomingRecurring, setUpcomingRecurring] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<any[]>([]);
  const [finlyScore, setFinlyScore] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);

  const monthKey = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}`;

  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Load user
      const user = authAPI.getCurrentUser();
      if (user) setUserName(user.name?.split(" ")[0] || "");

      // Load all data in parallel
      const [summaryData, txData, recurringData, accountsData, budgetData, scoreData, insightsData] =
        await Promise.all([
          statsAPI.summary({ month: monthKey }).catch(() => null),
          transactionsAPI.getAll({ limit: "5", sort: "date_desc" }).catch(() => []),
          transactionsAPI.getUpcomingRecurring().catch(() => []),
          accountsAPI.list().catch(() => []),
          budgetsAPI.list({ month: monthKey }).catch(() => []),
          statsAPI.finlyScore().catch(() => null),
          statsAPI.insights().catch(() => []),
        ]);

      setSummary(summaryData);
      setRecentTx(Array.isArray(txData) ? txData.slice(0, 5) : []);
      setUpcomingRecurring(Array.isArray(recurringData) ? recurringData.slice(0, 3) : []);
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
      setFinlyScore(scoreData);
      setInsights(Array.isArray(insightsData) ? insightsData.slice(0, 3) : []);

      // Budget alerts — budgets that are >= 80% used
      const alerts = (Array.isArray(budgetData) ? budgetData : [])
        .filter((b: any) => b.amount > 0 && b.spent >= b.amount * 0.8)
        .slice(0, 2);
      setBudgetAlerts(alerts);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalIncome = summary?.total_income || 0;
  const totalExpense = summary?.total_expense || 0;
  const netBalance = totalIncome - totalExpense;
  const totalSavings = accounts.reduce(
    (sum: number, a: any) => sum + (a.balance || 0),
    0
  );

  const score = finlyScore?.score || 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#7C5CFF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          {getGreeting()}, {userName || "there"}
        </h1>
        <p className="text-sm text-white/50">Here's your money overview</p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#7C5CFF] font-medium uppercase">
          Overview
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-lg bg-[#1B2130] flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <span className="text-sm text-white font-medium min-w-24 text-center">
            {monthLabel}
          </span>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-lg bg-[#1B2130] flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
          <p className="text-xs text-white/50 mb-1">Income</p>
          <p className="text-xl font-bold text-[#22C55E] mb-1">
            {formatCurrency(totalIncome)}
          </p>
          <div className="flex items-center gap-1 text-xs text-[#22C55E]">
            <TrendingUp className="w-3 h-3" />
            <span>This month</span>
          </div>
        </div>

        <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
          <p className="text-xs text-white/50 mb-1">Expense</p>
          <p className="text-xl font-bold text-[#EF4444] mb-1">
            {formatCurrency(totalExpense)}
          </p>
          <div className="flex items-center gap-1 text-xs text-[#EF4444]">
            <TrendingDown className="w-3 h-3" />
            <span>This month</span>
          </div>
        </div>

        <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
          <p className="text-xs text-white/50 mb-1">Net Balance</p>
          <p className={`text-xl font-bold mb-1 ${netBalance >= 0 ? "text-white" : "text-[#EF4444]"}`}>
            {formatCurrency(netBalance)}
          </p>
          <p className="text-xs text-white/50">This month</p>
        </div>

        <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
          <p className="text-xs text-white/50 mb-1">Total Savings</p>
          <p className="text-xl font-bold text-white mb-1">
            {formatCurrency(totalSavings)}
          </p>
          <p className="text-xs text-white/50">All accounts</p>
        </div>
      </div>

      {/* Finly Score */}
      {score > 0 && (
        <div className="bg-gradient-to-br from-[#7C5CFF]/20 to-[#4CC9F0]/20 border border-[#7C5CFF]/30 rounded-2xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-[#7C5CFF]" />
                <h3 className="text-lg font-semibold text-white">Finly Score</h3>
              </div>
              <p className="text-sm text-white/60">Your financial health</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-white">{score}</p>
              <p className="text-sm text-white/60">/100</p>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7C5CFF] to-[#4CC9F0] rounded-full transition-all duration-500"
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Insights</h3>
          <div className="space-y-3">
            {insights.map((insight: any, i: number) => (
              <div
                key={i}
                className="bg-[#1B2130] rounded-xl p-4 border border-white/5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#7C5CFF]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">
                      {insight.title || "Insight"}
                    </p>
                    <p className="text-sm text-white/60">
                      {insight.message || insight.description || ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Alerts */}
      {budgetAlerts.length > 0 && (
        <div className="space-y-2">
          {budgetAlerts.map((b: any) => {
            const pct = Math.round((b.spent / b.amount) * 100);
            const exceeded = b.spent > b.amount;
            return (
              <div
                key={b.id}
                className={`${
                  exceeded
                    ? "bg-[#EF4444]/10 border-[#EF4444]/30"
                    : "bg-[#FFA500]/10 border-[#FFA500]/30"
                } border rounded-2xl p-4`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      exceeded ? "text-[#EF4444]" : "text-[#FFA500]"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-white font-medium mb-1">
                      {b.category_name || "Budget"} — {pct}% used
                    </p>
                    <p className="text-sm text-white/60">
                      {formatCurrency(b.spent)} of {formatCurrency(b.amount)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Recent</h3>
          <button
            onClick={() => navigate("/dashboard/transactions")}
            className="text-sm text-[#7C5CFF] font-medium"
          >
            View All
          </button>
        </div>

        {recentTx.length > 0 ? (
          <div className="space-y-1">
            {recentTx.map((tx: any) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#1B2130] border border-white/5"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
                  style={{
                    backgroundColor: tx.category_color
                      ? `${tx.category_color}20`
                      : "#7C5CFF20",
                  }}
                >
                  {tx.category_icon || (tx.type === "income" ? "💰" : "💸")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {tx.category_name || tx.type}
                  </p>
                  <p className="text-xs text-white/50 truncate">
                    {tx.note || new Date(tx.date).toLocaleDateString()}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold ${
                    tx.type === "income"
                      ? "text-[#22C55E]"
                      : tx.type === "transfer"
                      ? "text-[#4CC9F0]"
                      : "text-white"
                  }`}
                >
                  {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#1B2130] rounded-xl p-6 border border-white/5 text-center">
            <p className="text-white/50 text-sm">No transactions yet</p>
            <button
              onClick={() => navigate("/dashboard/add-transaction")}
              className="mt-2 text-sm text-[#7C5CFF] font-medium"
            >
              Add your first transaction
            </button>
          </div>
        )}
      </div>

      {/* Upcoming Recurring */}
      {upcomingRecurring.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Upcoming Recurring
          </h3>
          <div className="space-y-2">
            {upcomingRecurring.map((item: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#1B2130] border border-white/5"
              >
                <Repeat className="w-5 h-5 text-[#7C5CFF]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    {item.category_name || item.note || "Recurring"}
                  </p>
                  <p className="text-xs text-white/50">
                    {item.next_date
                      ? new Date(item.next_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : ""}
                  </p>
                </div>
                <p className="text-sm font-semibold text-white">
                  {formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accounts Preview */}
      {accounts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white">Accounts</h3>
            <button
              onClick={() => navigate("/dashboard/accounts")}
              className="text-sm text-[#7C5CFF] font-medium"
            >
              View All
            </button>
          </div>
          <div className="bg-[#1B2130] rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-white/50">Net Worth</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(totalSavings)}
              </p>
            </div>
            <div className="space-y-3">
              {accounts.slice(0, 4).map((acc: any) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-white/70">
                    {acc.name}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      acc.balance < 0 ? "text-[#EF4444]" : "text-white"
                    }`}
                  >
                    {acc.balance < 0 ? "-" : ""}
                    {formatCurrency(Math.abs(acc.balance || 0))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
