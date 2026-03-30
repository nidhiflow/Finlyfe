import { TrendingUp } from 'lucide-react';

export function BalanceCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#7C5CFF] to-[#4CC9F0]">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-2xl"></div>
      
      <div className="relative z-10">
        <p className="text-white/80 text-sm mb-2">Total Balance</p>
        <h2 className="text-4xl font-bold text-white mb-3">₹1,24,500</h2>
        
        <div className="flex items-center gap-1.5 mb-5">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-white/20 rounded-full backdrop-blur-sm">
            <TrendingUp className="w-3 h-3 text-white" />
            <span className="text-xs text-white font-medium">+8.4% vs last month</span>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#22C55E]/20 border border-[#22C55E]/30 rounded-xl backdrop-blur-sm">
            <div className="w-2 h-2 bg-[#22C55E] rounded-full"></div>
            <div>
              <p className="text-[10px] text-white/70">Income</p>
              <p className="text-sm font-semibold text-white">₹52,000</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#EF4444]/20 border border-[#EF4444]/30 rounded-xl backdrop-blur-sm">
            <div className="w-2 h-2 bg-[#EF4444] rounded-full"></div>
            <div>
              <p className="text-[10px] text-white/70">Expense</p>
              <p className="text-sm font-semibold text-white">₹18,700</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
