import React from 'react';

const SearchFilterBar = ({ searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => (
  <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto mb-12">
    <div className="relative flex-1">
      <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        placeholder="Search clients by name, business, or location..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full pl-12 pr-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
      />
    </div>
    <select
      value={filterStatus}
      onChange={e => setFilterStatus(e.target.value)}
      className="px-6 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
    >
      <option value="all">All Status</option>
      <option value="started">🚀 Started</option>
      <option value="active">⚡ Active</option>
      <option value="onaction">🎯 On Action</option>
      <option value="closed">🔒 Closed</option>
      <option value="dead">💀 Dead</option>
    </select>
  </div>
);

export default SearchFilterBar; 