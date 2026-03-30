import { ChevronRight, Utensils, Briefcase, Zap, ArrowUpDown } from 'lucide-react';

const transactions = [
  {
    id: 1,
    icon: Utensils,
    name: 'Swiggy',
    subtitle: 'Food & Dining',
    amount: -450,
    color: '#FF6B6B',
  },
  {
    id: 2,
    icon: Briefcase,
    name: 'Salary',
    subtitle: 'Monthly Income',
    amount: 50000,
    color: '#22C55E',
  },
  {
    id: 3,
    icon: Zap,
    name: 'Electricity',
    subtitle: 'Bills & Utilities',
    amount: -1250,
    color: '#FFA500',
  },
  {
    id: 4,
    icon: ArrowUpDown,
    name: 'UPI Transfer',
    subtitle: 'To Rahul M.',
    amount: -700,
    color: '#4CC9F0',
  },
];

export function RecentTransactions() {
  return (
    <div className="bg-[#1B2130] rounded-2xl p-5 border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
        <button className="text-sm text-[#7C5CFF] font-medium hover:text-[#9D7EFF] transition-colors">
          View All
        </button>
      </div>
      
      <div className="space-y-1">
        {transactions.map((transaction) => {
          const Icon = transaction.icon;
          const isPositive = transaction.amount > 0;
          
          return (
            <div
              key={transaction.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${transaction.color}20` }}
              >
                <Icon 
                  className="w-5 h-5"
                  style={{ color: transaction.color }}
                />
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{transaction.name}</p>
                <p className="text-xs text-white/50">{transaction.subtitle}</p>
              </div>
              
              <div className="text-right">
                <p 
                  className={`text-sm font-semibold ${
                    isPositive ? 'text-[#22C55E]' : 'text-white'
                  }`}
                >
                  {isPositive ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
