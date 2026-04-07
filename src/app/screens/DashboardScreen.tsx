import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar, Award, Utensils, Car, Zap, ArrowUpDown, Repeat, AlertCircle } from "lucide-react";
import { BalanceCard } from "../components/BalanceCard";
import { SpendingOverview } from "../components/SpendingOverview";
import { statsAPI, transactionsAPI, accountsAPI, authAPI, API_BASE_URL } from "../services/api";
import { useNavigate } from "react-router";

export function DashboardScreen() {
  const navigate = useNavigate();
  const [dateMode, setDateMode] = useState<"month" | "custom">("month");
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });
  
  // API State
  const [user, setUser] = useState<{name: string} | null>(null);
  const [stats, setStats] = useState<any>({ income: 0, expenses: 0, balance: 0, savings: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [finlyScore, setFinlyScore] = useState<number>(0);
  const [insights, setInsights] = useState<any>(null);
  const [recurringTxs, setRecurringTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = authAPI.getCurrentUser();
        if (currentUser) setUser(currentUser);

        const [summaryData, scoreData, txData, accountsData, insightsData] = await Promise.all([
          statsAPI.summary(),
          statsAPI.finlyScore(),
          transactionsAPI.getAll({ limit: "5" }),
          accountsAPI.list(),
          statsAPI.insights().catch(() => null)
        ]);

        if (summaryData) setStats(summaryData);
        if (scoreData?.score != null) setFinlyScore(scoreData.score);
        if (Array.isArray(txData)) setTransactions(txData.slice(0, 3));
        if (Array.isArray(accountsData)) setAccounts(accountsData);
        if (insightsData) setInsights(insightsData);

        // Try to load recurring transactions
        try {
          const recurring = await transactionsAPI.getUpcomingRecurring();
          if (Array.isArray(recurring)) setRecurringTxs(recurring);
        } catch { /* recurring endpoint may not exist yet */ }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);
  };

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          {loading ? "Loading..." : (() => {
            const hour = new Date().getHours();
            const greet = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
            const name = user?.name;
            if (name) {
              const parts = name.trim().split(/\s+/);
              const display = parts.length > 1 ? parts[0] : parts[0];
              return `${greet}, ${display}`;
            }
            return `${greet}`;
          })()}
        </h1>
        <p className="text-sm text-white/50">Here's your money overview</p>
      </div>

      {/* Date Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDateMode("month")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateMode === "month"
                ? "bg-[#7C5CFF] text-white"
                : "bg-[#1B2130] text-white/50"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setDateMode("custom")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateMode === "custom"
                ? "bg-[#7C5CFF] text-white"
                : "bg-[#1B2130] text-white/50"
            }`}
          >
            Custom
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 rounded-lg bg-[#1B2130] flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <span className="text-sm text-white font-medium min-w-24 text-center">{currentMonth}</span>
          <button className="w-8 h-8 rounded-lg bg-[#1B2130] flex items-center justify-center">
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Today Button */}
      <button className="w-full py-2.5 bg-[#1B2130] border border-white/10 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2">
        <Calendar className="w-4 h-4" />
        Jump to Today
      </button>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
          <p className="text-xs text-white/50 mb-1">Income</p>
          <p className="text-2xl font-bold text-[#22C55E] mb-1">{formatCurrency(stats.income)}</p>
          <div className="flex items-center gap-1 text-xs text-[#22C55E]">
            <TrendingUp className="w-3 h-3" />
            <span>{insights?.expenseChange != null ? `${Math.abs(insights.expenseChange)}% vs last month` : '+0%'}</span>
          </div>
        </div>

        <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
          <p className="text-xs text-white/50 mb-1">Expense</p>
          <p className="text-2xl font-bold text-[#EF4444] mb-1">{formatCurrency(stats.expenses)}</p>
          <div className="flex items-center gap-1 text-xs text-[#EF4444]">
            <TrendingDown className="w-3 h-3" />
            <span>{insights?.expenseChange != null ? `${insights.expenseChange > 0 ? '+' : ''}${insights.expenseChange}%` : '-0%'}</span>
          </div>
        </div>

        <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
          <p className="text-xs text-white/50 mb-1">Net Balance</p>
          <p className="text-2xl font-bold text-white mb-1">{formatCurrency(stats.balance)}</p>
          <p className="text-xs text-white/50">This month</p>
        </div>

        <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
          <p className="text-xs text-white/50 mb-1">Total Savings</p>
          <p className="text-2xl font-bold text-white mb-1">{formatCurrency(stats.savings)}</p>
          <p className="text-xs text-white/50">All accounts</p>
        </div>
      </div>

      {/* Finly Score */}
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
            <p className="text-4xl font-bold text-white">{finlyScore}</p>
            <p className="text-sm text-white/60">/100</p>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#7C5CFF] to-[#4CC9F0] rounded-full" style={{ width: `${finlyScore}%` }}></div>
        </div>
      </div>

      {/* Insights */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Insights</h3>
        <div className="space-y-3">
          <div className="bg-[#1B2130] rounded-xl p-4 border border-white/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#22C55E]/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-[#22C55E]" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium mb-1">{insights?.expenseChange != null && insights.expenseChange <= 0 ? 'Great progress!' : insights?.expenseChange != null ? 'Spending increased' : 'Track your spending'}</p>
                <p className="text-sm text-white/60">
                  {insights?.expenseChange != null
                    ? (insights.expenseChange <= 0 ? `You spent ${Math.abs(insights.expenseChange)}% less this month` : `Spending is up ${insights.expenseChange}% compared to last month`)
                    : 'Add transactions to see spending trends'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1B2130] rounded-xl p-4 border border-white/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/20 flex items-center justify-center flex-shrink-0">
                <Utensils className="w-5 h-5 text-[#7C5CFF]" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium mb-1">Top Category: {insights?.topCategory?.name || 'N/A'}</p>
                <p className="text-sm text-white/60">
                  {insights?.topCategory ? `${insights.topCategory.pct}% of your total expenses` : 'No expense data yet'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1B2130] rounded-xl p-4 border border-white/5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4CC9F0]/20 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-[#4CC9F0]" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium mb-1">Highest Spend Day</p>
                <p className="text-sm text-white/60">
                  {insights?.highestSpendDay
                    ? `${new Date(insights.highestSpendDay.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} \u2014 ${formatCurrency(insights.highestSpendDay.amount)}`
                    : 'No spending data yet'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow & Category */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
        <BalanceCard />
      </div>

      <SpendingOverview />

      {/* Budget Alerts */}
      <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-white font-medium mb-1">Budget Alert</p>
            <p className="text-sm text-white/60">
              {insights?.budgetAlert || "You've used 82% of your Food budget (₹8,200 of ₹10,000)"}
            </p>
          </div>
          <button className="text-xs text-white/50 hover:text-white/70">Dismiss</button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Recent</h3>
          <button onClick={() => navigate("/dashboard/transactions")} className="text-sm text-[#7C5CFF] font-medium">View All</button>
        </div>

        <div className="space-y-1">
          {transactions.length > 0 ? transactions.map((tx, i) => {
            const isExpense = tx.type === "expense";
            const color = isExpense ? "#FF6B6B" : "#22C55E";
            
            // Get category icon placeholder if available
            return (
              <div key={tx.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-[#1B2130] border border-white/5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center p-2" style={{ backgroundColor: `${color}20` }}>
                  {tx.category?.icon ? (
                    <img src={tx.category.icon.startsWith('http') ? tx.category.icon : `${API_BASE_URL}${tx.category.icon}`} className="w-6 h-6 object-contain" alt="" />
                  ) : (
                    <ArrowUpDown className="w-5 h-5" style={{ color: color }} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{tx.title || "Transaction"}</p>
                  <p className="text-xs text-white/50">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
                <p className={`text-sm font-semibold ${isExpense ? 'text-white' : 'text-[#22C55E]'}`}>
                  {isExpense ? "-" : "+"}{formatCurrency(tx.amount)}
                </p>
              </div>
            );
          }) : (
            <div className="text-center py-6 bg-[#1B2130] rounded-xl border border-white/5">
              <p className="text-sm text-white/50">No recent transactions</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Recurring */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Upcoming Recurring</h3>
        <div className="space-y-2">
          {recurringTxs.length > 0 ? recurringTxs.map((item, i) => (
            <div key={item.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-[#1B2130] border border-white/5">
              <Repeat className="w-5 h-5 text-[#7C5CFF]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{item.title || item.name}</p>
                <p className="text-xs text-white/50">{new Date(item.next_date || item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
              </div>
              <p className="text-sm font-semibold text-white">{formatCurrency(item.amount)}</p>
            </div>
          )) : (
            <div className="text-center py-4 bg-[#1B2130] rounded-xl border border-white/5">
              <p className="text-sm text-white/50">No upcoming recurring transactions</p>
            </div>
          )}
        </div>
      </div>

      {/* Accounts Preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Accounts</h3>
          <button onClick={() => navigate("/dashboard/accounts")} className="text-sm text-[#7C5CFF] font-medium">View All</button>
        </div>
        <div className="bg-[#1B2130] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-white/50">Total Balance</p>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0))}
            </p>
          </div>
          <div className="space-y-3">
            {accounts.slice(0, 3).map((acc) => (
              <div key={acc.id} className="flex items-center justify-between">
                <span className="text-sm text-white/70">{acc.name}</span>
                <span className={`text-sm font-medium ${Number(acc.balance) < 0 ? 'text-[#EF4444]' : 'text-white'}`}>
                  {formatCurrency(acc.balance)}
                </span>
              </div>
            ))}
            {accounts.length === 0 && (
              <p className="text-sm text-white/50 text-center py-2">No accounts added</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
