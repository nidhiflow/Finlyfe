import { Plus, Minus, ScanLine } from 'lucide-react';

export function QuickActions() {
  return (
    <div className="flex gap-3">
      <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#1B2130] rounded-xl border border-white/5 hover:border-[#7C5CFF]/30 transition-colors">
        <Plus className="w-4 h-4 text-[#22C55E]" />
        <span className="text-sm font-medium text-white">Income</span>
      </button>
      
      <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#1B2130] rounded-xl border border-white/5 hover:border-[#7C5CFF]/30 transition-colors">
        <Minus className="w-4 h-4 text-[#EF4444]" />
        <span className="text-sm font-medium text-white">Expense</span>
      </button>
      
      <button className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-xl shadow-lg shadow-[#7C5CFF]/25 hover:shadow-[#7C5CFF]/40 transition-all">
        <ScanLine className="w-4 h-4 text-white" />
        <span className="text-sm font-medium text-white">Scan</span>
      </button>
    </div>
  );
}
