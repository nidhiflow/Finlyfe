import { useState } from "react";
import { Plus, Target, TrendingUp, Calendar } from "lucide-react";

export function GoalsScreen() {
  const goals = [
    {
      id: 1,
      name: "Emergency Fund",
      emoji: "🏥",
      target: 100000,
      saved: 45000,
      targetMonth: "Dec 2026",
      color: "#7C5CFF",
      trackingMode: "Manual",
    },
    {
      id: 2,
      name: "Vacation to Bali",
      emoji: "✈️",
      target: 80000,
      saved: 62000,
      targetMonth: "Jun 2026",
      color: "#4CC9F0",
      trackingMode: "Auto",
    },
    {
      id: 3,
      name: "New Laptop",
      emoji: "💻",
      target: 120000,
      saved: 28000,
      targetMonth: "Aug 2026",
      color: "#22C55E",
      trackingMode: "Manual",
    },
    {
      id: 4,
      name: "Down Payment - Car",
      emoji: "🚗",
      target: 200000,
      saved: 85000,
      targetMonth: "Mar 2027",
      color: "#FFA500",
      trackingMode: "Auto",
    },
  ];

  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.saved, 0);
  const overallProgress = (totalSaved / totalTarget) * 100;

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
          ₹{totalSaved.toLocaleString()} of ₹{totalTarget.toLocaleString()}
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
          {goals.map((goal) => {
            const progress = (goal.saved / goal.target) * 100;
            const remaining = goal.target - goal.saved;

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
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      {goal.emoji}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{goal.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-white/50" />
                        <p className="text-xs text-white/50">{goal.targetMonth}</p>
                        <span className="text-white/30">•</span>
                        <p className="text-xs text-white/50">{goal.trackingMode}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{progress.toFixed(0)}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/10 rounded-full h-2.5 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${progress}%`, backgroundColor: goal.color }}
                  />
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-white/70">
                    ₹{goal.saved.toLocaleString()} saved
                  </span>
                  <span className="text-white/70">
                    ₹{remaining.toLocaleString()} to go
                  </span>
                </div>

                {/* Action Button */}
                <button
                  className="w-full py-2.5 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: `${goal.color}20`,
                    color: goal.color,
                  }}
                >
                  + Record Savings
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
