import { useState } from "react";
import { useNavigate } from "react-router";
import { Calculator, Calendar, Camera, Image, Repeat, ScanLine } from "lucide-react";

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

  const categories = {
    expense: ["Food & Dining", "Transport", "Bills", "Shopping", "Entertainment", "Healthcare", "Education", "Other"],
    income: ["Salary", "Freelance", "Investment", "Gift", "Refund", "Other"],
  };

  const accounts = ["HDFC Bank", "ICICI Savings", "Paytm Wallet", "Cash", "HDFC Credit Card"];

  const handleSave = () => {
    // Save transaction logic
    navigate("/transactions");
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

      {/* Category */}
      <div>
        <label className="text-sm text-white/70 mb-3 block">Category</label>
        <div className="grid grid-cols-2 gap-2">
          {categories[type === "transfer" ? "expense" : type].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-[#7C5CFF] text-white"
                  : "bg-[#1B2130] text-white/70 border border-white/5 hover:border-[#7C5CFF]/30"
              }`}
            >
              {cat}
            </button>
          ))}
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
          className="w-full px-4 py-3.5 bg-[#1B2130] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none"
        >
          {accounts.map((acc) => (
            <option key={acc} value={acc}>{acc}</option>
          ))}
        </select>
      </div>

      {/* To Account (Transfer only) */}
      {type === "transfer" && (
        <div>
          <label className="text-sm text-white/70 mb-3 block">To Account</label>
          <select
            value={toAccount}
            onChange={(e) => setToAccount(e.target.value)}
            className="w-full px-4 py-3.5 bg-[#1B2130] border border-white/10 rounded-xl text-white focus:border-[#7C5CFF] focus:outline-none"
          >
            <option value="">Select account</option>
            {accounts.map((acc) => (
              <option key={acc} value={acc}>{acc}</option>
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
            <Image className="w-5 h-5" />
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
        className="w-full py-4 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl text-white font-semibold shadow-lg shadow-[#7C5CFF]/30"
      >
        Save Transaction
      </button>
    </div>
  );
}
