import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { ChevronDown, Phone, MapPin, Calendar, DollarSign, FileText, Star, Zap, Target, Lock, Skull, MessageCircle, Video, Mail, ExternalLink, Sparkles, Flame, Eye } from 'lucide-react';
import hapticFeedback from '../utils/haptics';

const statusConfig = {
  started: {
    label: 'IGNITION',
    icon: Zap,
    emoji: '🚀',
    bg: 'from-amber-500/30 via-orange-500/20 to-red-500/10',
    border: 'border-amber-400/40',
    text: 'text-amber-300',
    glow: 'shadow-amber-500/30',
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
    glow: 'shadow-emerald-500/30',
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
    glow: 'shadow-blue-500/30',
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
    glow: 'shadow-gray-500/30',
    pulse: '',
    particles: 'from-gray-400 to-slate-500',
  },
  dead: {
    label: 'TERMINATED',
    icon: Skull,
    emoji: '💀',
    bg: 'from-red-500/30 via-rose-500/20 to-pink-500/10',
    border: 'border-red-400/40',
    text: 'text-red-300',
    glow: 'shadow-red-500/30',
    pulse: '',
    particles: 'from-red-400 to-pink-500',
  },
};

const ClientCard = ({ client, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const rotateY = useTransform(x, [-200, 0, 200], [-15, 0, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);

  const config = statusConfig[client.status] || statusConfig.closed;

  // Calculate days until next visit
  const daysUntilVisit = Math.ceil((new Date(client.nextVisit) - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntilVisit <= 3 && daysUntilVisit >= 0;
  const isOverdue = daysUntilVisit < 0;

  const handlePanEnd = (event, info) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setSwipeDirection('right');
      hapticFeedback.success();
      // Quick call action with visual feedback
      setTimeout(() => {
        window.open(`tel:${client.phone}`, '_self');
      }, 300);
    } else if (info.offset.x < -threshold) {
      setSwipeDirection('left');
      hapticFeedback.medium();
      // Quick edit action
      setTimeout(() => {
        onEdit(client);
      }, 300);
    } else {
      hapticFeedback.light();
    }
    x.set(0);
    setTimeout(() => setSwipeDirection(null), 500);
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

  const floatingParticles = {
    animate: {
      y: [0, -10, 0],
      opacity: [0.3, 0.8, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      drag="x"
      dragConstraints={{ left: -200, right: 200 }}
      dragElastic={0.2}
      onPanEnd={handlePanEnd}
      style={{ x, rotateY, opacity }}
      variants={cardVariants}
      initial="collapsed"
      animate={isExpanded ? "expanded" : "collapsed"}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative bg-gradient-to-br ${config.bg} backdrop-blur-2xl rounded-3xl border-2 ${config.border} hover:${config.glow} hover:shadow-2xl transition-all duration-500 overflow-hidden group cursor-grab active:cursor-grabbing ${isUrgent ? 'ring-2 ring-yellow-400/50' : ''} ${isOverdue ? 'ring-2 ring-red-500/70' : ''}`}
      whileHover={{
        scale: 1.03,
        rotateX: 5,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Floating Status Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            variants={floatingParticles}
            animate="animate"
            className={`absolute w-1 h-1 bg-gradient-to-r ${config.particles} rounded-full opacity-40`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${10 + (i % 3) * 30}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Swipe Indicators */}
      <AnimatePresence>
        {swipeDirection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={`absolute inset-0 flex items-center justify-center z-20 ${swipeDirection === 'right'
              ? 'bg-green-500/20 text-green-300'
              : 'bg-blue-500/20 text-blue-300'
              } backdrop-blur-sm rounded-3xl`}
          >
            <div className="text-center">
              {swipeDirection === 'right' ? (
                <>
                  <Phone className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-bold">CALLING...</p>
                </>
              ) : (
                <>
                  <FileText className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-bold">EDITING...</p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Urgency Banner */}
      {(isUrgent || isOverdue) && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`absolute top-0 left-0 right-0 ${isOverdue ? 'bg-red-500/90' : 'bg-yellow-500/90'
            } text-white text-xs font-bold py-1 px-3 text-center z-10`}
        >
          {isOverdue ? `⚠️ OVERDUE BY ${Math.abs(daysUntilVisit)} DAYS` : `🔥 URGENT - ${daysUntilVisit} DAYS LEFT`}
        </motion.div>
      )}
      {/* Revolutionary Header */}
      <motion.div
        className={`p-5 cursor-pointer min-h-[80px] flex items-center relative ${isUrgent || isOverdue ? 'pt-8' : ''}`}
        onClick={() => {
          hapticFeedback.light();
          setIsExpanded(!isExpanded);
        }}
        onDoubleClick={() => {
          hapticFeedback.heavy();
          window.open(`tel:${client.phone}`, '_self');
        }}
        whileTap={{ scale: 0.97 }}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center justify-between w-full">
          {/* Revolutionary Avatar Section */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <motion.div
              className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${config.bg} border-2 ${config.border} flex items-center justify-center shadow-2xl overflow-hidden`}
              whileHover={{
                scale: 1.15,
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.5 }
              }}
              animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            >
              {/* Animated Background */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${config.particles} opacity-20`}
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 4,
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
                {React.createElement(config.icon, { className: "w-5 h-5" })}
              </motion.div>

              {/* Emoji Overlay */}
              <motion.div
                className="absolute -top-1 -right-1 text-lg"
                animate={{
                  scale: 1,
                  rotate: 0
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {config.emoji}
              </motion.div>
            </motion.div>

            {/* Client Info with Animations */}
            <div className="flex-1 min-w-0">
              <motion.h3
                className="font-black text-white text-base sm:text-lg truncate mb-1"
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
                className="text-sm text-gray-300 truncate mb-1"
                whileHover={{ color: '#ffffff' }}
              >
                👤 {client.managerName}
              </motion.p>

              {/* Quick Stats */}
              <div className="flex items-center space-x-3 text-xs">
                <motion.span
                  className="flex items-center space-x-1 text-cyan-400"
                  whileHover={{ scale: 1.1 }}
                >
                  <Phone className="w-3 h-3" />
                  <span>{client.phone?.slice(-4)}</span>
                </motion.span>
                <motion.span
                  className="flex items-center space-x-1 text-purple-400"
                  whileHover={{ scale: 1.1 }}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{client.place?.split(' | ')[0]?.slice(0, 8) || client.place?.slice(0, 8)}...</span>
                </motion.span>
              </div>
            </div>
          </div>

          {/* Status & Controls */}
          <div className="flex flex-col items-end space-y-2 ml-3">
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

            {/* Deal Value Preview */}
            {client.deal && (
              <motion.div
                className="text-xs font-bold text-emerald-400"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                💰 {parseFloat(client.deal).toLocaleString()}
              </motion.div>
            )}

            {/* Expand Button */}
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
              📅 {daysUntilVisit >= 0 ? `${daysUntilVisit}d left` : `${Math.abs(daysUntilVisit)}d overdue`}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Revolutionary Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={contentVariants}
            className="px-5 pb-5 border-t border-white/20"
          >
            {/* Quick Action Bar */}
            <motion.div variants={itemVariants} className="flex justify-center space-x-2 mt-4 mb-6">
              {[
                { icon: Phone, color: 'from-green-500 to-emerald-600', action: () => { hapticFeedback.success(); window.open(`tel:${client.phone}`, '_self'); }, label: 'Call', effect: '' },
                { icon: MessageCircle, color: 'from-blue-500 to-cyan-600', action: () => { hapticFeedback.medium(); window.open(`sms:${client.phone}`, '_self'); }, label: 'SMS', effect: '' },
                { icon: Mail, color: 'from-purple-500 to-pink-600', action: () => { hapticFeedback.light(); window.open(`mailto:${client.email || ''}`, '_self'); }, label: 'Email', effect: '' },
                { icon: ExternalLink, color: 'from-orange-500 to-red-600', action: () => { 
                  hapticFeedback.medium(); 
                  const mapUrl = client.place?.includes(' | ') && client.place.split(' | ')[1]?.includes('maps.google.com') 
                    ? client.place.split(' | ')[1].split(' | ')[1] || client.place.split(' | ')[1]
                    : `https://maps.google.com/?q=${encodeURIComponent(client.place?.split(' | ')[0] || client.place)}`;
                  window.open(mapUrl, '_blank'); 
                }, label: 'Map', effect: '' }
              ].map((item, index) => (
                <motion.button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.action();
                  }}
                  className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center text-white shadow-lg relative overflow-hidden group`}
                  whileHover={{
                    scale: 1.15,
                    rotate: 5,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                  }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Magical Sparkle Effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    animate={{
                      background: [
                        'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                        'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                        'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
                        'radial-gradient(circle at 50% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <motion.div
                    className={isHovered ? item.effect : ''}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <item.icon size={18} />
                  </motion.div>
                </motion.button>
              ))}
            </motion.div>

            {/* Enhanced Contact Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <motion.div
                className="group p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Phone size={18} className="text-white" />
                  </motion.div>
                  <div className="min-w-0">
                    <p className="text-xs text-cyan-400 font-bold uppercase tracking-wider">Direct Line</p>
                    <p className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {client.phone}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="group p-4 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-2xl border border-pink-500/20 hover:border-pink-400/40 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <MapPin size={18} className="text-white" />
                  </motion.div>
                  <div className="min-w-0">
                    <p className="text-xs text-pink-400 font-bold uppercase tracking-wider">Location</p>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-pink-300 transition-colors">
                        {client.place?.split(' | ')[0] || client.place}
                      </p>
                      {/* View Location button - only shown in expanded view */}
                      {client.place?.includes(' | ') && client.place.split(' | ')[1]?.includes('maps.google.com') && (
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            const mapUrl = client.place.split(' | ')[1].split(' | ')[1] || client.place.split(' | ')[1];
                            window.open(mapUrl, '_blank');
                          }}
                          className="mt-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold rounded-lg hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 flex items-center"
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
            </motion.div>

            {/* Timeline Section */}
            <motion.div variants={itemVariants} className="mt-6">
              <h4 className="text-sm font-black text-white mb-4 flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                TIMELINE
              </h4>
              <div className="space-y-3">
                <motion.div
                  className="flex items-center space-x-4 p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/20"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-xs text-blue-400 font-bold">FIRST CONTACT</p>
                    <p className="text-sm text-white">{new Date(client.firstVisit).toLocaleDateString()}</p>
                  </div>
                </motion.div>

                <motion.div
                  className={`flex items-center space-x-4 p-3 rounded-xl border ${isOverdue
                    ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/40'
                    : isUrgent
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/40'
                      : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20'
                    }`}
                  whileHover={{ x: 5 }}
                  animate={isOverdue || isUrgent ? { scale: [1, 1.02, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className={`w-3 h-3 rounded-full ${isOverdue ? 'bg-red-500' : isUrgent ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}></div>
                  <div>
                    <p className={`text-xs font-bold ${isOverdue ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-purple-400'
                      }`}>
                      {isOverdue ? 'OVERDUE VISIT' : isUrgent ? 'URGENT VISIT' : 'NEXT VISIT'}
                    </p>
                    <p className="text-sm text-white">{new Date(client.nextVisit).toLocaleDateString()}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Deal Value Showcase */}
            {client.deal && (
              <motion.div
                variants={itemVariants}
                className="mt-6 p-6 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-green-500/20 rounded-2xl border border-emerald-500/30 relative overflow-hidden"
                whileHover={{ scale: 1.02 }}
              >
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-teal-400/10"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div
                      className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <DollarSign size={24} className="text-white" />
                    </motion.div>
                    <div>
                      <p className="text-xs text-emerald-400 font-black uppercase tracking-wider">Deal Value</p>
                      <motion.p
                        className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-green-400 bg-clip-text text-transparent"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {parseFloat(client.deal).toLocaleString()} Birr
                      </motion.p>
                    </div>
                  </div>
                  <motion.div
                    className="text-4xl"
                    animate={{
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    💰
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Notes Section */}
            {client.description && (
              <motion.div variants={itemVariants} className="mt-6 p-4 bg-gradient-to-br from-slate-500/10 to-gray-500/10 rounded-2xl border border-slate-500/20">
                <div className="flex items-start space-x-3">
                  <motion.div
                    className="w-8 h-8 bg-gradient-to-r from-slate-500 to-gray-500 rounded-lg flex items-center justify-center mt-1"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FileText size={16} className="text-white" />
                  </motion.div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Intelligence Notes</p>
                    <motion.p
                      className="text-sm text-white/90 leading-relaxed"
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {client.description}
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Revolutionary Action Buttons */}
            <motion.div variants={itemVariants} className="flex gap-3 mt-6">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(client);
                }}
                className="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white py-3 px-6 rounded-2xl font-black text-sm shadow-lg relative overflow-hidden group"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 15px 35px rgba(245, 158, 11, 0.4)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="relative z-10 flex items-center justify-center">
                  <FileText className="w-4 h-4 mr-2" />
                  MODIFY
                </span>
              </motion.button>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(client._id);
                }}
                className="flex-1 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white py-3 px-6 rounded-2xl font-black text-sm shadow-lg relative overflow-hidden group"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 15px 35px rgba(239, 68, 68, 0.4)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="relative z-10 flex items-center justify-center">
                  <Skull className="w-4 h-4 mr-2" />
                  TERMINATE
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientCard; 