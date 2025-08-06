// Haptic feedback simulation for mobile devices
export const hapticFeedback = {
  light: () => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  },
  
  medium: () => {
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  },
  
  heavy: () => {
    if (navigator.vibrate) {
      navigator.vibrate([30, 10, 30]);
    }
  },
  
  success: () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 25, 50]);
    }
  },
  
  error: () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
  },
  
  notification: () => {
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }
};

export default hapticFeedback;