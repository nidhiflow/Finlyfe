import { useState, useEffect } from "react";
import { Plus, ChevronRight, Edit, Trash2, Landmark } from "lucide-react";
import { categoriesAPI, API_BASE_URL } from "../services/api";

export function CategoriesScreen() {
  const [activeTab, setActiveTab] = useState<"expense" | "income">("expense");
  const [showAddModal, setShowAddModal] = useState(false);

  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Modal State
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🍔");
  const [newColor, setNewColor] = useState("#7C5CFF");
  const [isSaving, setIsSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.list();
      if (Array.isArray(data)) setApiCategories(data);
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await categoriesAPI.delete(id);
      fetchCategories();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const handleSaveCategory = async () => {
    if (!newName.trim()) return;
    setIsSaving(true);
    try {
      await categoriesAPI.create({
        name: newName,
        type: activeTab,
        icon: newIcon,
        color: newColor
      });
      setShowAddModal(false);
      setNewName("");
      fetchCategories();
    } catch (err) {
      console.error("Failed to create category", err);
    } finally {
      setIsSaving(false);
    }
  };

  const categories = apiCategories.filter(c => c.type === activeTab);

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
        {loading ? (
             <div className="text-center py-8">
               <p className="text-sm text-white/50">Loading categories...</p>
             </div>
        ) : categories.length === 0 ? (
             <div className="text-center py-8 bg-[#1B2130] rounded-2xl border border-white/5">
                <Landmark className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/50">No {activeTab} categories found.</p>
             </div>
        ) : categories.map((category) => {
          const catIcon = category.icon || "📊";
          const catColor = category.color || "#7C5CFF";
          
          return (
          <div key={category.id} className="bg-[#1B2130] rounded-2xl p-4 border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${catColor}20` }}
              >
                {catIcon.startsWith('http') ? <img src={catIcon} className="w-6 h-6 object-contain" alt="" /> : catIcon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">{category.name}</h3>
                <p className="text-xs text-white/50">0 transactions</p>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center">
                  <Edit className="w-4 h-4 text-white/70" />
                </button>
                <button onClick={() => handleDelete(category.id)} className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-[#EF4444]" />
                </button>
              </div>
            </div>

            {/* Subcategories (removed visual mock lines since API doesn't support yet, leaving empty block to preserve DOM) */}
          </div>
        )})}
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
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
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
                    onClick={() => setNewIcon(emoji)}
                    className={`w-12 h-12 rounded-xl bg-[#0D0F14] flex items-center justify-center text-2xl transition-colors ${
                      newIcon === emoji ? "border-2 border-[#7C5CFF]" : "border border-white/10 hover:border-[#7C5CFF]/30"
                    }`}
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
                    onClick={() => setNewColor(color)}
                    className={`w-10 h-10 rounded-xl transition-transform ${
                      newColor === color ? "border-2 border-white scale-110" : "border-2 border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={isSaving}
                className="flex-1 py-3 bg-[#0D0F14] border border-white/10 rounded-xl text-white font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveCategory}
                disabled={isSaving}
                className="flex-1 py-3 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl text-white font-semibold disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
