import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ChevronDown, Phone, MapPin, Calendar, DollarSign, FileText, AlertCircle, Zap, Star, Target, Lock, MessageCircle, Video, Mail, Clock, TrendingUp, Activity, Sparkles, Flame, Eye, CheckCircle } from 'lucide-react';
import hapticFeedback from '../utils/haptics';

const statusConfig = {
  started: {
    label: 'IGNITION',
    icon: Zap,
    emoji: '🚀',
    bg: 'from-amber-500/30 via-orange-500/20 to-red-500/10',
    border: 'border-amber-400/40',
    text: 'text-amber-300',
    glow: 'shadow-amber-500/40',
    pulse: '',
    particles: 'from-amber-400 to-orange-500',
  },
  active: {
    label: 'BLAZING',
    icon: Star,
    emoji: '⚡',
    bg: 'from-emerald-500/30 via-green-500/20 to-teal-500/10',
    border: 'border-emerald-400/40',
    text: 'text-emerald-300',
    glow: 'shadow-emerald-500/40',
    pulse: '',
    particles: 'from-emerald-400 to-teal-500',
  },
  onaction: {
    label: 'LOCKED ON',
    icon: Target,
    emoji: '🎯',
    bg: 'from-blue-500/30 via-indigo-500/20 to-purple-500/10',
    border: 'border-blue-400/40',
    text: 'text-blue-300',
    glow: 'shadow-blue-500/40',
    pulse: '',
    particles: 'from-blue-400 to-purple-500',
  },
  closed: {
    label: 'SEALED',
    icon: Lock,
    emoji: '🔒',
    bg: 'from-gray-500/30 via-slate-500/20 to-stone-500/10',
    border: 'border-gray-400/40',
    text: 'text-gray-300',
    glow: 'shadow-gray-500/40',
    pulse: '',
    particles: 'from-gray-400 to-slate-500',
  },
  dead: {
    label: 'DECEASED',
    icon: AlertCircle,
    emoji: '💀',
    bg: 'from-gray-700/30 via-gray-900/20 to-black/10',
    border: 'border-gray-600/40',
    text: 'text-gray-400',
    glow: 'shadow-gray-700/40',
    pulse: 'opacity-50',
    particles: 'from-gray-600 to-gray-800',
  },
};

