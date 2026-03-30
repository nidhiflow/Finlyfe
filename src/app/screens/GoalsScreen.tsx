import { useState, useEffect, useCallback } from "react";
import { Plus, Target, Loader2, Trash2, Pencil, X } from "lucide-react";
import { savingsGoalsAPI } from "../services/api";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

export function GoalsScreen() {
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formTarget, setFormTarget] = useState("");
  const [formCurrent, setFormCurrent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [addAmount, setAddAmount] = useState<Record<string, string>>({});

  const loadGoals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await savingsGoalsAPI.list();
      setGoals(Array.isArray(data) ? data : []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadGoals(); }, [loadGoals]);

  const openAdd = () => { setEditId(null); setFormName(""); setFormTarget(""); setFormCurrent(""); setError(""); setShowForm(true); };
  const openEdit = (g: any) => { setEditId(String(g.id)); setFormName(g.name); setFormTarget(String(g.target_amount)); setFormCurrent(String(g.current_amount)); setError(""); setShowForm(true); };

  const handleSave = async () => {
    if (!formName.trim()) { setError("Name required"); return; }
    if (!formTarget || parseFloat(formTarget) <= 0) { setError("Enter target amount"); return; }
    setSaving(true); setError("");
    try {
      const data = { name: formName, target_amount: parseFloat(formTarget), current_amount: parseFloat(formCurrent) || 0 };
      if (editId) await savingsGoalsAPI.update(editId, data);
      else await savingsGoalsAPI.create(data);
      setShowForm(false); loadGoals();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this goal?")) return;
    try { await savingsGoalsAPI.delete(id); loadGoals(); } catch {}
  };

  const handleRecordSavings = async (goalId: string) => {
    const amt = parseFloat(addAmount[goalId] || "0");
    if (amt <= 0) return;
    try {
      await savingsGoalsAPI.recordSavings(goalId, amt);
      setAddAmount((prev) => ({ ...prev, [goalId]: "" }));
      loadGoals();
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-[#7C5CFF] animate-spin" />
    </div>
  );

  return (
    <div className="px-5 py-6 space-y-6">
      <button onClick={openAdd}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#1B2130] border border-dashed border-white/20 rounded-xl text-white/70 hover:border-[#7C5CFF]/50 transition-colors">
        <Plus className="w-5 h-5" /><span className="text-sm font-medium">New Goal</span>
      </button>

      <div className="space-y-4">
        {goals.map((g) => {
          const pct = g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0;
          const complete = pct >= 100;
          return (
            <div key={g.id} className="bg-[#1B2130] rounded-2xl p-5 border border-white/5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className={`w-5 h-5 ${complete ? "text-[#22C55E]" : "text-[#7C5CFF]"}`} />
                  <h3 className="text-base font-semibold text-white">{g.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(g)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5">
                    <Pencil className="w-3 h-3 text-white/40" />
                  </button>
                  <button onClick={() => handleDelete(String(g.id))} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5">
                    <Trash2 className="w-3 h-3 text-[#EF4444]/60" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70">{formatCurrency(g.current_amount)}</span>
                <span className="text-white/50">of {formatCurrency(g.target_amount)}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <div className={`h-full rounded-full ${complete ? "bg-[#22C55E]" : "bg-gradient-to-r from-[#7C5CFF] to-[#4CC9F0]"}`}
                  style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <p className={`text-xs font-medium ${complete ? "text-[#22C55E]" : "text-[#7C5CFF]"}`}>{pct}% funded</p>

              {!complete && (
                <div className="flex gap-2 mt-3">
                  <input type="number" placeholder="₹ amount"
                    value={addAmount[g.id] || ""}
                    onChange={(e) => setAddAmount((p) => ({ ...p, [g.id]: e.target.value }))}
                    className="flex-1 px-3 py-2 bg-[#0D0F14] border border-white/10 rounded-lg text-white text-sm focus:border-[#7C5CFF] focus:outline-none" />
                  <button onClick={() => handleRecordSavings(String(g.id))}
                    className="px-4 py-2 bg-[#7C5CFF] rounded-lg text-white text-sm font-medium">
                    + Add
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="text-center py-12"><p className="text-white/50 text-sm">No savings goals yet</p></div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md bg-[#1B2130] rounded-t-3xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{editId ? "Edit Goal" : "New Goal"}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-white/50" /></button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Goal name"
              className="w-full px-4 py-3 bg-[#0D0F14] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none" />
            <input type="number" value={formTarget} onChange={(e) => setFormTarget(e.target.value)} placeholder="Target amount"
              className="w-full px-4 py-3 bg-[#0D0F14] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none" />
            <input type="number" value={formCurrent} onChange={(e) => setFormCurrent(e.target.value)} placeholder="Current amount"
              className="w-full px-4 py-3 bg-[#0D0F14] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none" />
            <button onClick={handleSave} disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl text-white font-semibold disabled:opacity-50">
              {saving ? "Saving..." : editId ? "Update" : "Create Goal"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
