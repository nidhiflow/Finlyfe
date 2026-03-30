import { useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Bot } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const trendData = [
  { name: "Jan", income: 45000, expense: 22000 },
  { name: "Feb", income: 48000, expense: 21000 },
  { name: "Mar", income: 52000, expense: 18700 },
];

const categoryData = [
  { name: "Food", value: 8200, color: "#7C5CFF" },
  { name: "Travel", value: 4600, color: "#4CC9F0" },
  { name: "Bills", value: 3100, color: "#22C55E" },
  { name: "Other", value: 2800, color: "#EF4444" },
];

export function ReportsScreen() {
  const [dateRange, setDateRange] = useState("30d");
  const [activeTab, setActiveTab] = useState<"cashflow" | "spending" | "income" | "expense">("cashflow");

  const tabs = [
    { key: "cashflow" as const, label: "Cash Flow" },
    { key: "spending" as const, label: "Spending" },
    { key: "income" as const, label: "Income" },
    { key: "expense" as const, label: "Expense" },
  ];

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Date Range Selector */}
      <div>
        <p className="text-sm text-white/50 mb-3">Date Range</p>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
          {["7d", "30d", "90d", "YTD", "Custom"].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                dateRange === range
                  ? "bg-[#7C5CFF] text-white"
                  : "bg-[#1B2130] text-white/70 border border-white/5"
              }`}
            >
              {range === "7d" && "Last 7 Days"}
              {range === "30d" && "Last 30 Days"}
              {range === "90d" && "Last 90 Days"}
              {range === "YTD" && "Year to Date"}
              {range === "Custom" && "Custom Range"}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.key
                ? "bg-[#7C5CFF] text-white"
                : "bg-[#1B2130] text-white/70 border border-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      {activeTab === "cashflow" && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#1B2130] rounded-xl p-4 border border-white/5">
              <p className="text-xs text-white/50 mb-2">Income</p>
              <p className="text-xl font-bold text-[#22C55E]">₹52K</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-[#22C55E]" />
                <span className="text-xs text-[#22C55E]">+8%</span>
              </div>
            </div>

            <div className="bg-[#1B2130] rounded-xl p-4 border border-white/5">
              <p className="text-xs text-white/50 mb-2">Expense</p>
              <p className="text-xl font-bold text-[#EF4444]">₹18.7K</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingDown className="w-3 h-3 text-[#EF4444]" />
                <span className="text-xs text-[#EF4444]">-11%</span>
              </div>
            </div>

            <div className="bg-[#1B2130] rounded-xl p-4 border border-white/5">
              <p className="text-xs text-white/50 mb-2">Net</p>
              <p className="text-xl font-bold text-white">₹33.3K</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-[#22C55E]" />
                <span className="text-xs text-[#22C55E]">+35%</span>
              </div>
            </div>
          </div>

          {/* Cash Flow Chart */}
          <div className="bg-[#1B2130] rounded-2xl p-5 border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Cash Flow Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#ffffff40" />
                  <YAxis stroke="#ffffff40" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1B2130",
                      border: "1px solid #ffffff20",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#22C55E"
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#EF4444"
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {activeTab === "spending" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1B2130] rounded-xl p-4 border border-white/5">
              <p className="text-xs text-white/50 mb-2">Total Spent</p>
              <p className="text-2xl font-bold text-white">₹18,700</p>
            </div>
            <div className="bg-[#1B2130] rounded-xl p-4 border border-white/5">
              <p className="text-xs text-white/50 mb-2">Avg/Day</p>
              <p className="text-2xl font-bold text-white">₹623</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-[#1B2130] rounded-2xl p-5 border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">By Category</h3>
            <div className="flex items-center gap-6 mb-6">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-3">
                {categoryData.map((item) => {
                  const total = categoryData.reduce((sum, i) => sum + i.value, 0);
                  return (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm text-white/70">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">₹{item.value.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(item.value / total) * 100}%`,
                            backgroundColor: item.color,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Expenses */}
          <div className="bg-[#1B2130] rounded-2xl p-5 border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-4">Top Expenses</h3>
            <div className="space-y-3">
              {[
                { name: "Swiggy", category: "Food", amount: 450 },
                { name: "Electricity Bill", category: "Bills", amount: 1250 },
                { name: "Uber", category: "Transport", amount: 320 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-white/50">{item.category}</p>
                  </div>
                  <p className="text-sm font-semibold text-white">₹{item.amount}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* AI Summary */}
      <div className="bg-gradient-to-br from-[#7C5CFF]/20 to-[#4CC9F0]/20 border border-[#7C5CFF]/30 rounded-2xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#7C5CFF]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">AI Insights</h3>
            <p className="text-sm text-white/60">
              Your spending decreased by 11% this month. You're on track to save ₹35,000 by month end. Consider reducing food expenses to meet your savings goal faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
