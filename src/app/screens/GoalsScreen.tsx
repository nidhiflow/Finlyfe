import { useState, useEffect } from "react";
import { Plus, Target, TrendingUp, Calendar, Target as TargetIcon } from "lucide-react";
import { savingsGoalsAPI } from "../services/api";

export function GoalsScreen() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      const data = await savingsGoalsAPI.list();
      if (data) setGoals(data);
    } catch (err) {
      console.error("Failed to load goals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  const handleRecordSavings = async (id: string) => {
    try {
      await savingsGoalsAPI.recordSavings(id, 100); // Add 100 as demo
      fetchGoals();
    } catch (err) {
      console.error("Failed to record savings", err);
    }
  };

  const totalTarget = goals.reduce((sum, g) => sum + (Number(g.targetAmount) || 0), 0);
  const totalSaved = goals.reduce((sum, g) => sum + (Number(g.currentAmount) || 0), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Overall Progress */}
      <div className="bg-gradient-to-br from-[#7C5CFF] to-[#4CC9F0] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-white" />
          <h2 className="text-xl font-semibold text-white">Total Progress</h2>
        </div>

        <p className="text-4xl font-bold text-white mb-2">
          {overallProgress.toFixed(0)}%
        </p>
        <p className="text-white/80 text-sm mb-4">
          {formatCurrency(totalSaved)} of {formatCurrency(totalTarget)}
        </p>

        <div className="bg-white/20 backdrop-blur-sm rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Add Goal Button */}
      <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl text-white font-semibold shadow-lg shadow-[#7C5CFF]/30">
        <Plus className="w-5 h-5" />
        <span>Add New Goal</span>
      </button>

      {/* Goals List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Your Goals</h3>
        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-8">
               <p className="text-sm text-white/50">Loading goals...</p>
             </div>
          ) : goals.length === 0 ? (
             <div className="text-center py-8 bg-[#1B2130] rounded-2xl border border-white/5">
                <TargetIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/50">No goals created yet.</p>
             </div>
          ) : goals.map((goal) => {
            const target = Number(goal.targetAmount) || 0;
            const saved = Number(goal.currentAmount) || 0;
            const progress = target > 0 ? (saved / target) * 100 : 0;
            const remaining = target - saved;
            const color = goal.color || "#7C5CFF";
            const isFinished = progress >= 100;

            let formattedDate = "No date";
            if (goal.deadline) {
              const d = new Date(goal.deadline);
              formattedDate = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
            }

            return (
              <div
                key={goal.id}
                className="bg-[#1B2130] rounded-2xl p-5 border border-white/5"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      {goal.icon ? (
                        goal.icon.startsWith("http") ? <img src={goal.icon} className="w-6 h-6 object-contain" alt="" /> : goal.icon
                      ) : "🎯"}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{goal.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-white/50" />
                        <p className="text-xs text-white/50">{formattedDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{Math.min(progress, 100).toFixed(0)}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/10 rounded-full h-2.5 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: color }}
                  />
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-white/70">
                    {formatCurrency(saved)} saved
                  </span>
                  <span className="text-white/70">
                    {remaining > 0 ? `${formatCurrency(remaining)} to go` : "Complete!"}
                  </span>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleRecordSavings(goal.id)}
                  disabled={isFinished}
                  className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors opacity-100 disabled:opacity-50"
                  style={{
                    backgroundColor: `${color}20`,
                    color: color,
                  }}
                >
                  {isFinished ? "✓ Goal Met" : "+ Add ₹100 Shortcut"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Stats */}
      <div className="bg-[#1B2130] rounded-2xl p-5 border border-white/5">
        <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Active Goals</span>
            <span className="text-white font-semibold">{goals.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Avg. Progress</span>
            <span className="text-white font-semibold">{overallProgress.toFixed(0)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">Monthly Contribution</span>
            <span className="text-white font-semibold">₹12,500</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">On Track Goals</span>
            <span className="text-[#22C55E] font-semibold">3 of 4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
