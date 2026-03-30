import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, AlertCircle, Bot, TrendingUp, Landmark } from "lucide-react";
import { budgetsAPI } from "../services/api";

export function BudgetScreen() {
  const [currentMonth, setCurrentMonth] = useState("March 2026");
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await budgetsAPI.list();
        if (data) setBudgets(data);
      } catch (err) {
        console.error("Failed to fetch budgets", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  const getBudgetValue = (b: any) => Number(b.amount) || Number(b.budgeted) || 0;
  const getSpentValue = (b: any) => Number(b.spent) || 0;
  const getCatName = (b: any) => typeof b.category === "string" ? b.category : (b.category?.name || "Category");
  const getCatColor = (b: any) => typeof b.category !== "string" && b.category?.color ? b.category.color : (b.color || "#7C5CFF");
  const getCatEmoji = (b: any) => typeof b.category !== "string" && b.category?.icon ? b.category.icon : (b.emoji || "📊");

  const totalBudgeted = budgets.reduce((sum, b) => sum + getBudgetValue(b), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + getSpentValue(b), 0);
  const budgetLeft = totalBudgeted - totalSpent;
  const percentUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  // Find pressure category gracefully
  const pressureCategory = budgets.length > 0 ? budgets.reduce((prev, current) => {
    const prevPercent = prev ? (getSpentValue(prev) / (getBudgetValue(prev) || 1)) * 100 : -1;
    const currentPercent = (getSpentValue(current) / (getBudgetValue(current) || 1)) * 100;
    return currentPercent > prevPercent ? current : prev;
  }, budgets[0]) : null;

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <button className="w-10 h-10 rounded-xl bg-[#1B2130] flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-xl font-semibold text-white">{currentMonth}</h2>
        <button className="w-10 h-10 rounded-xl bg-[#1B2130] flex items-center justify-center">
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Budget Summary */}
      <div className="bg-gradient-to-br from-[#7C5CFF] to-[#4CC9F0] rounded-2xl p-6">
        <h3 className="text-white/80 text-sm mb-2">Budget Remaining</h3>
        <p className="text-4xl font-bold text-white mb-4">{formatCurrency(budgetLeft)}</p>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-full h-3 overflow-hidden mb-3">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-sm text-white/80">
          <span>{formatCurrency(totalSpent)} spent</span>
          <span>{formatCurrency(totalBudgeted)} budgeted</span>
        </div>
      </div>

      {/* Pressure Category Alert */}
      {pressureCategory && getBudgetValue(pressureCategory) > 0 && (getSpentValue(pressureCategory) / getBudgetValue(pressureCategory)) * 100 > 75 && (
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium mb-1">Pressure Alert</p>
              <p className="text-sm text-white/60">
                {getCatName(pressureCategory)} is at{" "}
                {((getSpentValue(pressureCategory) / getBudgetValue(pressureCategory)) * 100).toFixed(0)}% 
                ({formatCurrency(getSpentValue(pressureCategory))} of {formatCurrency(getBudgetValue(pressureCategory))})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Budget Suggestions */}
      <div className="bg-gradient-to-br from-[#7C5CFF]/20 to-[#4CC9F0]/20 border border-[#7C5CFF]/30 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#7C5CFF]/30 flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#7C5CFF]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">AI Suggestions</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li className="flex items-start gap-2">
                <span className="text-[#7C5CFF]">•</span>
                <span>Based on last month, increase Transport budget by ₹1,000</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#7C5CFF]">•</span>
                <span>You're doing great with Bills! Consider allocating ₹900 to savings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#7C5CFF]">•</span>
                <span>Shopping trend shows you can reduce budget to ₹4,500</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Add Budget Button */}
      <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl text-white font-semibold shadow-lg shadow-[#7C5CFF]/30">
        <Plus className="w-5 h-5" />
        <span>Add Budget</span>
      </button>

      {/* Budget List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Category Budgets</h3>
        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-8">
               <p className="text-sm text-white/50">Loading budgets...</p>
             </div>
          ) : budgets.length === 0 ? (
             <div className="text-center py-8 bg-[#1B2130] rounded-2xl border border-white/5">
                <Landmark className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/50">No budgets created yet.</p>
             </div>
          ) : (
            budgets.map((budget) => {
              const bgVal = getBudgetValue(budget);
              const spVal = getSpentValue(budget);
              const percentSpent = bgVal > 0 ? (spVal / bgVal) * 100 : 0;
              const remaining = bgVal - spVal;
              const isOverBudget = percentSpent > 100;
              const isPressure = percentSpent > 75;
              const name = getCatName(budget);
              const color = getCatColor(budget);
              const emoji = getCatEmoji(budget);

              return (
                <div
                  key={budget.id || name}
                  className={`bg-[#1B2130] rounded-2xl p-5 border ${
                    isOverBudget
                      ? "border-[#EF4444]/50"
                      : isPressure
                      ? "border-[#FFA500]/50"
                      : "border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{emoji?.startsWith('http') ? <img src={emoji} className="w-6 h-6 object-contain" alt="" /> : emoji}</span>
                      <div>
                        <h4 className="text-white font-semibold">{name}</h4>
                        <p className="text-xs text-white/50">
                          {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        {formatCurrency(spVal)}
                      </p>
                      <p className="text-xs text-white/50">
                        of {formatCurrency(bgVal)}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-full h-2.5 overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(percentSpent, 100)}%`,
                        backgroundColor: isOverBudget ? "#EF4444" : isPressure ? "#FFA500" : color,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className={isOverBudget ? "text-[#EF4444]" : isPressure ? "text-[#FFA500]" : "text-white/50"}>
                      {percentSpent.toFixed(0)}% used
                    </span>
                    {isPressure && !isOverBudget && (
                      <span className="text-[#FFA500]">⚠️ High usage</span>
                    )}
                    {isOverBudget && (
                      <span className="text-[#EF4444]">❌ Over budget</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
