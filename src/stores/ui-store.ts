import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global UI Store
 * 
 * Manages global UI state including sidebar, modals, notifications,
 * and user preferences.
 */

export type Theme = 'light' | 'dark' | 'system';
export type SidebarSection = 'projects' | 'bible' | 'beats' | 'ai' | 'settings';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onConfirm: (() => void) | null;
  variant: 'danger' | 'warning' | 'default';
}

interface UIState {
  // Sidebar
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  activeSidebarSection: SidebarSection;
  
  // Theme
  theme: Theme;
  
  // Toasts/Notifications
  toasts: Toast[];
  
  // Confirm Modal
  confirmModal: ConfirmModalState;
  
  // Help/Onboarding
  isOnboardingComplete: boolean;
  showHelpPanel: boolean;
  currentHelpTopic: string | null;
  
  // Loading states
  isPageLoading: boolean;
  loadingMessage: string | null;
  
  // Mobile
  isMobileMenuOpen: boolean;
  
  // Actions
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveSidebarSection: (section: SidebarSection) => void;
  
  setTheme: (theme: Theme) => void;
  
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  openConfirmModal: (config: Omit<ConfirmModalState, 'isOpen'>) => void;
  closeConfirmModal: () => void;
  
  setOnboardingComplete: (complete: boolean) => void;
  toggleHelpPanel: () => void;
  setHelpTopic: (topic: string | null) => void;
  
  setPageLoading: (loading: boolean, message?: string) => void;
  
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
}

const defaultConfirmModal: ConfirmModalState = {
  isOpen: false,
  title: '',
  description: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  onConfirm: null,
  variant: 'default',
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      // Initial state
      isSidebarOpen: true,
      isSidebarCollapsed: false,
      activeSidebarSection: 'projects',
      theme: 'system',
      toasts: [],
      confirmModal: defaultConfirmModal,
      isOnboardingComplete: false,
      showHelpPanel: false,
      currentHelpTopic: null,
      isPageLoading: false,
      loadingMessage: null,
      isMobileMenuOpen: false,

      // Sidebar actions
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleSidebarCollapsed: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      setActiveSidebarSection: (section) => set({ activeSidebarSection: section }),
      
      // Theme actions
      setTheme: (theme) => set({ theme }),
      
      // Toast actions
      addToast: (toast) => {
        const id = crypto.randomUUID();
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));
        // Auto-remove after duration (default 5 seconds)
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
          setTimeout(() => {
            get().removeToast(id);
          }, duration);
        }
      },
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      })),
      clearToasts: () => set({ toasts: [] }),
      
      // Confirm modal actions
      openConfirmModal: (config) => set({
        confirmModal: { ...config, isOpen: true },
      }),
      closeConfirmModal: () => set({
        confirmModal: defaultConfirmModal,
      }),
      
      // Onboarding actions
      setOnboardingComplete: (complete) => set({ isOnboardingComplete: complete }),
      toggleHelpPanel: () => set((state) => ({ showHelpPanel: !state.showHelpPanel })),
      setHelpTopic: (topic) => set({ currentHelpTopic: topic, showHelpPanel: !!topic }),
      
      // Loading actions
      setPageLoading: (loading, message) => set({ 
        isPageLoading: loading, 
        loadingMessage: message || null,
      }),
      
      // Mobile actions
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
    }),
    {
      name: 'ember-ui-state',
      partialize: (state) => ({
        isSidebarCollapsed: state.isSidebarCollapsed,
        theme: state.theme,
        isOnboardingComplete: state.isOnboardingComplete,
      }),
    }
  )
);

// Convenience hook for showing toasts
export function useToast() {
  const addToast = useUIStore((state) => state.addToast);
  const removeToast = useUIStore((state) => state.removeToast);
  
  return {
    toast: addToast,
    success: (title: string, description?: string) => 
      addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) => 
      addToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) => 
      addToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) => 
      addToast({ type: 'info', title, description }),
    dismiss: removeToast,
  };
}

// Convenience hook for confirm dialogs
export function useConfirm() {
  const openConfirmModal = useUIStore((state) => state.openConfirmModal);
  const closeConfirmModal = useUIStore((state) => state.closeConfirmModal);
  
  return {
    confirm: (config: {
      title: string;
      description: string;
      confirmText?: string;
      cancelText?: string;
      variant?: 'danger' | 'warning' | 'default';
      onConfirm: () => void;
    }) => {
      openConfirmModal({
        ...config,
        confirmText: config.confirmText || 'Confirm',
        cancelText: config.cancelText || 'Cancel',
        variant: config.variant || 'default',
      });
    },
    close: closeConfirmModal,
  };
}
