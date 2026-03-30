import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Calendar, Repeat, Loader2 } from "lucide-react";
import { transactionsAPI, categoriesAPI, accountsAPI } from "../services/api";

export function AddTransactionScreen() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const [type, setType] = useState<"expense" | "income" | "transfer">("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [recurring, setRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState("monthly");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [cats, accs] = await Promise.all([
          categoriesAPI.list().catch(() => []),
          accountsAPI.list().catch(() => []),
        ]);
        setCategories(Array.isArray(cats) ? cats : []);
        setAccounts(Array.isArray(accs) ? accs : []);

        // If editing, load the transaction
        if (editId) {
          const tx = await transactionsAPI.getById(editId);
          if (tx) {
            setType(tx.type || "expense");
            setAmount(String(tx.amount || ""));
            setCategoryId(String(tx.category_id || ""));
            setAccountId(String(tx.account_id || ""));
            setToAccountId(String(tx.to_account_id || ""));
            setNote(tx.note || "");
            setDate(tx.date ? tx.date.split("T")[0] : date);
            setRecurring(!!tx.is_recurring);
            setRecurringInterval(tx.recurring_interval || "monthly");
          }
        }
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [editId]);

  const filteredCategories = categories.filter(
    (c) => c.type === type || (type === "transfer" && c.type === "expense")
  );

  const handleSave = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (!categoryId && type !== "transfer") {
      setError("Please select a category");
      return;
    }
    if (!accountId) {
      setError("Please select an account");
      return;
    }

    setError("");
    setSaving(true);
    try {
      const data: any = {
        type,
        amount: parseFloat(amount),
        category_id: categoryId || null,
        account_id: accountId,
        note,
        date,
        is_recurring: recurring,
        recurring_interval: recurring ? recurringInterval : null,
      };
      if (type === "transfer") {
        data.to_account_id = toAccountId;
      }

      if (editId) {
        await transactionsAPI.update(editId, data);
      } else {
        await transactionsAPI.create(data);
      }
      navigate("/dashboard/transactions");
    } catch (err: any) {
      setError(err.message || "Failed to save transaction");
    } finally {
      setSaving(false);
    }
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
      {/* Type Tabs */}
      <div className="flex gap-2 p-1 bg-[#1B2130] rounded-xl">
        <button
          onClick={() => setType("income")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            type === "income" ? "bg-[#22C55E] text-white" : "text-white/50"
          }`}
        >
          Income
        </button>
        <button
          onClick={() => setType("expense")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            type === "expense" ? "bg-[#EF4444] text-white" : "text-white/50"
          }`}
        >
          Expense
        </button>
        <button
          onClick={() => setType("transfer")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            type === "transfer" ? "bg-[#4CC9F0] text-white" : "text-white/50"
          }`}
        >
          Transfer
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Amount */}
      <div className="bg-[#1B2130] rounded-2xl p-6 border border-white/5">
        <label className="text-sm text-white/50 mb-3 block">Amount</label>
        <div className="flex items-center gap-2">
          <span className="text-3xl text-white/70">₹</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0"
            className="flex-1 bg-transparent text-4xl font-bold text-white outline-none"
          />
        </div>
      </div>

      {/* Category */}
      {type !== "transfer" && (
        <div>
          <label className="text-sm text-white/70 mb-3 block">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {filteredCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(String(cat.id))}
                className={`py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  categoryId === String(cat.id)
                    ? "bg-[#7C5CFF] text-white"
                    : "bg-[#1B2130] text-white/70 border border-white/5 hover:border-[#7C5CFF]/30"
                }`}
              >
                <span>{cat.icon || "📁"}</span>
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Account */}
      <div>
        <label className="text-sm text-white/70 mb-3 block">
          {type === "transfer" ? "From Account" : "Account"}
        </label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="w-full px-4 py-3.5 bg-[#1B2130] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none"
        >
          <option value="">Select account</option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.parent_name ? `${acc.parent_name} / ${acc.name}` : acc.name}
            </option>
          ))}
        </select>
      </div>

      {/* To Account (Transfer) */}
      {type === "transfer" && (
        <div>
          <label className="text-sm text-white/70 mb-3 block">To Account</label>
          <select
            value={toAccountId}
            onChange={(e) => setToAccountId(e.target.value)}
            className="w-full px-4 py-3.5 bg-[#1B2130] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none"
          >
            <option value="">Select account</option>
            {accounts
              .filter((a) => String(a.id) !== accountId)
              .map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.parent_name ? `${acc.parent_name} / ${acc.name}` : acc.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {/* Date */}
      <div>
        <label className="text-sm text-white/70 mb-3 block">Date</label>
        <div className="relative">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-[#1B2130] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none"
          />
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="text-sm text-white/70 mb-3 block">Note (Optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="w-full px-4 py-3.5 bg-[#1B2130] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-[#7C5CFF] focus:outline-none resize-none"
        />
      </div>

      {/* Recurring */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-[#1B2130] border border-white/10 rounded-xl">
        <div className="flex items-center gap-3">
          <Repeat className="w-5 h-5 text-[#7C5CFF]" />
          <div>
            <p className="text-sm font-medium text-white">Recurring</p>
            <p className="text-xs text-white/50">
              {recurring ? recurringInterval : "Off"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setRecurring(!recurring)}
          className={`w-12 h-6 rounded-full p-1 transition-colors ${
            recurring ? "bg-[#7C5CFF]" : "bg-white/20"
          }`}
        >
          <div
            className={`w-4 h-4 bg-white rounded-full transition-transform ${
              recurring ? "translate-x-6" : ""
            }`}
          />
        </button>
      </div>

      {recurring && (
        <select
          value={recurringInterval}
          onChange={(e) => setRecurringInterval(e.target.value)}
          className="w-full px-4 py-3.5 bg-[#1B2130] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      )}

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl text-white font-semibold shadow-lg shadow-[#7C5CFF]/30 disabled:opacity-50"
      >
        {saving
          ? "Saving..."
          : editId
          ? "Update Transaction"
          : "Save Transaction"}
      </button>
    </div>
  );
}
