import { useState, useEffect, useCallback } from "react";
import { Plus, Wallet, CreditCard, Landmark, PiggyBank, Loader2, Trash2, Pencil, X } from "lucide-react";
import { accountsAPI } from "../services/api";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const ACCOUNT_ICONS: Record<string, any> = {
  bank: Landmark,
  wallet: Wallet,
  credit: CreditCard,
  savings: PiggyBank,
};

export function AccountsScreen() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formBalance, setFormBalance] = useState("");
  const [formType, setFormType] = useState("bank");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountsAPI.list();
      setAccounts(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  const openAdd = () => {
    setEditId(null);
    setFormName("");
    setFormBalance("");
    setFormType("bank");
    setError("");
    setShowForm(true);
  };

  const openEdit = (acc: any) => {
    setEditId(String(acc.id));
    setFormName(acc.name);
    setFormBalance(String(acc.balance || 0));
    setFormType(acc.type || "bank");
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) { setError("Name required"); return; }
    setSaving(true);
    setError("");
    try {
      const data = { name: formName, balance: parseFloat(formBalance) || 0, type: formType };
      if (editId) {
        await accountsAPI.update(editId, data);
      } else {
        await accountsAPI.create(data);
      }
      setShowForm(false);
      loadAccounts();
    } catch (err: any) {
      setError(err.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this account?")) return;
    try {
      await accountsAPI.delete(id);
      loadAccounts();
    } catch {}
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
      {/* Net Worth */}
      <div className="bg-gradient-to-br from-[#7C5CFF]/20 to-[#4CC9F0]/20 border border-[#7C5CFF]/30 rounded-2xl p-5">
        <p className="text-sm text-white/60 mb-1">Net Worth</p>
        <p className={`text-3xl font-bold ${totalBalance >= 0 ? "text-white" : "text-[#EF4444]"}`}>
          {formatCurrency(totalBalance)}
        </p>
        <p className="text-xs text-white/50 mt-1">{accounts.length} accounts</p>
      </div>

      {/* Add button */}
      <button
        onClick={openAdd}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#1B2130] border border-dashed border-white/20 rounded-xl text-white/70 hover:border-[#7C5CFF]/50 hover:text-white transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="text-sm font-medium">Add Account</span>
      </button>

      {/* Accounts List */}
      <div className="space-y-2">
        {accounts.map((acc) => {
          const Icon = ACCOUNT_ICONS[acc.type] || Wallet;
          return (
            <div
              key={acc.id}
              className="flex items-center gap-3 p-4 rounded-xl bg-[#1B2130] border border-white/5"
            >
              <div className="w-11 h-11 rounded-xl bg-[#7C5CFF]/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-[#7C5CFF]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {acc.parent_name ? `${acc.parent_name} / ` : ""}
                  {acc.name}
                </p>
                <p className="text-xs text-white/50 capitalize">{acc.type || "Account"}</p>
              </div>
              <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold ${acc.balance < 0 ? "text-[#EF4444]" : "text-white"}`}>
                  {formatCurrency(acc.balance || 0)}
                </p>
                <button onClick={() => openEdit(acc)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5">
                  <Pencil className="w-3.5 h-3.5 text-white/40" />
                </button>
                <button onClick={() => handleDelete(String(acc.id))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5">
                  <Trash2 className="w-3.5 h-3.5 text-[#EF4444]/60" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md bg-[#1B2130] rounded-t-3xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">{editId ? "Edit Account" : "Add Account"}</h3>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-white/50" />
              </button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div>
              <label className="text-sm text-white/70 mb-2 block">Name</label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Account name"
                className="w-full px-4 py-3 bg-[#0D0F14] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-2 block">Balance</label>
              <input
                type="number"
                value={formBalance}
                onChange={(e) => setFormBalance(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 bg-[#0D0F14] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-2 block">Type</label>
              <div className="flex gap-2">
                {["bank", "wallet", "credit", "savings"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormType(t)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize ${
                      formType === t ? "bg-[#7C5CFF] text-white" : "bg-[#0D0F14] text-white/50 border border-white/10"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl text-white font-semibold disabled:opacity-50"
            >
              {saving ? "Saving..." : editId ? "Update" : "Add Account"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
