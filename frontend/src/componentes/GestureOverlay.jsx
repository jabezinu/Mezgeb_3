import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, Zap, Target, Phone, Plus, TrendingUp } from 'lucide-react';
import hapticFeedback from '../utils/haptics';

const GestureOverlay = ({ onGesture }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [gestureHint, setGestureHint] = useState('');
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const gestures = {
    'swipe-up': { icon: Plus, label: 'Add Client', color: 'from-cyan-500 to-blue-600' },
    'swipe-down': { icon: TrendingUp, label: 'View Stats', color: 'from-purple-500 to-pink-600' },
    'swipe-left': { icon: Phone, label: 'Quick Call', color: 'from-green-500 to-emerald-600' },
    'swipe-right': { icon: Target, label: 'Focus Mode', color: 'from-orange-500 to-red-600' }
  };

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        setIsVisible(true);
        setTouchStart({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        });
        hapticFeedback.light();
      }
    };

    const handleTouchMove = (e) => {
      if (isVisible && touchStart && e.touches.length === 2) {
        const currentTouch = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
        
        const deltaX = currentTouch.x - touchStart.x;
        const deltaY = currentTouch.y - touchStart.y;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          setGestureHint(deltaX > 0 ? 'swipe-right' : 'swipe-left');
        } else {
          setGestureHint(deltaY > 0 ? 'swipe-down' : 'swipe-up');
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (isVisible && touchStart && gestureHint) {
        const gesture = gestures[gestureHint];
        if (gesture) {
          hapticFeedback.success();
          onGesture(gestureHint);
        }
      }
      setIsVisible(false);
      setGestureHint('');
      setTouchStart(null);
      setTouchEnd(null);
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isVisible, touchStart, gestureHint, onGesture]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none"
        >
          {/* Gesture Overlay Background */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Gesture Indicators */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-cols-3 grid-rows-3 w-80 h-80 gap-4">
              {/* Top */}
              <div></div>
              <motion.div
                className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-r ${gestures['swipe-up'].color} ${
                  gestureHint === 'swipe-up' ? 'scale-110 shadow-2xl' : 'opacity-50'
                } transition-all duration-300`}
                animate={gestureHint === 'swipe-up' ? { scale: 1.1, y: -10 } : {}}
              >
                <gestures['swipe-up'].icon className="w-8 h-8 text-white mb-2" />
                <span className="text-white font-bold text-sm">{gestures['swipe-up'].label}</span>
              </motion.div>
              <div></div>

              {/* Middle */}
              <motion.div
                className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-r ${gestures['swipe-left'].color} ${
                  gestureHint === 'swipe-left' ? 'scale-110 shadow-2xl' : 'opacity-50'
                } transition-all duration-300`}
                animate={gestureHint === 'swipe-left' ? { scale: 1.1, x: -10 } : {}}
              >
                <gestures['swipe-left'].icon className="w-8 h-8 text-white mb-2" />
                <span className="text-white font-bold text-sm">{gestures['swipe-left'].label}</span>
              </motion.div>

              {/* Center - Gesture Hint */}
              <motion.div
                className="flex items-center justify-center p-6 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 shadow-2xl"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Sparkles className="w-12 h-12 text-white" />
              </motion.div>

              <motion.div
                className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-r ${gestures['swipe-right'].color} ${
                  gestureHint === 'swipe-right' ? 'scale-110 shadow-2xl' : 'opacity-50'
                } transition-all duration-300`}
                animate={gestureHint === 'swipe-right' ? { scale: 1.1, x: 10 } : {}}
              >
                <gestures['swipe-right'].icon className="w-8 h-8 text-white mb-2" />
                <span className="text-white font-bold text-sm">{gestures['swipe-right'].label}</span>
              </motion.div>

              {/* Bottom */}
              <div></div>
              <motion.div
                className={`flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-r ${gestures['swipe-down'].color} ${
                  gestureHint === 'swipe-down' ? 'scale-110 shadow-2xl' : 'opacity-50'
                } transition-all duration-300`}
                animate={gestureHint === 'swipe-down' ? { scale: 1.1, y: 10 } : {}}
              >
                <gestures['swipe-down'].icon className="w-8 h-8 text-white mb-2" />
                <span className="text-white font-bold text-sm">{gestures['swipe-down'].label}</span>
              </motion.div>
              <div></div>
            </div>
          </div>

          {/* Instructions */}
          <motion.div
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
              <p className="text-white font-bold text-lg mb-2">🌟 Gesture Magic Active</p>
              <p className="text-gray-300 text-sm">
                Two-finger swipe in any direction to activate
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GestureOverlay;