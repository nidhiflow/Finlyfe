import { useState } from "react";
import { Plus, ChevronRight, Edit, Trash2 } from "lucide-react";

export function CategoriesScreen() {
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [showAddModal, setShowAddModal] = useState(false);

  const expenseCategories = [
    {
      id: 1,
      name: "Food & Dining",
      icon: "🍔",
      color: "#7C5CFF",
      subcategories: ["Restaurants", "Groceries", "Fast Food"],
      count: 45,
    },
    {
      id: 2,
      name: "Transport",
      icon: "🚗",
      color: "#4CC9F0",
      subcategories: ["Uber", "Petrol", "Public Transport"],
      count: 28,
    },
    {
      id: 3,
      name: "Bills & Utilities",
      icon: "⚡",
      color: "#FFA500",
      subcategories: ["Electricity", "Water", "Internet"],
      count: 12,
    },
    {
      id: 4,
      name: "Shopping",
      icon: "🛍️",
      color: "#FF6B6B",
      subcategories: ["Clothes", "Electronics", "Others"],
      count: 18,
    },
  ];

  const incomeCategories = [
    {
      id: 1,
      name: "Salary",
      icon: "💼",
      color: "#22C55E",
      subcategories: ["Monthly Salary", "Bonus"],
      count: 2,
    },
    {
      id: 2,
      name: "Freelance",
      icon: "💻",
      color: "#4CC9F0",
      subcategories: ["Projects", "Consulting"],
      count: 5,
    },
  ];

  const categories = activeTab === "expense" ? expenseCategories : incomeCategories;

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[#1B2130] rounded-xl">
        <button
          onClick={() => setActiveTab("expense")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "expense" ? "bg-[#EF4444] text-white" : "text-white/50"
          }`}
        >
          Expense
        </button>
        <button
          onClick={() => setActiveTab("income")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "income" ? "bg-[#22C55E] text-white" : "text-white/50"
          }`}
        >
          Income
        </button>
      </div>

      {/* Add Category Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl text-white font-semibold shadow-lg shadow-[#7C5CFF]/30"
      >
        <Plus className="w-5 h-5" />
        <span>Add Category</span>
      </button>

      {/* Categories List */}
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{category.name}</h3>
                <p className="text-xs text-white/50">{category.count} transactions</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center">
                  <Edit className="w-4 h-4 text-white/70" />
                </button>
                <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-[#EF4444]" />
                </button>
              </div>
            </div>

            {/* Subcategories */}
            {category.subcategories.length > 0 && (
              <div className="space-y-2 pl-3 border-l-2 border-white/10 ml-6">
                {category.subcategories.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <p className="text-sm text-white/70">{sub}</p>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sync Defaults */}
      <button className="w-full py-3.5 bg-[#1B2130] border border-white/10 rounded-xl text-white font-medium hover:border-[#7C5CFF]/30">
        Sync Default Categories
      </button>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative max-w-md mx-auto w-full bg-[#1B2130] rounded-t-3xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">Add Category</h2>
            
            <div>
              <label className="text-sm text-white/70 mb-2 block">Name</label>
              <input
                type="text"
                placeholder="Category name"
                className="w-full px-4 py-3 bg-[#0D0F14] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-[#7C5CFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-white/70 mb-2 block">Icon</label>
              <div className="grid grid-cols-6 gap-2">
                {["🍔", "🚗", "⚡", "🛍️", "🏥", "🎓", "🎮", "✈️"].map((emoji) => (
                  <button
                    key={emoji}
                    className="w-12 h-12 rounded-xl bg-[#0D0F14] border border-white/10 flex items-center justify-center text-2xl hover:border-[#7C5CFF]/30"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70 mb-2 block">Color</label>
              <div className="flex gap-2">
                {["#7C5CFF", "#4CC9F0", "#22C55E", "#FFA500", "#EF4444", "#FF6B6B"].map((color) => (
                  <button
                    key={color}
                    className="w-10 h-10 rounded-xl border-2 border-white/20"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-[#0D0F14] border border-white/10 rounded-xl text-white font-medium"
              >
                Cancel
              </button>
              <button className="flex-1 py-3 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl text-white font-semibold">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
