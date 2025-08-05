import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Phone, MapPin, Calendar, DollarSign, FileText } from 'lucide-react';

const statusConfig = {
  started: {
    label: 'STARTED',
    icon: '🚀',
    bg: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/25',
  },
  active: {
    label: 'ACTIVE',
    icon: '⚡',
    bg: 'from-emerald-500/20 to-green-500/20',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/25',
  },
  onaction: {
    label: 'ON ACTION',
    icon: '🎯',
    bg: 'from-blue-500/20 to-indigo-500/20',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/25',
  },
  closed: {
    label: 'CLOSED',
    icon: '🔒',
    bg: 'from-gray-500/20 to-slate-500/20',
    border: 'border-gray-500/30',
    text: 'text-gray-400',
    glow: 'shadow-gray-500/25',
  },
  dead: {
    label: 'DEAD',
    icon: '💀',
    bg: 'from-red-500/20 to-pink-500/20',
    border: 'border-red-500/30',
    text: 'text-red-400',
    glow: 'shadow-red-500/25',
  },
};

const ClientCard = ({ client, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = statusConfig[client.status] || statusConfig.closed;

  const compactVariants = {
    collapsed: {
      height: 'auto',
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
    },
    expanded: {
      height: 'auto',
      transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
    }
  };

  const contentVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div
      layout
      variants={compactVariants}
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      className={`relative bg-gradient-to-br ${config.bg} backdrop-blur-xl rounded-2xl border ${config.border} hover:${config.glow} hover:shadow-xl transition-all duration-300 overflow-hidden group`}
    >
      {/* Compact Header - Always Visible */}
      <motion.div 
        className="p-4 cursor-pointer min-h-[60px] flex items-center"
        onClick={() => setIsExpanded(!isExpanded)}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center justify-between w-full">
          {/* Left: Avatar + Basic Info */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <motion.div 
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.bg} border-2 ${config.border} flex items-center justify-center text-lg shadow-lg`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {config.icon}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm sm:text-base truncate">
                {client.businessName}
              </h3>
              <p className="text-xs text-gray-400 truncate">{client.managerName}</p>
            </div>
          </div>

          {/* Right: Status + Expand Button */}
          <div className="flex items-center space-x-2 ml-2">
            <div className={`px-2 py-1 rounded-full text-xs font-bold ${config.text} bg-white/10 hidden sm:block`}>
              {config.label}
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-gray-400"
            >
              <ChevronDown size={16} />
            </motion.div>
          </div>
        </div>

        {/* Mobile Status Bar */}
        <div className="sm:hidden mt-2">
          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${config.text} bg-white/10`}>
            {config.label}
          </div>
        </div>
      </motion.div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={contentVariants}
            className="px-4 pb-4 border-t border-white/10"
          >
            {/* Contact Info Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <Phone size={16} className="text-cyan-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-white truncate">{client.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <MapPin size={16} className="text-pink-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-gray-400">Location</p>
                  <p className="text-sm font-medium text-white truncate">{client.place}</p>
                </div>
              </div>
            </motion.div>

            {/* Dates Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Calendar size={16} className="text-blue-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-blue-400 font-medium">First Visit</p>
                  <p className="text-sm text-white">{new Date(client.firstVisit).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Calendar size={16} className="text-purple-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-purple-400 font-medium">Next Visit</p>
                  <p className="text-sm text-white">{new Date(client.nextVisit).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>

            {/* Deal Value */}
            {client.deal && (
              <motion.div variants={itemVariants} className="mt-3 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
                <div className="flex items-center space-x-3">
                  <DollarSign size={20} className="text-emerald-400" />
                  <div>
                    <p className="text-xs text-emerald-400 font-medium">Deal Value</p>
                    <p className="text-xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      {parseFloat(client.deal).toLocaleString()} Birr
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Description */}
            {client.description && (
              <motion.div variants={itemVariants} className="mt-3 p-4 bg-white/5 rounded-xl">
                <div className="flex items-start space-x-3">
                  <FileText size={16} className="text-gray-400 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-medium mb-1">Notes</p>
                    <p className="text-sm text-white/80 leading-relaxed">{client.description}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-2 mt-4">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(client);
                }}
                className="flex-1 bg-gradient-to-r from-amber-500/80 to-orange-500/80 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-amber-500 hover:to-orange-500 transition-all duration-300 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ✏️ Edit
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(client._id);
                }}
                className="flex-1 bg-gradient-to-r from-red-500/80 to-pink-500/80 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-red-500 hover:to-pink-500 transition-all duration-300 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🗑️ Delete
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientCard; 