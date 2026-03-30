import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, Trash2, Pencil, X } from "lucide-react";
import { categoriesAPI } from "../services/api";

export function CategoriesScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"expense" | "income">("expense");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formIcon, setFormIcon] = useState("📁");
  const [formColor, setFormColor] = useState("#7C5CFF");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoriesAPI.list();
      setCategories(Array.isArray(data) ? data : []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = categories.filter((c) => c.type === tab);

  const openAdd = () => { setEditId(null); setFormName(""); setFormIcon("📁"); setFormColor("#7C5CFF"); setError(""); setShowForm(true); };
  const openEdit = (c: any) => { setEditId(String(c.id)); setFormName(c.name); setFormIcon(c.icon || "📁"); setFormColor(c.color || "#7C5CFF"); setError(""); setShowForm(true); };

  const handleSave = async () => {
    if (!formName.trim()) { setError("Name required"); return; }
    setSaving(true); setError("");
    try {
      const data = { name: formName, icon: formIcon, color: formColor, type: tab };
      if (editId) await categoriesAPI.update(editId, data);
      else await categoriesAPI.create(data);
      setShowForm(false); loadData();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try { await categoriesAPI.delete(id); loadData(); } catch {}
  };

  const ICONS = ["📁", "🍔", "🚗", "💡", "🛒", "🎬", "💊", "📚", "✈️", "🏠", "💰", "💼", "🎁", "🔧", "📱", "☕"];
  const COLORS = ["#7C5CFF", "#22C55E", "#EF4444", "#4CC9F0", "#FFA500", "#FF6B6B", "#E91E63", "#00BCD4"];

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-[#7C5CFF] animate-spin" />
    </div>
  );

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[#1B2130] rounded-xl">
        <button onClick={() => setTab("expense")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${tab === "expense" ? "bg-[#EF4444] text-white" : "text-white/50"}`}>
          Expense
        </button>
        <button onClick={() => setTab("income")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium ${tab === "income" ? "bg-[#22C55E] text-white" : "text-white/50"}`}>
          Income
        </button>
      </div>

      <button onClick={openAdd}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#1B2130] border border-dashed border-white/20 rounded-xl text-white/70 hover:border-[#7C5CFF]/50 transition-colors">
        <Plus className="w-5 h-5" /><span className="text-sm font-medium">Add Category</span>
      </button>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((cat) => (
          <div key={cat.id} className="bg-[#1B2130] rounded-xl p-4 border border-white/5 relative group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${cat.color || "#7C5CFF"}20` }}>
                {cat.icon || "📁"}
              </div>
              <p className="text-sm font-medium text-white flex-1 truncate">{cat.name}</p>
            </div>
            <div className="flex gap-1 justify-end">
              <button onClick={() => openEdit(cat)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5">
                <Pencil className="w-3 h-3 text-white/40" />
              </button>
              <button onClick={() => handleDelete(String(cat.id))} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5">
                <Trash2 className="w-3 h-3 text-[#EF4444]/60" />
              </button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-12"><p className="text-white/50 text-sm">No {tab} categories</p></div>}

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md bg-[#1B2130] rounded-t-3xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{editId ? "Edit" : "Add"} Category</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-white/50" /></button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Category name"
              className="w-full px-4 py-3 bg-[#0D0F14] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none" />
            <div>
              <label className="text-sm text-white/70 mb-2 block">Icon</label>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((i) => (
                  <button key={i} onClick={() => setFormIcon(i)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${formIcon === i ? "bg-[#7C5CFF] ring-2 ring-[#7C5CFF]" : "bg-[#0D0F14]"}`}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-white/70 mb-2 block">Color</label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button key={c} onClick={() => setFormColor(c)}
                    className={`w-8 h-8 rounded-full ${formColor === c ? "ring-2 ring-white" : ""}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <button onClick={handleSave} disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl text-white font-semibold disabled:opacity-50">
              {saving ? "Saving..." : editId ? "Update" : "Add Category"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
