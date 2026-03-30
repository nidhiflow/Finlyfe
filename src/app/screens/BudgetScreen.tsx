import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Trash2, Pencil, X, ChevronLeft, ChevronRight } from "lucide-react";
import { budgetsAPI, categoriesAPI } from "../services/api";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BudgetScreen() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const monthLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetData, catData] = await Promise.all([
        budgetsAPI.list({ month: monthKey }).catch(() => []),
        categoriesAPI.list().catch(() => []),
      ]);
      setBudgets(Array.isArray(budgetData) ? budgetData : []);
      setCategories(Array.isArray(catData) ? catData.filter((c: any) => c.type === "expense") : []);
    } catch {}
    finally { setLoading(false); }
  }, [monthKey]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalBudget = budgets.reduce((s, b) => s + (b.amount || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);

  const openAdd = () => {
    setEditId(null);
    setFormCategoryId("");
    setFormAmount("");
    setError("");
    setShowForm(true);
  };

  const openEdit = (b: any) => {
    setEditId(String(b.id));
    setFormCategoryId(String(b.category_id || ""));
    setFormAmount(String(b.amount || ""));
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formCategoryId) { setError("Select a category"); return; }
    if (!formAmount || parseFloat(formAmount) <= 0) { setError("Enter a valid amount"); return; }
    setSaving(true);
    setError("");
    try {
      const data = { category_id: formCategoryId, amount: parseFloat(formAmount), month: monthKey };
      if (editId) {
        await budgetsAPI.update(editId, data);
      } else {
        await budgetsAPI.create(data);
      }
      setShowForm(false);
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this budget?")) return;
    try { await budgetsAPI.delete(id); loadData(); } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#7C5CFF] animate-spin" />
      </div>
    );
  }

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

      {/* Summary */}
      <div className="bg-[#1B2130] rounded-2xl p-5 border border-white/5">
        <div className="flex justify-between mb-3">
          <div>
            <p className="text-xs text-white/50">Total Budget</p>
            <p className="text-xl font-bold text-white">{formatCurrency(totalBudget)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/50">Spent</p>
            <p className={`text-xl font-bold ${totalSpent > totalBudget ? "text-[#EF4444]" : "text-[#22C55E]"}`}>
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${totalSpent > totalBudget ? "bg-[#EF4444]" : "bg-gradient-to-r from-[#7C5CFF] to-[#4CC9F0]"}`}
            style={{ width: `${Math.min((totalSpent / (totalBudget || 1)) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-white/50 mt-2">
          {formatCurrency(Math.max(totalBudget - totalSpent, 0))} remaining
        </p>
      </div>

      {/* Add */}
      <button onClick={openAdd}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#1B2130] border border-dashed border-white/20 rounded-xl text-white/70 hover:border-[#7C5CFF]/50 transition-colors">
        <Plus className="w-5 h-5" />
        <span className="text-sm font-medium">Add Budget</span>
      </button>

      {/* Budget List */}
      <div className="space-y-3">
        {budgets.map((b) => {
          const pct = b.amount > 0 ? Math.round((b.spent / b.amount) * 100) : 0;
          const exceeded = b.spent > b.amount;
          return (
            <div key={b.id} className="bg-[#1B2130] rounded-xl p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{b.category_icon || "📁"}</span>
                  <span className="text-sm font-medium text-white">{b.category_name || "Budget"}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${exceeded ? "bg-[#EF4444]/20 text-[#EF4444]" : "bg-[#7C5CFF]/20 text-[#7C5CFF]"}`}>
                    {pct}%
                  </span>
                  <button onClick={() => openEdit(b)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5">
                    <Pencil className="w-3 h-3 text-white/40" />
                  </button>
                  <button onClick={() => handleDelete(String(b.id))} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5">
                    <Trash2 className="w-3 h-3 text-[#EF4444]/60" />
                  </button>
                </div>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full ${exceeded ? "bg-[#EF4444]" : "bg-[#7C5CFF]"}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-white/50">
                <span>{formatCurrency(b.spent)} spent</span>
                <span>{formatCurrency(b.amount)} budget</span>
              </div>
            </div>
          );
        })}
        {budgets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/50 text-sm">No budgets set for this month</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md bg-[#1B2130] rounded-t-3xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{editId ? "Edit Budget" : "Add Budget"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-white/50" /></button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div>
              <label className="text-sm text-white/70 mb-2 block">Category</label>
              <select value={formCategoryId} onChange={(e) => setFormCategoryId(e.target.value)}
                className="w-full px-4 py-3 bg-[#0D0F14] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none">
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-white/70 mb-2 block">Budget Amount</label>
              <input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)}
                placeholder="0" className="w-full px-4 py-3 bg-[#0D0F14] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none" />
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl text-white font-semibold disabled:opacity-50">
              {saving ? "Saving..." : editId ? "Update" : "Add Budget"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
