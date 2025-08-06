import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Phone, Users, Calendar, TrendingUp, Zap, Target } from 'lucide-react';

const FloatingActionMenu = ({ onAddClient, onQuickCall, onViewStats }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: Plus,
      label: 'Add Client',
      color: 'from-cyan-500 to-blue-600',
      action: onAddClient,
      delay: 0.1
    },
    {
      icon: Phone,
      label: 'Quick Call',
      color: 'from-green-500 to-emerald-600',
      action: onQuickCall,
      delay: 0.2
    },
    {
      icon: TrendingUp,
      label: 'Analytics',
      color: 'from-purple-500 to-pink-600',
      action: onViewStats,
      delay: 0.3
    },
    {
      icon: Calendar,
      label: 'Schedule',
      color: 'from-orange-500 to-red-600',
      action: () => console.log('Schedule'),
      delay: 0.4
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-20 right-0 space-y-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {menuItems.map((item, index) => (
              <motion.button
                key={index}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className={`flex items-center space-x-3 bg-gradient-to-r ${item.color} text-white px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/20 group`}
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.8 }}
                transition={{ 
                  duration: 0.4,
                  delay: item.delay,
                  ease: [0.23, 1, 0.32, 1]
                }}
                whileHover={{ 
                  scale: 1.05,
                  x: -5,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {React.createElement(item.icon, { size: 20 })}
                </motion.div>
                <span className="font-bold text-sm whitespace-nowrap">
                  {item.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-full flex items-center justify-center text-white shadow-2xl relative overflow-hidden group"
        whileHover={{ 
          scale: 1.1,
          boxShadow: '0 20px 40px rgba(147, 51, 234, 0.4)'
        }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
        
        {/* Pulsing Ring */}
        <motion.div
          className="absolute inset-0 border-4 border-purple-400 rounded-full"
          animate={{
            scale: 1,
            opacity: 0.7
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="relative z-10"
          animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <Plus size={24} /> : <Zap size={24} />}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default FloatingActionMenu;