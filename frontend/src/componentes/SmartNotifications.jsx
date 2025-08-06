import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Phone, Calendar, TrendingUp, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import hapticFeedback from '../utils/haptics';

const SmartNotifications = ({ clients }) => {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const generateNotifications = () => {
      const today = new Date();
      const newNotifications = [];

      // Overdue clients
      const overdueClients = clients.filter(client => {
        const nextVisit = new Date(client.nextVisit);
        return nextVisit < today;
      });

      if (overdueClients.length > 0) {
        newNotifications.push({
          id: 'overdue',
          type: 'urgent',
          icon: AlertTriangle,
          title: `${overdueClients.length} Overdue Clients`,
          message: 'Immediate attention required',
          color: 'from-red-500 to-pink-600',
          action: () => console.log('View overdue clients'),
          priority: 1
        });
      }

      // High-value deals
      const highValueDeals = clients.filter(client => 
        parseFloat(client.deal || 0) > 50000
      );

      if (highValueDeals.length > 0) {
        newNotifications.push({
          id: 'high-value',
          type: 'opportunity',
          icon: TrendingUp,
          title: `${highValueDeals.length} High-Value Opportunities`,
          message: 'Focus on these premium clients',
          color: 'from-emerald-500 to-teal-600',
          action: () => console.log('View high-value deals'),
          priority: 2
        });
      }

      // Today's calls
      const todayCalls = clients.filter(client => {
        const nextVisit = new Date(client.nextVisit);
        return nextVisit.toDateString() === today.toDateString();
      });

      if (todayCalls.length > 0) {
        newNotifications.push({
          id: 'today-calls',
          type: 'reminder',
          icon: Phone,
          title: `${todayCalls.length} Calls Scheduled Today`,
          message: 'Ready to connect with your clients',
          color: 'from-blue-500 to-cyan-600',
          action: () => console.log('View today calls'),
          priority: 3
        });
      }

      // Performance insights
      const activeClients = clients.filter(client => client.status === 'active').length;
      const totalValue = clients.reduce((sum, client) => sum + (parseFloat(client.deal) || 0), 0);

      if (activeClients > 0) {
        newNotifications.push({
          id: 'performance',
          type: 'insight',
          icon: Zap,
          title: 'Performance Insight',
          message: `${activeClients} active clients worth ${totalValue.toLocaleString()} Birr`,
          color: 'from-purple-500 to-pink-600',
          action: () => console.log('View analytics'),
          priority: 4
        });
      }

      setNotifications(newNotifications.sort((a, b) => a.priority - b.priority));
    };

    generateNotifications();
    const interval = setInterval(generateNotifications, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [clients]);

  const dismissNotification = (id) => {
    hapticFeedback.light();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleNotificationClick = (notification) => {
    hapticFeedback.medium();
    notification.action();
    dismissNotification(notification.id);
  };

  if (notifications.length === 0) return null;

  return (
    <>
      {/* Notification Bell */}
      <motion.button
        onClick={() => {
          hapticFeedback.light();
          setIsVisible(!isVisible);
        }}
        className="fixed top-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white shadow-2xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={notifications.length > 0 ? {
          scale: [1, 1.1, 1],
          rotate: [0, 10, -10, 0]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            {notifications.length}
          </motion.div>
        )}
      </motion.button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed top-20 right-6 z-50 w-80 max-h-96 overflow-y-auto"
          >
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-black text-lg">🔔 Smart Alerts</h3>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 bg-gradient-to-r ${notification.color} rounded-2xl cursor-pointer group hover:scale-105 transition-all duration-300 relative overflow-hidden`}
                  >
                    {/* Animated Background */}
                    <motion.div
                      className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{
                        background: [
                          'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                          'linear-gradient(45deg, transparent 50%, rgba(255,255,255,0.1) 100%)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />

                    <div className="relative z-10 flex items-start space-x-3">
                      <motion.div
                        className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        {React.createElement(notification.icon, { size: 20, className: "text-white" })}
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-bold text-sm mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-white/80 text-xs leading-relaxed">
                          {notification.message}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notification.id);
                        }}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Priority Indicator */}
                    <div className="absolute bottom-2 right-2">
                      {Array.from({ length: 5 - notification.priority }, (_, i) => (
                        <motion.div
                          key={i}
                          className="inline-block w-1 h-1 bg-white/40 rounded-full mr-1"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ 
                            duration: 1, 
                            repeat: Infinity, 
                            delay: i * 0.2 
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-white/20">
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => {
                      hapticFeedback.success();
                      setNotifications([]);
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-xl font-bold text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ✅ Clear All
                  </motion.button>
                  <motion.button
                    onClick={() => setIsVisible(false)}
                    className="flex-1 bg-gradient-to-r from-gray-500 to-slate-600 text-white py-2 px-4 rounded-xl font-bold text-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    👁️ Hide
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SmartNotifications;