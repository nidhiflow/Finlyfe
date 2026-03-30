import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  Filter,
  Star,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  transactionsAPI,
  bookmarksAPI,
} from "../services/api";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function groupByDate(transactions: any[]): Record<string, any[]> {
  const groups: Record<string, any[]> = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date).toDateString();
    let label: string;
    if (txDate === today) label = "Today";
    else if (txDate === yesterday) label = "Yesterday";
    else
      label = new Date(tx.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  });
  return groups;
}

export function TransactionsScreen() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (searchQuery.length >= 2) params.search = searchQuery;
      if (filter !== "all") params.type = filter;

      const [txData, bmIds] = await Promise.all([
        transactionsAPI.getAll(params).catch(() => []),
        bookmarksAPI.getIds().catch(() => ({ ids: [] })),
      ]);

      setTransactions(Array.isArray(txData) ? txData : []);
      setBookmarkedIds(
        new Set(
          Array.isArray(bmIds?.ids || bmIds)
            ? (bmIds?.ids || bmIds).map(String)
            : []
        )
      );
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filter]);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), searchQuery ? 300 : 0);
    return () => clearTimeout(timer);
  }, [loadData, searchQuery]);

  const toggleBookmark = async (txId: string) => {
    try {
      if (bookmarkedIds.has(txId)) {
        await bookmarksAPI.remove(txId);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(txId);
          return next;
        });
      } else {
        await bookmarksAPI.add(txId);
        setBookmarkedIds((prev) => new Set(prev).add(txId));
      }
    } catch {}
  };

  const deleteTx = async (txId: string) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await transactionsAPI.delete(txId);
      setTransactions((prev) => prev.filter((t) => t.id !== txId));
    } catch {}
  };

  const grouped = groupByDate(transactions);

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
            className="w-full pl-12 pr-4 py-3.5 bg-[#1B2130] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-[#7C5CFF] focus:outline-none"
          />
        </div>
      </div>

      {/* Type Filter */}
      <div className="px-5 py-3 flex gap-2 overflow-x-auto">
        {["all", "income", "expense", "transfer"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filter === type
                ? "bg-[#7C5CFF] text-white"
                : "bg-[#1B2130] text-white/50 border border-white/10"
            }`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-[#7C5CFF] animate-spin" />
        </div>
      )}

      {/* Transaction Groups */}
      {!loading && (
        <div className="px-5 space-y-6 mt-2">
          {Object.keys(grouped).length === 0 ? (
            <div className="text-center py-16">
              <p className="text-white/50 text-sm">No transactions found</p>
              <button
                onClick={() => navigate("/dashboard/add-transaction")}
                className="mt-3 text-sm text-[#7C5CFF] font-medium"
              >
                Add your first transaction
              </button>
            </div>
          ) : (
            Object.entries(grouped).map(([dateLabel, txList]) => (
              <div key={dateLabel}>
                <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                  {dateLabel}
                </h3>
                <div className="space-y-1">
                  {txList.map((tx: any) => (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#1B2130] border border-white/5"
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{
                          backgroundColor: tx.category_color
                            ? `${tx.category_color}20`
                            : "#7C5CFF20",
                        }}
                      >
                        {tx.category_icon ||
                          (tx.type === "income"
                            ? "💰"
                            : tx.type === "transfer"
                            ? "🔄"
                            : "💸")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {tx.category_name || tx.type}
                        </p>
                        <p className="text-xs text-white/50 truncate">
                          {tx.note || ""}{" "}
                          {tx.account_name ? `• ${tx.account_name}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p
                          className={`text-sm font-semibold ${
                            tx.type === "income"
                              ? "text-[#22C55E]"
                              : tx.type === "transfer"
                              ? "text-[#4CC9F0]"
                              : "text-white"
                          }`}
                        >
                          {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                          {formatCurrency(tx.amount)}
                        </p>
                        <button
                          onClick={() => toggleBookmark(String(tx.id))}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              bookmarkedIds.has(String(tx.id))
                                ? "text-[#FFD700] fill-[#FFD700]"
                                : "text-white/30"
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => deleteTx(String(tx.id))}
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4 text-[#EF4444]/60" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
