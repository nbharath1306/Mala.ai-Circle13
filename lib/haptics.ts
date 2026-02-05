export const triggerHapticFeedback = (pattern: 'soft' | 'medium' | 'heavy' | 'success' | 'warning') => {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;

  switch (pattern) {
    case 'soft':
      // Short, mechanical click feel
      navigator.vibrate(15);
      break;
    case 'medium':
      // Slightly longer pulse
      navigator.vibrate(40);
      break;
    case 'heavy':
      // Deep thud
      navigator.vibrate([70]);
      break;
    case 'success':
      // Rhythmic pattern for completion (e.g., 108 beads)
      navigator.vibrate([50, 50, 50]);
      break;
    case 'warning':
      // Quick double tap
      navigator.vibrate([30, 50, 30]);
      break;
  }
};

/**
 * Triggered when a full mala (108 chants) is completed
 */
export const triggerMalaCompletion = () => {
    if (typeof navigator === 'undefined' || !navigator.vibrate) return;
    // Longer, meditative vibration pattern
    navigator.vibrate([100, 50, 100, 50, 200]);
};
