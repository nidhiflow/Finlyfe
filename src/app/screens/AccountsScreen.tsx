import { useState } from "react";
import { Plus, TrendingUp, Eye, EyeOff, Building2, CreditCard, Wallet as WalletIcon, PiggyBank } from "lucide-react";

export function AccountsScreen() {
  const [showBalances, setShowBalances] = useState(true);

  const summary = {
    netWorth: 542300,
    assets: 657500,
    liabilities: 115200,
  };

  const accounts = [
    {
      id: 1,
      name: "HDFC Savings",
      type: "bank",
      icon: Building2,
      balance: 240000,
      parent: null,
      color: "#7C5CFF",
      trend: [20, 30, 25, 40, 35, 45, 50],
    },
    {
      id: 2,
      name: "Salary Account",
      type: "bank",
      icon: null,
      balance: 85000,
      parent: "HDFC Savings",
      color: "#7C5CFF",
    },
    {
      id: 3,
      name: "ICICI Savings",
      type: "bank",
      icon: Building2,
      balance: 180000,
      parent: null,
      color: "#4CC9F0",
      trend: [30, 35, 32, 38, 40, 42, 45],
    },
    {
      id: 4,
      name: "Paytm Wallet",
      type: "wallet",
      icon: WalletIcon,
      balance: 2500,
      parent: null,
      color: "#22C55E",
      trend: [5, 8, 6, 10, 7, 9, 8],
    },
    {
      id: 5,
      name: "Cash",
      type: "cash",
      icon: WalletIcon,
      balance: 5000,
      parent: null,
      color: "#FFA500",
    },
    {
      id: 6,
      name: "HDFC Credit Card",
      type: "credit",
      icon: CreditCard,
      balance: -15200,
      parent: null,
      color: "#EF4444",
      trend: [10, 12, 15, 13, 14, 15, 16],
    },
    {
      id: 7,
      name: "Fixed Deposit",
      type: "savings",
      icon: PiggyBank,
      balance: 145000,
      parent: null,
      color: "#7C5CFF",
    },
  ];

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
          {showBalances ? `₹${summary.netWorth.toLocaleString()}` : "••••••"}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/70 text-xs mb-1">Assets</p>
            <p className="text-xl font-semibold text-white">
              {showBalances ? `₹${summary.assets.toLocaleString()}` : "••••••"}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/70 text-xs mb-1">Liabilities</p>
            <p className="text-xl font-semibold text-white">
              {showBalances ? `₹${summary.liabilities.toLocaleString()}` : "••••••"}
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
          {accounts.map((account) => {
            const Icon = account.icon;
            const isNested = account.parent !== null;
            
            return (
              <div
                key={account.id}
                className={`bg-[#1B2130] rounded-2xl border border-white/5 overflow-hidden ${
                  isNested ? "ml-8" : ""
                }`}
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {Icon && (
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${account.color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: account.color }} />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{account.name}</h4>
                      <p className="text-xs text-white/50 capitalize">{account.type} Account</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-bold ${
                          account.balance >= 0 ? "text-white" : "text-[#EF4444]"
                        }`}
                      >
                        {showBalances
                          ? `${account.balance >= 0 ? "" : "-"}₹${Math.abs(account.balance).toLocaleString()}`
                          : "••••••"}
                      </p>
                    </div>
                  </div>

                  {/* Sparkline */}
                  {account.trend && (
                    <div className="flex items-end gap-1 h-8">
                      {account.trend.map((value, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t"
                          style={{
                            height: `${(value / 50) * 100}%`,
                            backgroundColor: account.color,
                            opacity: 0.6,
                          }}
                        />
                      ))}
                    </div>
                  )}
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
