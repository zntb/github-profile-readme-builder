'use client';

import React, { createContext, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { toast } from 'sonner';

// Import React for useContext

// Types for notifications
export type NotificationId =
  | 'duplicate-block'
  | 'keyboard-shortcuts'
  | 'templates'
  | 'profiles'
  | 'drag-drop'
  | 'undo-redo'
  | 'container-blocks'
  | 'stats-row'
  | 'search-blocks'
  | 'theme-customization'
  | 'auto-save'
  | 'mobile-swipe';

export interface Notification {
  id: NotificationId;
  title: string;
  description: string;
  dismissible: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  // Condition to show the notification
  condition: () => boolean;
  // How long to wait before showing (in ms)
  delay?: number;
  // Once shown, don't show again for this session
  oncePerSession?: boolean;
}

interface NotificationContextValue {
  showNotification: (id: NotificationId) => void;
  dismissNotification: (id: NotificationId) => void;
  isNotificationDismissed: (id: NotificationId) => boolean;
  trackAction: (action: string) => void;
  getActionCount: (action: string) => number;
}

// Storage keys
const DISMISSED_NOTIFICATIONS_KEY = 'github-builder-dismissed-notifications';
const NOTIFICATION_SHOWN_KEY = 'github-builder-notifications-shown';

// Notification definitions
export const notifications: Notification[] = [
  {
    id: 'duplicate-block',
    title: 'Did you know?',
    description:
      'You can duplicate any block by selecting it and pressing Ctrl+D (or Cmd+D on Mac).',
    dismissible: true,
    oncePerSession: true,
    condition: () => true,
    delay: 5000,
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Press ? or / to view all keyboard shortcuts and work faster.',
    dismissible: true,
    oncePerSession: true,
    condition: () => true,
    delay: 8000,
  },
  {
    id: 'templates',
    title: 'Start from a Template',
    description: 'Use the Templates button in the header to start with pre-made README layouts.',
    dismissible: true,
    oncePerSession: true,
    condition: () => true,
    delay: 10000,
  },
  {
    id: 'profiles',
    title: 'Save Your Profiles',
    description:
      'Create multiple profiles with Ctrl+Shift+S and switch between them with Ctrl+1-9.',
    dismissible: true,
    oncePerSession: true,
    condition: () => true,
    delay: 12000,
  },
  {
    id: 'drag-drop',
    title: 'Drag & Drop',
    description:
      'You can drag blocks to reorder them on the canvas. Use Ctrl+Arrow keys for precise control.',
    dismissible: true,
    oncePerSession: true,
    condition: () => true,
    delay: 15000,
  },
  {
    id: 'undo-redo',
    title: 'Undo & Redo',
    description: 'Made a mistake? Use Ctrl+Z to undo and Ctrl+Y to redo your changes.',
    dismissible: true,
    oncePerSession: true,
    condition: () => true,
    delay: 18000,
  },
  {
    id: 'container-blocks',
    title: 'Container Blocks',
    description: 'Use Container or Collapsible blocks to group related content together.',
    dismissible: true,
    oncePerSession: true,
    condition: () => true,
    delay: 20000,
  },
  {
    id: 'stats-row',
    title: 'Stats Row Layout',
    description: 'Add a Stats Row block to display multiple stats cards side by side.',
    dismissible: true,
    oncePerSession: true,
    condition: () => true,
    delay: 22000,
  },
  {
    id: 'search-blocks',
    title: 'Search Blocks',
    description:
      'Use the search bar in the block sidebar to quickly find blocks by name or category.',
    dismissible: true,
    oncePerSession: true,
    condition: () => true,
    delay: 24000,
  },
  {
    id: 'theme-customization',
    title: 'Customize Themes',
    description:
      'Many blocks support custom themes, gradients, and colors. Check the configuration panel!',
    dismissible: true,
    oncePerSession: true,
    condition: () => true,
    delay: 26000,
  },
  {
    id: 'auto-save',
    title: 'Auto-Save Enabled',
    description:
      'Your work is automatically saved to your browser. You can close and come back later!',
    dismissible: true,
    oncePerSession: true,
    condition: () => true,
    delay: 3000,
  },
  {
    id: 'mobile-swipe',
    title: 'Mobile Friendly',
    description:
      'Swipe between Blocks, Canvas, and Preview tabs on mobile. Tap a block to configure it.',
    dismissible: true,
    oncePerSession: true,
    condition: () => {
      // Only show on mobile
      if (typeof window === 'undefined') return false;
      return window.innerWidth < 768;
    },
    delay: 5000,
  },
];

export const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

// Custom hook to track session storage for notifications
function useNotificationStorage() {
  const [dismissedNotifications, setDismissedNotifications] = React.useState<Set<NotificationId>>(
    new Set(),
  );
  const [notificationsShown, setNotificationsShown] = React.useState<Set<NotificationId>>(
    new Set(),
  );

  // Load from session storage on mount
  React.useEffect(() => {
    try {
      const storedDismissed = sessionStorage.getItem(DISMISSED_NOTIFICATIONS_KEY);
      if (storedDismissed) {
        setDismissedNotifications(new Set(JSON.parse(storedDismissed)));
      }
    } catch {
      // Ignore errors
    }

    try {
      const storedShown = sessionStorage.getItem(NOTIFICATION_SHOWN_KEY);
      if (storedShown) {
        setNotificationsShown(new Set(JSON.parse(storedShown)));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  const saveDismissed = useCallback((notifications: Set<NotificationId>) => {
    try {
      sessionStorage.setItem(DISMISSED_NOTIFICATIONS_KEY, JSON.stringify([...notifications]));
    } catch {
      // Ignore errors
    }
  }, []);

  const saveShown = useCallback((notifications: Set<NotificationId>) => {
    try {
      sessionStorage.setItem(NOTIFICATION_SHOWN_KEY, JSON.stringify([...notifications]));
    } catch {
      // Ignore errors
    }
  }, []);

  return {
    dismissedNotifications,
    setDismissedNotifications,
    notificationsShown,
    setNotificationsShown,
    saveDismissed,
    saveShown,
  };
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const {
    dismissedNotifications,
    setDismissedNotifications,
    notificationsShown,
    setNotificationsShown,
    saveDismissed,
    saveShown,
  } = useNotificationStorage();

  const actionCounts = useRef<Map<string, number>>(new Map());
  const hasInitialized = useRef(false);

  const showPendingNotifications = useCallback(() => {
    for (const notification of notifications) {
      // Skip if already dismissed or already shown (for oncePerSession)
      if (
        dismissedNotifications.has(notification.id) ||
        (notification.oncePerSession && notificationsShown.has(notification.id))
      ) {
        continue;
      }

      // Check condition
      if (!notification.condition()) {
        continue;
      }

      // Calculate delay
      const delay = notification.delay || 0;

      setTimeout(() => {
        // Double-check dismissal status before showing
        if (
          dismissedNotifications.has(notification.id) ||
          (notification.oncePerSession && notificationsShown.has(notification.id))
        ) {
          return;
        }

        // Show the toast
        const toastId = notification.id;
        toast(notification.title, {
          description: notification.description,
          duration: 8000,
          id: toastId,
          action: notification.action
            ? {
                label: notification.action.label,
                onClick: notification.action.onClick,
              }
            : undefined,
          onDismiss: () => {
            // Mark as shown when dismissed
            setNotificationsShown((prev) => {
              const newSet = new Set(prev);
              newSet.add(notification.id);
              saveShown(newSet);
              return newSet;
            });
          },
        });

        // Mark as shown
        setNotificationsShown((prev) => {
          const newSet = new Set(prev);
          newSet.add(notification.id);
          saveShown(newSet);
          return newSet;
        });
      }, delay);
    }
  }, [dismissedNotifications, notificationsShown, setNotificationsShown, saveShown]);

  // Show notifications after component mounts
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // Small delay to ensure components are ready
      const timer = setTimeout(showPendingNotifications, 500);
      return () => clearTimeout(timer);
    }
  }, [showPendingNotifications]);

  const showNotification = useCallback(
    (id: NotificationId) => {
      const notification = notifications.find((n) => n.id === id);
      if (!notification) return;

      // Check if already dismissed
      if (dismissedNotifications.has(id)) return;

      toast(notification.title, {
        description: notification.description,
        duration: 8000,
        id: id,
        action: notification.action
          ? {
              label: notification.action.label,
              onClick: notification.action.onClick,
            }
          : undefined,
      });
    },
    [dismissedNotifications],
  );

  const dismissNotification = useCallback(
    (id: NotificationId) => {
      setDismissedNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.add(id);
        saveDismissed(newSet);
        return newSet;
      });
      // Also mark as shown so it doesn't appear again
      setNotificationsShown((prev) => {
        const newSet = new Set(prev);
        newSet.add(id);
        saveShown(newSet);
        return newSet;
      });
    },
    [setDismissedNotifications, setNotificationsShown, saveDismissed, saveShown],
  );

  const isNotificationDismissed = useCallback(
    (id: NotificationId) => {
      return dismissedNotifications.has(id);
    },
    [dismissedNotifications],
  );

  const trackAction = useCallback((action: string) => {
    const current = actionCounts.current.get(action) || 0;
    actionCounts.current.set(action, current + 1);
  }, []);

  const getActionCount = useCallback((action: string) => {
    return actionCounts.current.get(action) || 0;
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        showNotification,
        dismissNotification,
        isNotificationDismissed,
        trackAction,
        getActionCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Hook to use notifications
export function useNotifications() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Helper hook to show contextual notifications based on user actions
export function useContextualNotification() {
  const { trackAction, getActionCount, showNotification } = useNotifications();

  const notifyOnAction = useCallback(
    (action: string, threshold: number, notificationId: NotificationId) => {
      const count = getActionCount(action);
      trackAction(action);

      // Show notification after threshold actions
      if (count === threshold) {
        showNotification(notificationId);
      }
    },
    [trackAction, getActionCount, showNotification],
  );

  return { notifyOnAction, trackAction, getActionCount };
}
