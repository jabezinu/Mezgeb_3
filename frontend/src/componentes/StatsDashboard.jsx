import React from 'react';

const statusColors = {
  started: 'from-amber-400 via-orange-500 to-red-500',
  active: 'from-emerald-400 via-green-500 to-teal-600',
  onaction: 'from-blue-400 via-indigo-500 to-purple-600',
  closed: 'from-gray-400 via-slate-500 to-stone-600',
  dead: 'from-red-400 via-rose-500 to-pink-600',
};
const statusIcons = {
  started: '🚀',
  active: '⚡',
  onaction: '🎯',
  closed: '🔒',
  dead: '💀',
};

const StatsDashboard = ({ clients }) => {
  const totalValue = clients.reduce((sum, client) => sum + (parseFloat(client.deal) || 0), 0);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
      {/* Total Clients */}
      <div className="lg:col-span-1 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500 hover:scale-105 group">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Clients</p>
            <p className="text-4xl font-black text-white group-hover:text-cyan-400 transition-colors duration-300">{clients.length}</p>
          </div>
          <div className="text-4xl group-hover:scale-110 transition-transform duration-300">👥</div>
        </div>
        <div className="mt-4 h-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full group-hover:from-cyan-400 group-hover:to-blue-500 transition-all duration-300"></div>
      </div>
      {/* Status Cards */}
      {Object.entries(statusColors).map(([status, gradient]) => {
        const count = clients.filter(client => client.status === status).length;
        const percentage = clients.length > 0 ? (count / clients.length) * 100 : 0;
        return (
          <div key={status} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 border border-white/20 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{status}</p>
                <p className="text-3xl font-black text-white group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{count}</p>
              </div>
              <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{statusIcons[status]}</div>
            </div>
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out rounded-full`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{percentage.toFixed(1)}% of total</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatsDashboard; 