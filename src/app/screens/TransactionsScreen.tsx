import { useState, useEffect, useMemo } from "react";
import { Search, Filter, Bookmark, Star, Repeat, Utensils, Car, Zap, Coffee, Trash2, ArrowUpDown } from "lucide-react";
import { transactionsAPI, bookmarksAPI, API_BASE_URL } from "../services/api";

export function TransactionsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [recurringTxs, setRecurringTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, bookmarksRes] = await Promise.all([
          transactionsAPI.getAll(),
          bookmarksAPI.getIds()
        ]);
        if (txRes) setTransactions(txRes);
        if (bookmarksRes) setBookmarkedIds(new Set(bookmarksRes));
        // Try to load recurring
        try {
          const rec = await transactionsAPI.getUpcomingRecurring();
          if (Array.isArray(rec)) setRecurringTxs(rec);
        } catch { /* endpoint may not exist */ }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickAddChips = ["Food", "Transport", "Bills", "Shopping"];

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    return transactions.filter(t => 
      t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.account?.name?.toLowerCase().includes(searchQuery.toLowerCase()) 
    );
  }, [transactions, searchQuery]);

  const bookmarkedTxs = filteredTransactions.filter(t => bookmarkedIds.has(t.id));

  const groupedTransactions = useMemo(() => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    
    return filteredTransactions.reduce((acc: any, tx: any) => {
      // Don't duplicate bookmarked items in the main list to keep it exactly like Figma's logic? 
      // Actually Figma showed them. Let's group all by date.
      const dateStr = new Date(tx.date).toLocaleDateString();
      let key = dateStr;
      if (dateStr === today) key = "Today";
      else if (dateStr === yesterday) key = "Yesterday";
      
      if (!acc[key]) acc[key] = [];
      acc[key].push(tx);
      return acc;
    }, {});
  }, [filteredTransactions]);

  const toggleBookmark = async (id: string) => {
    try {
      if (bookmarkedIds.has(id)) {
        await bookmarksAPI.remove(id);
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await bookmarksAPI.add(id);
        setBookmarkedIds(prev => new Set(prev).add(id));
      }
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    }
  };

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
                <TransactionRow 
                  key={tx.id} 
                  transaction={tx} 
                  isBookmarked={true}
                  onToggleBookmark={() => toggleBookmark(tx.id)}
                />
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
            {recurringTxs.length > 0 ? recurringTxs.map((item, i) => (
              <div key={item.id || i} className="flex items-center gap-3 p-3 rounded-xl bg-[#1B2130] border border-white/5">
                <Repeat className="w-5 h-5 text-[#7C5CFF]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{item.title || item.name}</p>
                  <p className="text-xs text-white/50">Due: {new Date(item.next_date || item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
                </div>
                <p className="text-sm font-semibold text-white">₹{Number(item.amount).toLocaleString('en-IN')}</p>
              </div>
            )) : (
              <div className="text-center py-4 bg-[#1B2130] rounded-xl border border-white/5">
                <p className="text-sm text-white/50">No upcoming recurring transactions</p>
              </div>
            )}
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

        {/* Grouped by Date */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-sm text-white/50">Loading transactions...</p>
          </div>
        ) : Object.keys(groupedTransactions).length > 0 ? (
          Object.keys(groupedTransactions).map(dateKey => (
            <div key={dateKey}>
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">{dateKey}</h3>
              <div className="space-y-1">
                {groupedTransactions[dateKey].map((tx: any) => (
                  <TransactionRow 
                    key={tx.id} 
                    transaction={tx} 
                    isBookmarked={bookmarkedIds.has(tx.id)}
                    onToggleBookmark={() => toggleBookmark(tx.id)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#1B2130] rounded-2xl p-6 text-center border border-white/5 shadow-lg">
            <div className="w-16 h-16 rounded-full bg-[#7C5CFF]/10 flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-[#7C5CFF]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Transactions</h3>
            <p className="text-sm text-white/50">You haven't made any transactions matching this criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionRow({ transaction, isBookmarked, onToggleBookmark }: { transaction: any, isBookmarked: boolean, onToggleBookmark: () => void }) {
  const isExpense = transaction.type === "expense";
  const color = isExpense ? "#FF6B6B" : "#22C55E";
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1B2130] border border-white/5 group">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center p-2" style={{ backgroundColor: `${color}20` }}>
        {transaction.category?.icon ? (
          <img src={transaction.category.icon.startsWith('http') ? transaction.category.icon : `${API_BASE_URL}${transaction.category.icon}`} className="w-6 h-6 object-contain" alt="" />
        ) : (
          <ArrowUpDown className="w-5 h-5 text-[#7C5CFF]" style={{ color: color }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{transaction.title || "Transaction"}</p>
        <p className="text-xs text-white/50 truncate">
          {transaction.category?.name || "Other"} • {transaction.account?.name || "Account"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={`text-sm font-semibold ${isExpense ? "text-white" : "text-[#22C55E]"}`}>
            {isExpense ? "-" : "+"} {formatCurrency(transaction.amount)}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggleBookmark}
            className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center"
          >
            <Star className={`w-4 h-4 ${isBookmarked ? "text-[#FFD700] fill-[#FFD700]" : "text-white/40"}`} />
          </button>
          <button className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center">
            <Trash2 className="w-4 h-4 text-[#EF4444]" />
          </button>
        </div>
      </div>
    </div>
  );
}
