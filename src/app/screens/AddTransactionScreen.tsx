import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Calculator, Calendar, Camera, Image as ImageIcon, Repeat, ScanLine } from "lucide-react";
import { categoriesAPI, accountsAPI, transactionsAPI } from "../services/api";

export function AddTransactionScreen() {
  const navigate = useNavigate();
  const [type, setType] = useState<"expense" | "income" | "transfer">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [account, setAccount] = useState("HDFC Bank");
  const [toAccount, setToAccount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("Today");
  const [recurring, setRecurring] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [apiCategories, setApiCategories] = useState<any[]>([]);
  const [apiAccounts, setApiAccounts] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, accs] = await Promise.all([
          categoriesAPI.list(),
          accountsAPI.list()
        ]);
        if (cats) setApiCategories(cats);
        if (accs) {
          setApiAccounts(accs);
          if (accs.length > 0) setAccount(accs[0].id);
        }
      } catch (err) {
        console.error("Failed to load options", err);
      }
    };
    loadData();
  }, []);

  const currentCategories = apiCategories.filter(c => c.type === (type === "transfer" ? "expense" : type));

  // Auto-select first category when type changes or categories load
  useEffect(() => {
    if (currentCategories.length > 0 && !currentCategories.find(c => c.id === category)) {
      setCategory(currentCategories[0].id);
    }
  }, [type, apiCategories, category, currentCategories]);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      setError("Please enter a valid amount");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await transactionsAPI.create({
        type,
        amount: Number(amount),
        categoryId: category,
        accountId: account,
        toAccountId: type === "transfer" ? toAccount || undefined : undefined,
        date: new Date().toISOString(), // Handling "Today" simply for now
        title: note || "Transaction",
        notes: note
      });
      navigate("/dashboard/transactions");
    } catch (err: any) {
      setError(err.message || "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Tabs */}
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

      {/* Amount Input */}
      <div className="bg-[#1B2130] rounded-2xl p-6 border border-white/5">
        <label className="text-sm text-white/50 mb-3 block">Amount</label>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl text-white/70">₹</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="flex-1 bg-transparent text-4xl font-bold text-white outline-none"
          />
        </div>
        <button className="flex items-center gap-2 text-sm text-[#7C5CFF] hover:text-[#9D7EFF]">
          <Calculator className="w-4 h-4" />
          <span>Use Calculator</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Category */}
      <div>
        <label className="text-sm text-white/70 mb-3 block">Category</label>
        <div className="grid grid-cols-2 gap-2">
          {currentCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`py-3 px-2 rounded-xl text-sm font-medium transition-colors truncate ${
                category === cat.id
                  ? "bg-[#7C5CFF] text-white"
                  : "bg-[#1B2130] text-white/70 border border-white/5 hover:border-[#7C5CFF]/30"
              }`}
            >
              {cat.name}
            </button>
          ))}
          {currentCategories.length === 0 && (
            <div className="col-span-2 text-center py-3 text-white/40 text-sm">No categories found</div>
          )}
        </div>
      </div>

      {/* Account */}
      <div>
        <label className="text-sm text-white/70 mb-3 block">
          {type === "transfer" ? "From Account" : "Account"}
        </label>
        <select
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          className="w-full px-4 py-3.5 bg-[#1B2130] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none appearance-none"
        >
          {apiAccounts.map((acc) => (
            <option key={acc.id} value={acc.id}>{acc.name}</option>
          ))}
          {apiAccounts.length === 0 && <option value="">No accounts available</option>}
        </select>
      </div>

      {/* To Account (Transfer only) */}
      {type === "transfer" && (
        <div>
          <label className="text-sm text-white/70 mb-3 block">To Account</label>
          <select
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            className="w-full px-4 py-3.5 bg-[#1B2130] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none appearance-none"
          >
            <option value="">Select account</option>
            {apiAccounts.filter(a => a.id !== account).map((acc) => (
              <option key={acc.id} value={acc.id}>{acc.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Date */}
      <div>
        <label className="text-sm text-white/70 mb-3 block">Date</label>
        <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#1B2130] border border-white/10 rounded-xl text-white hover:border-[#7C5CFF]/30">
          <Calendar className="w-5 h-5 text-white/70" />
          <span>{date}</span>
        </button>
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

      {/* Attachments */}
      <div>
        <label className="text-sm text-white/70 mb-3 block">Attachments</label>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-3 bg-[#1B2130] border border-white/10 rounded-xl text-white hover:border-[#7C5CFF]/30">
            <Camera className="w-5 h-5" />
            <span className="text-sm">Camera</span>
          </button>
          <button className="flex items-center justify-center gap-2 py-3 bg-[#1B2130] border border-white/10 rounded-xl text-white hover:border-[#7C5CFF]/30">
            <ImageIcon className="w-5 h-5" />
            <span className="text-sm">Gallery</span>
          </button>
        </div>
      </div>

      {/* AI Scan */}
      <button className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl text-white font-semibold shadow-lg shadow-[#7C5CFF]/30">
        <ScanLine className="w-5 h-5" />
        <span>Scan Receipt with AI</span>
      </button>

      {/* Recurring */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-[#1B2130] border border-white/10 rounded-xl">
        <div className="flex items-center gap-3">
          <Repeat className="w-5 h-5 text-[#7C5CFF]" />
          <div>
            <p className="text-sm font-medium text-white">Recurring Transaction</p>
            <p className="text-xs text-white/50">Repeat monthly</p>
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

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full py-4 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl text-white font-semibold shadow-lg shadow-[#7C5CFF]/30 opacity-100 disabled:opacity-70 transition-opacity"
      >
        {loading ? "Saving..." : "Save Transaction"}
      </button>
    </div>
  );
}