const CallTodayCard = ({ client, onEdit, onDelete, isMissed }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [callStatus, setCallStatus] = useState('ready'); // ready, calling, completed
  const [editData, setEditData] = useState({ ...client });
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const rotateY = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);
  
  const config = statusConfig[client.status] || statusConfig.closed;
  
  // Calculate urgency level
  const daysOverdue = Math.abs(Math.ceil((new Date(client.nextVisit) - new Date()) / (1000 * 60 * 60 * 24)));
  const urgencyLevel = isMissed ? (daysOverdue > 7 ? 'critical' : daysOverdue > 3 ? 'high' : 'medium') : 'normal';

  const handlePanEnd = (event, info) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      // Swipe right - Instant call
      handleQuickCall();
    } else if (info.offset.x < -threshold) {
      // Swipe left - Mark as completed
      handleMarkCompleted();
    }
    x.set(0);
  };

  const handleQuickCall = () => {
    setCallStatus('calling');
    hapticFeedback.success();
    window.open(`tel:${client.phone}`, '_self');
    setTimeout(() => {
      setCallStatus('completed');
      hapticFeedback.notification();
    }, 2000);
  };

  const handleMarkCompleted = () => {
    hapticFeedback.heavy();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7); // Schedule next week
    const updatedClient = {
      ...client,
      nextVisit: tomorrow.toISOString().split('T')[0],
      status: 'active'
    };
    onEdit(updatedClient);
  };

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

  const cardVariants = {
    collapsed: {
      height: 'auto',
      scale: 1,
      transition: { 
        duration: 0.6, 
        ease: [0.23, 1, 0.32, 1],
        staggerChildren: 0.1
      }
    },
    expanded: {
      height: 'auto',
      scale: 1.02,
      transition: { 
        duration: 0.6, 
        ease: [0.23, 1, 0.32, 1],
        staggerChildren: 0.1
      }
    }
  };

  const contentVariants = {
    hidden: { 
      opacity: 0, 
      y: -20,
      scale: 0.95,
      transition: { duration: 0.3 }
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1],
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20, scale: 0.9 },
    visible: { 
      opacity: 1, 
      x: 0, 
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1]
      }
    }
  };

  const urgencyColors = {
    critical: 'from-red-600 via-red-500 to-pink-500',
    high: 'from-orange-600 via-orange-500 to-yellow-500',
    medium: 'from-yellow-600 via-yellow-500 to-amber-500',
    normal: 'from-blue-600 via-blue-500 to-cyan-500'
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      drag="x"
      dragConstraints={{ left: -250, right: 250 }}
      dragElastic={0.2}
      onPanEnd={handlePanEnd}
      style={{ x, rotateY, opacity }}
      variants={cardVariants}
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative bg-gradient-to-br ${config.bg} backdrop-blur-2xl rounded-3xl border-2 ${config.border} hover:${config.glow} hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-grab active:cursor-grabbing ${
        isMissed 
          ? urgencyLevel === 'critical' 
            ? 'ring-4 ring-red-500/80 shadow-red-500/50' 
            : urgencyLevel === 'high'
              ? 'ring-3 ring-orange-500/70 shadow-orange-500/40'
              : 'ring-2 ring-yellow-500/60 shadow-yellow-500/30'
          : ''
      }`}
      whileHover={{ 
        scale: 1.05,
        rotateX: 5,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Swipe Indicators */}
      <motion.div
        className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: x.get() !== 0 ? 1 : 0 }}
      >
        <motion.div
          className="flex flex-col items-center text-green-400"
          animate={{ 
            scale: x.get() > 50 ? 1.2 : 1,
            opacity: x.get() > 50 ? 1 : 0.5
          }}
        >
          <Phone className="w-8 h-8 mb-1" />
          <span className="text-xs font-bold">CALL</span>
        </motion.div>
        
        <motion.div
          className="flex flex-col items-center text-blue-400"
          animate={{ 
            scale: x.get() < -50 ? 1.2 : 1,
            opacity: x.get() < -50 ? 1 : 0.5
          }}
        >
          <Activity className="w-8 h-8 mb-1" />
          <span className="text-xs font-bold">DONE</span>
        </motion.div>
      </motion.div>

      {/* Urgency Alert Banner */}
      {isMissed && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`absolute top-0 left-0 right-0 bg-gradient-to-r ${urgencyColors[urgencyLevel]} text-white text-xs font-black py-2 px-4 text-center z-10`}
        >
          {urgencyLevel === 'critical' && '🚨 CRITICAL: '}
          {urgencyLevel === 'high' && '⚠️ HIGH PRIORITY: '}
          {urgencyLevel === 'medium' && '⏰ ATTENTION: '}
          OVERDUE BY {daysOverdue} DAYS
        </motion.div>
      )}

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 bg-gradient-to-r ${config.particles} rounded-full opacity-60`}
            animate={{
              y: [0, -15, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3
            }}
            style={{
              left: `${15 + i * 10}%`,
              top: `${20 + (i % 4) * 20}%`,
            }}
          />
        ))}
      </div>
      {/* Revolutionary Call-Ready Header */}
      <motion.div 
        className={`p-5 cursor-pointer min-h-[90px] flex items-center relative ${isMissed ? 'pt-10' : ''}`}
        onClick={() => {
          hapticFeedback.light();
          setIsExpanded(!isExpanded);
        }}
        onDoubleClick={() => {
          hapticFeedback.heavy();
          handleQuickCall();
        }}
        whileTap={{ scale: 0.97 }}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center justify-between w-full">
          {/* Enhanced Avatar with Call Status */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <motion.div 
              className={`relative w-18 h-18 rounded-3xl bg-gradient-to-br ${config.bg} border-3 ${config.border} flex items-center justify-center shadow-2xl overflow-hidden`}
              whileHover={{ 
                scale: 1.2, 
                rotate: [0, -10, 10, 0],
                transition: { duration: 0.6 }
              }}
              animate={callStatus === 'calling' ? { 
                scale: [1, 1.3, 1],
                rotate: [0, 360]
              } : {}}
            >
              {/* Pulsing Call Ring */}
              {callStatus === 'calling' && (
                <motion.div
                  className="absolute inset-0 border-4 border-green-400 rounded-3xl"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity
                  }}
                />
              )}
              
              {/* Animated Background */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${config.particles} opacity-30`}
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.3, 1]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              {/* Status Icon */}
              <motion.div
                className={`relative z-10 ${config.text} ${config.pulse}`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {callStatus === 'calling' ? <Phone className="w-6 h-6" /> : React.createElement(config.icon, { className: "w-5 h-5" })}
              </motion.div>
              
              {/* Urgency Indicator */}
              {isMissed && (
                <motion.div
                  className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
                    urgencyLevel === 'critical' ? 'bg-red-500' : 
                    urgencyLevel === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}
                  animate={{
                    scale: 1,
                    rotate: 0
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  <AlertCircle size={12} className="text-white" />
                </motion.div>
              )}
              
              {/* Emoji Status */}
              <motion.div
                className="absolute -bottom-1 -right-1 text-xl"
                animate={{
                  scale: 1,
                  rotate: 0
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {callStatus === 'completed' ? '✅' : config.emoji}
              </motion.div>
            </motion.div>
            
            {/* Enhanced Client Info */}
            <div className="flex-1 min-w-0">
              <motion.h3 
                className="font-black text-white text-lg sm:text-xl truncate mb-1"
                animate={isHovered ? { 
                  backgroundImage: 'linear-gradient(45deg, #06b6d4, #8b5cf6, #ec4899)',
                  backgroundClip: 'text',
                  color: 'transparent'
                } : {}}
                transition={{ duration: 0.3 }}
              >
                {client.businessName}
              </motion.h3>
              <motion.p 
                className="text-sm text-gray-300 truncate mb-2"
                whileHover={{ color: '#ffffff' }}
              >
                👤 {client.managerName}
              </motion.p>
              
              {/* Call Priority Indicator */}
              <div className="flex items-center space-x-2 mb-2">
                <motion.div
                  className={`px-2 py-1 rounded-full text-xs font-bold ${
                    urgencyLevel === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/40' :
                    urgencyLevel === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                    urgencyLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  }`}
                  animate={isMissed ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  {urgencyLevel === 'critical' && '🚨 CRITICAL'}
                  {urgencyLevel === 'high' && '⚠️ HIGH'}
                  {urgencyLevel === 'medium' && '⏰ MEDIUM'}
                  {urgencyLevel === 'normal' && '📞 READY'}
                </motion.div>
              </div>
              
              {/* Quick Contact Info */}
              <div className="flex items-center space-x-4 text-xs">
                <motion.span 
                  className="flex items-center space-x-1 text-cyan-400"
                  whileHover={{ scale: 1.1 }}
                >
                  <Phone className="w-3 h-3" />
                  <span>{client.phone}</span>
                </motion.span>
                <motion.span 
                  className="flex items-center space-x-1 text-purple-400"
                  whileHover={{ scale: 1.1 }}
                >
                  <Clock className="w-3 h-3" />
                  <span>{isMissed ? `${daysOverdue}d overdue` : 'Today'}</span>
                </motion.span>
              </div>
            </div>
          </div>

          {/* Call Action Center */}
          <div className="flex flex-col items-end space-y-3 ml-4">
            {/* Instant Call Button */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleQuickCall();
              }}
              className={`w-14 h-14 bg-gradient-to-r ${
                callStatus === 'calling' ? 'from-green-600 to-emerald-700' :
                callStatus === 'completed' ? 'from-blue-600 to-cyan-700' :
                'from-green-500 to-emerald-600'
              } rounded-2xl flex items-center justify-center text-white shadow-2xl relative overflow-hidden`}
              whileHover={{ 
                scale: 1.15,
                boxShadow: '0 15px 35px rgba(16, 185, 129, 0.4)'
              }}
              whileTap={{ scale: 0.9 }}
              animate={callStatus === 'calling' ? {
                scale: 1,
                rotate: 0
              } : {}}
            >
              <motion.div
                animate={callStatus === 'calling' ? {
                  scale: 1,
                  opacity: 1
                } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                {callStatus === 'calling' ? (
                  <Activity className="w-6 h-6" />
                ) : callStatus === 'completed' ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <Phone className="w-6 h-6" />
                )}
              </motion.div>
            </motion.button>
            
            {/* Status Badge */}
            <motion.div 
              className={`px-3 py-1.5 rounded-2xl text-xs font-black ${config.text} bg-white/10 backdrop-blur-sm border ${config.border} hidden sm:block`}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: 'rgba(255,255,255,0.2)'
              }}
            >
              {config.label}
            </motion.div>
            
            {/* Deal Value */}
            {client.deal && (
              <motion.div 
                className="text-xs font-bold text-emerald-400 text-center"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💰<br/>{parseFloat(client.deal).toLocaleString()}
              </motion.div>
            )}
            
            {/* Expand Indicator */}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="text-gray-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.2 }}
            >
              <ChevronDown size={20} />
            </motion.div>
          </div>
        </div>

        {/* Mobile Status Bar */}
        <div className="sm:hidden absolute bottom-2 left-5 right-5">
          <div className="flex items-center justify-between">
            <motion.div 
              className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${config.text} bg-white/10 backdrop-blur-sm`}
              whileHover={{ scale: 1.05 }}
            >
              {config.label}
            </motion.div>
            <div className="text-xs text-gray-400">
              📅 {new Date(client.nextVisit).toLocaleDateString()}
            </div>
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
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{client.place?.split(' | ')[0] || client.place}</p>
                        {/* View Location button - only shown in expanded view */}
                        {client.place?.includes(' | ') && client.place.split(' | ')[1]?.includes('maps.google.com') && (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              const mapUrl = client.place.split(' | ')[1].split(' | ')[1] || client.place.split(' | ')[1];
                              window.open(mapUrl, '_blank');
                            }}
                            className="mt-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold rounded-md hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 flex items-center"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View Location
                          </motion.button>
                        )}
                      </div>
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