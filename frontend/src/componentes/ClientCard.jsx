import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const statusConfig = {
  started: {
    label: 'STARTED',
    icon: '🚀',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    ring: 'ring-amber-500/20',
  },
  active: {
    label: 'ACTIVE',
    icon: '⚡',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
  },
  onaction: {
    label: 'ON ACTION',
    icon: '🎯',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    ring: 'ring-blue-500/20',
  },
  closed: {
    label: 'CLOSED',
    icon: '🔒',
    bg: 'bg-gray-500/10',
    text: 'text-gray-400',
    ring: 'ring-gray-500/20',
  },
  dead: {
    label: 'DEAD',
    icon: '💀',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    ring: 'ring-red-500/20',
  },
};

const InfoRow = ({ icon, label, value, iconClass }) => (
  <div className="flex items-center text-sm">
    <div className={`w-8 h-8 mr-4 rounded-lg flex items-center justify-center ${iconClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  </div>
);

const ClientCard = ({ client, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const config = statusConfig[client.status] || statusConfig.closed;

  const cardVariants = {
    closed: {
      height: 'auto',
      transition: { duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }
    },
    open: {
      height: 'auto',
      transition: { duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }
    }
  };

  const detailsVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } }
  };

  return (
    <motion.div
      layout
      variants={cardVariants}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-lg"
    >
      {/* Clickable Header */}
      <div 
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <div className={`w-12 h-12 mr-4 rounded-lg flex items-center justify-center text-xl ring-2 ${config.bg} ${config.ring}`}>
            {config.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">{client.businessName}</h3>
            <p className="text-sm text-gray-400">{client.managerName}</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
            {config.label}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="ml-4"
          >
            <ChevronDown size={20} className="text-gray-400" />
          </motion.div>
        </div>
      </div>

      {/* Collapsible Details */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={detailsVariants}
            className="px-4 pb-4 border-t border-slate-700/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <InfoRow icon="📞" label="Phone" value={client.phone} iconClass="bg-blue-500/10" />
              <InfoRow icon="📍" label="Place" value={client.place} iconClass="bg-pink-500/10" />
              <InfoRow icon="🗓️" label="First Visit" value={new Date(client.firstVisit).toLocaleDateString()} iconClass="bg-green-500/10" />
              <InfoRow icon="📅" label="Next Visit" value={new Date(client.nextVisit).toLocaleDateString()} iconClass="bg-purple-500/10" />
            </div>

            {client.deal && (
              <motion.div variants={detailsVariants} className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                <p className="text-sm text-emerald-400 font-bold">Deal Value</p>
                <p className="text-2xl font-black text-white">
                  {parseFloat(client.deal).toLocaleString()} Birr
                </p>
              </motion.div>
            )}

            {client.description && (
              <motion.div variants={detailsVariants} className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                <p className="text-sm text-gray-400 font-bold">Notes</p>
                <p className="text-white/80 text-sm leading-relaxed">{client.description}</p>
              </motion.div>
            )}

            <motion.div variants={detailsVariants} className="flex gap-3 mt-4">
              <button
                onClick={() => onEdit(client)}
                className="flex-1 bg-amber-500/80 text-white py-2 px-4 rounded-lg font-semibold hover:bg-amber-500 transition-colors duration-300"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(client._id)}
                className="flex-1 bg-red-500/80 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-500 transition-colors duration-300"
              >
                Delete
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientCard; 