import { useState } from "react";
import { Search, Filter, Bookmark, Star, Repeat, Utensils, Car, Zap, Coffee, Trash2 } from "lucide-react";

export function TransactionsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const quickAddChips = ["Food", "Transport", "Bills", "Shopping"];

  const transactions = [
    { id: 1, icon: Utensils, name: "Swiggy", note: "Lunch", account: "HDFC Bank", amount: -450, date: "Today", bookmarked: false },
    { id: 2, icon: Car, name: "Uber", note: "To office", account: "Paytm", amount: -320, date: "Today", bookmarked: true },
    { id: 3, icon: Coffee, name: "Starbucks", note: "Coffee", account: "HDFC Bank", amount: -280, date: "Today", bookmarked: false },
    { id: 4, icon: Zap, name: "Electricity Bill", note: "March payment", account: "HDFC Bank", amount: -1250, date: "Yesterday", bookmarked: false },
    { id: 5, icon: Utensils, name: "Zomato", note: "Dinner", account: "HDFC Bank", amount: -650, date: "Yesterday", bookmarked: false },
  ];

  const bookmarkedTxs = transactions.filter(t => t.bookmarked);
  const todayTxs = transactions.filter(t => t.date === "Today");
  const yesterdayTxs = transactions.filter(t => t.date === "Yesterday");

  return (
    <div className="pb-6">
      {/* Search Bar */}
      <div className="px-5 py-4 sticky top-[57px] bg-[#0D0F14]/95 backdrop-blur-xl z-30 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-12 pr-12 py-3.5 bg-[#1B2130] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-[#7C5CFF] focus:outline-none"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <Filter className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="px-5 py-4 bg-[#1B2130] border-b border-white/5">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/50 mb-2 block">Type</label>
              <div className="flex gap-2">
                {["All", "Income", "Expense", "Transfer"].map((type) => (
                  <button
                    key={type}
                    className="px-4 py-2 bg-[#0D0F14] border border-white/10 rounded-lg text-sm text-white hover:border-[#7C5CFF]/30"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-2 block">Date Range</label>
              <div className="flex gap-2">
                {["Today", "This Week", "This Month", "Custom"].map((range) => (
                  <button
                    key={range}
                    className="px-4 py-2 bg-[#0D0F14] border border-white/10 rounded-lg text-sm text-white hover:border-[#7C5CFF]/30"
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 space-y-6 mt-6">
        {/* Saved Filter Presets */}
        <div>
          <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">Saved Filters</p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
            {["All Expenses", "Food & Dining", "Last 7 Days", "High Value (>₹1000)"].map((preset) => (
              <button
                key={preset}
                className="px-4 py-2 bg-[#1B2130] border border-white/10 rounded-lg text-sm text-white whitespace-nowrap hover:border-[#7C5CFF]/30"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Bookmarked */}
        {bookmarkedTxs.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-[#FFD700]" fill="#FFD700" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Bookmarked</h3>
            </div>
            <div className="space-y-1">
              {bookmarkedTxs.map((tx) => (
                <TransactionRow key={tx.id} transaction={tx} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Recurring */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Repeat className="w-4 h-4 text-[#7C5CFF]" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Upcoming Recurring</h3>
          </div>
          <div className="space-y-2">
            {[
              { name: "Netflix Subscription", date: "Apr 1", amount: 199 },
              { name: "Gym Membership", date: "Apr 5", amount: 2000 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#1B2130] border border-white/5">
                <Repeat className="w-5 h-5 text-[#7C5CFF]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <p className="text-xs text-white/50">Due: {item.date}</p>
                </div>
                <p className="text-sm font-semibold text-white">₹{item.amount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Add Chips */}
        <div>
          <p className="text-xs text-white/50 mb-3 uppercase tracking-wider">Quick Add</p>
          <div className="flex gap-2">
            {quickAddChips.map((chip) => (
              <button
                key={chip}
                className="px-4 py-2 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-lg text-sm text-white font-medium shadow-lg shadow-[#7C5CFF]/25"
              >
                + {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Today */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Today</h3>
          <div className="space-y-1">
            {todayTxs.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </div>
        </div>

        {/* Yesterday */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">Yesterday</h3>
          <div className="space-y-1">
            {yesterdayTxs.map((tx) => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: any }) {
  const Icon = transaction.icon;
  const [bookmarked, setBookmarked] = useState(transaction.bookmarked);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1B2130] border border-white/5 group">
      <div className="w-11 h-11 rounded-xl bg-[#7C5CFF]/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#7C5CFF]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{transaction.name}</p>
        <p className="text-xs text-white/50 truncate">{transaction.note} • {transaction.account}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={`text-sm font-semibold ${transaction.amount > 0 ? "text-[#22C55E]" : "text-white"}`}>
            {transaction.amount > 0 ? "+" : ""}₹{Math.abs(transaction.amount)}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center"
          >
            <Star className={`w-4 h-4 ${bookmarked ? "text-[#FFD700] fill-[#FFD700]" : "text-white/40"}`} />
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-[#EF4444]" />
          </button>
        </div>
      </div>
    </div>
  );
}
