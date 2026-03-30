import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Food', value: 8200, color: '#7C5CFF' },
  { name: 'Travel', value: 4600, color: '#4CC9F0' },
  { name: 'Bills', value: 3100, color: '#22C55E' },
  { name: 'Other', value: 2800, color: '#EF4444' },
];

export function SpendingOverview() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-[#1B2130] rounded-2xl p-5 border border-white/5">
      <h3 className="text-lg font-semibold text-white mb-4">Spending Overview</h3>
      
      <div className="flex items-center gap-6">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-white/70">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">₹{item.value.toLocaleString()}</p>
                <p className="text-xs text-white/50">
                  {((item.value / total) * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
