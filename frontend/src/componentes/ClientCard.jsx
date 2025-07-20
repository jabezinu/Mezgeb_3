import React from 'react';

const statusColors = {
  started: 'from-amber-400 via-orange-500 to-red-500',
  active: 'from-emerald-400 via-green-500 to-teal-600',
  onaction: 'from-blue-400 via-indigo-500 to-purple-600',
  closed: 'from-gray-400 via-slate-500 to-stone-600',
  dead: 'from-red-400 via-rose-500 to-pink-600',
};
const statusGlow = {
  started: 'shadow-amber-500/25',
  active: 'shadow-emerald-500/25',
  onaction: 'shadow-blue-500/25',
  closed: 'shadow-gray-500/25',
  dead: 'shadow-red-500/25',
};
const statusIcons = {
  started: '🚀',
  active: '⚡',
  onaction: '🎯',
  closed: '🔒',
  dead: '💀',
};

const ClientCard = ({ client, onEdit, onDelete, variant = 'default' }) => {
  return (
    <div 
      className={`group relative bg-gradient-to-br ${variant === 'dead' ? 'from-red-900/20 to-rose-900/10' : 'from-white/10 to-white/5'} backdrop-blur-xl rounded-3xl p-8 border ${variant === 'dead' ? 'border-red-500/20' : 'border-white/20'} hover:shadow-2xl ${variant === 'dead' ? 'hover:shadow-red-500/25' : 'hover:shadow-purple-500/25'} transition-all duration-700 hover:scale-105 overflow-hidden`}
    >
      {/* Animated Border */}
      <div className={`absolute inset-0 bg-gradient-to-r ${variant === 'dead' ? 'from-red-500/50 via-rose-500/50 to-pink-500/50' : 'from-cyan-500/50 via-purple-500/50 to-pink-500/50'} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-sm`}></div>
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h3 className={`text-2xl font-black text-white mb-2 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 ${variant === 'dead' ? 'group-hover:from-red-400 group-hover:to-rose-400' : ''}`}>
              {client.businessName}
            </h3>
            <div className="flex items-center text-gray-300 mb-4">
              <svg className={`w-5 h-5 mr-2 ${variant === 'dead' ? 'text-red-400' : 'text-purple-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {client.managerName}
            </div>
          </div>
          <div className={`px-4 py-2 rounded-2xl bg-gradient-to-r ${statusColors[client.status]} text-white font-bold text-sm shadow-lg ${statusGlow[client.status]} group-hover:shadow-xl transition-all duration-300`}>
            {statusIcons[client.status]} {client.status.toUpperCase()}
          </div>
        </div>
        {/* Contact Info */}
        <div className="space-y-4 mb-6">
          <div className={`flex items-center text-gray-300 ${variant === 'dead' ? 'bg-red-900/20' : 'bg-white/5'} rounded-2xl p-4 group-hover:${variant === 'dead' ? 'bg-red-900/30' : 'bg-white/10'} transition-all duration-300`}>
            <svg className={`w-5 h-5 mr-3 ${variant === 'dead' ? 'text-red-400' : 'text-cyan-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {client.phone}
          </div>
          <div className={`flex items-center text-gray-300 ${variant === 'dead' ? 'bg-red-900/20' : 'bg-white/5'} rounded-2xl p-4 group-hover:${variant === 'dead' ? 'bg-red-900/30' : 'bg-white/10'} transition-all duration-300`}>
            <svg className={`w-5 h-5 mr-3 ${variant === 'dead' ? 'text-rose-400' : 'text-pink-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {client.place}
          </div>
        </div>
        {/* Visit Dates */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`bg-gradient-to-br ${variant === 'dead' ? 'from-red-500/20 to-rose-600/20 border border-red-500/30' : 'from-blue-500/20 to-indigo-600/20 border border-blue-500/30'} rounded-2xl p-4`}>
            <p className={`${variant === 'dead' ? 'text-red-400' : 'text-blue-400'} font-bold text-sm mb-1`}>First Visit</p>
            <p className="text-white text-sm">{new Date(client.firstVisit).toLocaleDateString()}</p>
          </div>
          <div className={`bg-gradient-to-br ${variant === 'dead' ? 'from-rose-500/20 to-pink-600/20 border border-rose-500/30' : 'from-green-500/20 to-emerald-600/20 border border-green-500/30'} rounded-2xl p-4`}>
            <p className={`${variant === 'dead' ? 'text-rose-400' : 'text-green-400'} font-bold text-sm mb-1`}>Next Visit</p>
            <p className="text-white text-sm">{new Date(client.nextVisit).toLocaleDateString()}</p>
          </div>
        </div>
        {/* Deal Value */}
        {client.deal && (
          <div className={`bg-gradient-to-br ${variant === 'dead' ? 'from-red-500/20 to-rose-600/20 border border-red-500/30' : 'from-emerald-500/20 to-teal-600/20 border border-emerald-500/30'} rounded-2xl p-4 mb-6`}>
            <p className={`${variant === 'dead' ? 'text-red-400' : 'text-emerald-400'} font-bold text-sm mb-1`}>Deal Value</p>
            <p className={`text-3xl font-black bg-gradient-to-r ${variant === 'dead' ? 'from-red-400 to-rose-400' : 'from-emerald-400 to-teal-400'} bg-clip-text text-transparent`}>
              {parseFloat(client.deal).toLocaleString()} Birr.
            </p>
          </div>
        )}
        {/* Description */}
        {client.description && (
          <div className={`${variant === 'dead' ? 'bg-red-900/10 group-hover:bg-red-900/20' : 'bg-white/5 group-hover:bg-white/10'} rounded-2xl p-4 mb-6 transition-all duration-300`}>
            <p className="text-gray-400 font-bold text-sm mb-2">Notes</p>
            <p className="text-gray-300 text-sm leading-relaxed">{client.description}</p>
          </div>
        )}
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(client)}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 px-4 rounded-2xl font-bold hover:from-amber-400 hover:to-orange-500 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 transform hover:scale-105"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(client._id)}
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 px-4 rounded-2xl font-bold hover:from-red-400 hover:to-pink-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-105"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientCard; 