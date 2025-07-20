import React from 'react';
import ClientCard from './ClientCard';

const DeadClientsSection = ({ deadClients, showDeadClients, setShowDeadClients, onEdit, onDelete }) => (
  <div className="mt-16">
    <div className="text-center mb-8">
      <button
        onClick={() => setShowDeadClients(!showDeadClients)}
        className="group relative px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 rounded-full hover:shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-500 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-rose-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative flex items-center">
          <svg 
            className={`w-6 h-6 mr-3 transition-transform duration-300 ${showDeadClients ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          💀 Dead Clients ({deadClients.length})
        </div>
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full blur-xl"></div>
      </button>
    </div>
    {showDeadClients && (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-fadeIn">
        {deadClients.map((client, index) => (
          <ClientCard
            key={client._id}
            client={client}
            onEdit={onEdit}
            onDelete={onDelete}
            variant="dead"
          />
        ))}
      </div>
    )}
  </div>
);

export default DeadClientsSection; 