import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Phone, MapPin, Calendar, DollarSign, FileText, AlertCircle } from 'lucide-react';

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
};

const CallTodayCard = ({ client, onEdit, onDelete, isMissed }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...client });
  const config = statusConfig[client.status] || statusConfig.closed;

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = () => {
    onEdit(editData);
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditData({ ...client });
    setIsEditing(false);
  };

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
      className={`relative bg-gradient-to-br ${config.bg} backdrop-blur-xl rounded-2xl border ${config.border} hover:${config.glow} hover:shadow-xl transition-all duration-300 overflow-hidden group ${isMissed ? 'ring-2 ring-red-500/50' : ''}`}
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
              className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.bg} border-2 ${config.border} flex items-center justify-center text-lg shadow-lg relative`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {config.icon}
              {isMissed && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <AlertCircle size={10} className="text-white" />
                </div>
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm sm:text-base truncate">
                {client.businessName}
              </h3>
              <p className="text-xs text-gray-400 truncate">{client.managerName}</p>
              {isMissed && (
                <p className="text-xs text-red-400 font-medium">⚠️ Missed Call</p>
              )}
            </div>
          </div>

          {/* Right: Quick Call + Expand */}
          <div className="flex items-center space-x-2 ml-2">
            <motion.a
              href={`tel:${client.phone}`}
              className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white shadow-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Phone size={14} />
            </motion.a>
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
        <div className="sm:hidden mt-2 flex items-center justify-between">
          <div className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${config.text} bg-white/10`}>
            {config.label}
          </div>
          <div className="text-xs text-gray-400">
            Next: {new Date(client.nextVisit).toLocaleDateString()}
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
            {isEditing ? (
              /* Edit Form */
              <motion.form
                variants={itemVariants}
                onSubmit={(e) => { e.preventDefault(); handleEditSave(); }}
                className="space-y-3 mt-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    name="businessName"
                    value={editData.businessName || ''}
                    onChange={handleEditChange}
                    placeholder="Business Name"
                    className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                  />
                  <input
                    name="managerName"
                    value={editData.managerName || ''}
                    onChange={handleEditChange}
                    placeholder="Manager Name"
                    className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                  />
                  <input
                    name="phone"
                    value={editData.phone || ''}
                    onChange={handleEditChange}
                    placeholder="Phone"
                    className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                  />
                  <input
                    name="place"
                    value={editData.place || ''}
                    onChange={handleEditChange}
                    placeholder="Place"
                    className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                  />
                  <input
                    name="firstVisit"
                    type="date"
                    value={editData.firstVisit ? editData.firstVisit.slice(0,10) : ''}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                  />
                  <input
                    name="nextVisit"
                    type="date"
                    value={editData.nextVisit ? editData.nextVisit.slice(0,10) : ''}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                  />
                  <select
                    name="status"
                    value={editData.status || ''}
                    onChange={handleEditChange}
                    className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                  >
                    <option value="started">🚀 Started</option>
                    <option value="active">⚡ Active</option>
                    <option value="onaction">🎯 On Action</option>
                    <option value="closed">🔒 Closed</option>
                  </select>
                  <input
                    name="deal"
                    type="number"
                    value={editData.deal || ''}
                    onChange={handleEditChange}
                    placeholder="Deal Value"
                    className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                  />
                </div>
                <textarea
                  name="description"
                  value={editData.description || ''}
                  onChange={handleEditChange}
                  placeholder="Description"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-600 bg-slate-900/40 text-white rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 text-sm"
                  >
                    💾 Save
                  </button>
                  <button
                    type="button"
                    onClick={handleEditCancel}
                    className="flex-1 bg-gray-500/20 text-gray-300 py-2 px-4 rounded-lg font-semibold hover:bg-gray-500/30 transition-all duration-300 text-sm"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </motion.form>
            ) : (
              /* View Mode */
              <>
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
                  
                  <div className={`flex items-center space-x-3 p-3 rounded-xl border ${isMissed ? 'bg-red-500/10 border-red-500/20' : 'bg-purple-500/10 border-purple-500/20'}`}>
                    <Calendar size={16} className={`flex-shrink-0 ${isMissed ? 'text-red-400' : 'text-purple-400'}`} />
                    <div className="min-w-0">
                      <p className={`text-xs font-medium ${isMissed ? 'text-red-400' : 'text-purple-400'}`}>
                        {isMissed ? 'Missed Visit' : 'Next Visit'}
                      </p>
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
                      setIsEditing(true);
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
                  <motion.a
                    href={`tel:${client.phone}`}
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button className="w-full bg-gradient-to-r from-cyan-500/80 to-blue-500/80 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 text-sm">
                      📞 Call
                    </button>
                  </motion.a>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CallTodayCard;