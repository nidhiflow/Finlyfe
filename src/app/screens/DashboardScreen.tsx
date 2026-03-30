import { useState } from "react";
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar, Award, Utensils, Car, Zap, ArrowUpDown, Repeat, AlertCircle } from "lucide-react";
import { BalanceCard } from "../components/BalanceCard";
import { SpendingOverview } from "../components/SpendingOverview";

export function DashboardScreen() {
  const [dateMode, setDateMode] = useState<"month" | "custom">("month");
  const [currentMonth, setCurrentMonth] = useState("March 2026");

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Good Morning, PG</h1>
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
          <p className="text-2xl font-bold text-[#22C55E] mb-1">₹52,000</p>
          <div className="flex items-center gap-1 text-xs text-[#22C55E]">
            <TrendingUp className="w-3 h-3" />
            <span>+12.5%</span>
          </div>
        </div>

        <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
          <p className="text-xs text-white/50 mb-1">Expense</p>
          <p className="text-2xl font-bold text-[#EF4444] mb-1">₹18,700</p>
          <div className="flex items-center gap-1 text-xs text-[#EF4444]">
            <TrendingDown className="w-3 h-3" />
            <span>-5.2%</span>
          </div>
        </div>

        <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
          <p className="text-xs text-white/50 mb-1">Net Balance</p>
          <p className="text-2xl font-bold text-white mb-1">₹33,300</p>
          <p className="text-xs text-white/50">This month</p>
        </div>

        <div className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
          <p className="text-xs text-white/50 mb-1">Total Savings</p>
          <p className="text-2xl font-bold text-white mb-1">₹2.4L</p>
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
            <p className="text-4xl font-bold text-white">78</p>
            <p className="text-sm text-white/60">/100</p>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#7C5CFF] to-[#4CC9F0] rounded-full" style={{ width: "78%" }}></div>
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
                <p className="text-white font-medium mb-1">Great progress!</p>
                <p className="text-sm text-white/60">
                  You spent ₹2,400 less this month compared to February
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
                <p className="text-white font-medium mb-1">Top Category: Food</p>
                <p className="text-sm text-white/60">
                  ₹8,200 spent on dining (44% of total expenses)
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
                  March 15 - ₹3,200 (Weekend shopping)
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
              You've used 82% of your Food budget (₹8,200 of ₹10,000)
            </p>
          </div>
          <button className="text-xs text-white/50 hover:text-white/70">Dismiss</button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Recent</h3>
          <button className="text-sm text-[#7C5CFF] font-medium">View All</button>
        </div>

        <div className="space-y-1">
          {[
            { icon: Utensils, name: "Swiggy", subtitle: "Today, 2:30 PM", amount: -450, color: "#FF6B6B" },
            { icon: Car, name: "Uber", subtitle: "Today, 9:15 AM", amount: -320, color: "#4CC9F0" },
            { icon: Zap, name: "Electricity", subtitle: "Yesterday", amount: -1250, color: "#FFA500" },
          ].map((tx, i) => {
            const Icon = tx.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#1B2130] border border-white/5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tx.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: tx.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{tx.name}</p>
                  <p className="text-xs text-white/50">{tx.subtitle}</p>
                </div>
                <p className="text-sm font-semibold text-white">₹{Math.abs(tx.amount)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Recurring */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Upcoming Recurring</h3>
        <div className="space-y-2">
          {[
            { name: "Netflix", date: "Apr 1", amount: 199 },
            { name: "Gym Membership", date: "Apr 5", amount: 2000 },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#1B2130] border border-white/5">
              <Repeat className="w-5 h-5 text-[#7C5CFF]" />
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="text-xs text-white/50">{item.date}</p>
              </div>
              <p className="text-sm font-semibold text-white">₹{item.amount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Accounts Preview */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Accounts</h3>
          <button className="text-sm text-[#7C5CFF] font-medium">View All</button>
        </div>
        <div className="bg-[#1B2130] rounded-2xl p-5 border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-white/50">Net Worth</p>
            <p className="text-2xl font-bold text-white">₹5,42,300</p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">HDFC Savings</span>
              <span className="text-sm text-white font-medium">₹2,40,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">ICICI Credit</span>
              <span className="text-sm text-[#EF4444] font-medium">-₹15,200</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
