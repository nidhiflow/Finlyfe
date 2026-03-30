import { useState, useEffect } from "react";
import { Plus, TrendingUp, Eye, EyeOff, Building2, CreditCard, Wallet as WalletIcon, PiggyBank, Landmark } from "lucide-react";
import { accountsAPI, statsAPI } from "../services/api";

export function AccountsScreen() {
  const [showBalances, setShowBalances] = useState(true);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ netWorth: 0, assets: 0, liabilities: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accData, statsData] = await Promise.all([
          accountsAPI.list(),
          statsAPI.summary()
        ]);
        
        if (accData) {
          setAccounts(accData);
          const assets = accData.reduce((sum: number, a: any) => sum + (Number(a.balance) > 0 ? Number(a.balance) : 0), 0);
          const liabilities = accData.reduce((sum: number, a: any) => sum + (Number(a.balance) < 0 ? Math.abs(Number(a.balance)) : 0), 0);
          setSummary({
            netWorth: (statsData?.netWorth || (assets - liabilities)),
            assets,
            liabilities
          });
        }
      } catch (err) {
        console.error("Failed to fetch accounts", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getIconForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'bank': return Building2;
      case 'credit': return CreditCard;
      case 'wallet': return WalletIcon;
      case 'cash': return WalletIcon;
      case 'savings': return PiggyBank;
      default: return Landmark;
    }
  };

  const getColorForType = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'bank': return "#7C5CFF";
      case 'credit': return "#EF4444";
      case 'wallet': return "#22C55E";
      case 'cash': return "#FFA500";
      case 'savings': return "#4CC9F0";
      default: return "#7C5CFF";
    }
  };

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amt || 0);
  };

  return (
    <div className="px-5 py-6 space-y-6">
      {/* Summary Cards */}
      <div className="bg-gradient-to-br from-[#7C5CFF] to-[#4CC9F0] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white/80 text-sm">Net Worth</h2>
          <button onClick={() => setShowBalances(!showBalances)}>
            {showBalances ? (
              <Eye className="w-5 h-5 text-white/80" />
            ) : (
              <EyeOff className="w-5 h-5 text-white/80" />
            )}
          </button>
        </div>
        
        <p className="text-4xl font-bold text-white mb-6">
          {showBalances ? formatCurrency(summary.netWorth) : "••••••"}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/70 text-xs mb-1">Assets</p>
            <p className="text-xl font-semibold text-white">
              {showBalances ? formatCurrency(summary.assets) : "••••••"}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/70 text-xs mb-1">Liabilities</p>
            <p className="text-xl font-semibold text-white">
              {showBalances ? formatCurrency(summary.liabilities) : "••••••"}
            </p>
          </div>
        </div>
      </div>

      {/* Add Account Button */}
      <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl text-white font-semibold shadow-lg shadow-[#7C5CFF]/30">
        <Plus className="w-5 h-5" />
        <span>Add Account</span>
      </button>

      {/* Accounts List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">All Accounts</h3>
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-sm text-white/50">Loading accounts...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8 bg-[#1B2130] rounded-2xl border border-white/5">
              <Landmark className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/50">No accounts safely added yet.</p>
            </div>
          ) : accounts.map((account) => {
            const Icon = getIconForType(account.type);
            const color = getColorForType(account.type);
            
            return (
              <div
                key={account.id}
                className="bg-[#1B2130] rounded-2xl border border-white/5 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate">{account.name}</h4>
                      <p className="text-xs text-white/50 capitalize">{account.type} Account</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          Number(account.balance) >= 0 ? "text-white" : "text-[#EF4444]"
                        }`}
                      >
                        {showBalances
                          ? `${Number(account.balance) >= 0 ? "" : "-"}${formatCurrency(Math.abs(Number(account.balance)))}`
                          : "••••••"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Type Guide */}
      <div className="bg-[#1B2130] rounded-2xl p-5 border border-white/5">
        <h3 className="text-lg font-semibold text-white mb-4">Account Types</h3>
        <div className="space-y-3">
          {[
            { icon: Building2, name: "Bank", desc: "Savings & checking accounts", color: "#7C5CFF" },
            { icon: CreditCard, name: "Credit Card", desc: "Credit lines & cards", color: "#EF4444" },
            { icon: WalletIcon, name: "Wallet", desc: "Digital wallets & cash", color: "#22C55E" },
            { icon: PiggyBank, name: "Savings", desc: "FD, RD & investments", color: "#4CC9F0" },
          ].map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.name} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${type.color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: type.color }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{type.name}</p>
                  <p className="text-xs text-white/50">{type.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
