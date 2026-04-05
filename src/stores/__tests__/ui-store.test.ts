import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useUIStore } from '../ui-store';

vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'toast-' + Math.random().toString(36).slice(2, 9)),
});

describe('useUIStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useUIStore.setState({
      isSidebarOpen: true,
      isSidebarCollapsed: false,
      activeSidebarSection: 'projects',
      theme: 'system',
      toasts: [],
      confirmModal: {
        isOpen: false,
        title: '',
        description: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: null,
        variant: 'default',
      },
      isOnboardingComplete: false,
      showHelpPanel: false,
      currentHelpTopic: null,
      isPageLoading: false,
      loadingMessage: null,
      isMobileMenuOpen: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('sidebar', () => {
    it('toggles sidebar open/closed', () => {
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().isSidebarOpen).toBe(true);
    });

    it('toggles sidebar collapsed state', () => {
      useUIStore.getState().toggleSidebarCollapsed();
      expect(useUIStore.getState().isSidebarCollapsed).toBe(true);
    });

    it('sets sidebar open directly', () => {
      useUIStore.getState().setSidebarOpen(false);
      expect(useUIStore.getState().isSidebarOpen).toBe(false);
    });

    it('sets active sidebar section', () => {
      useUIStore.getState().setActiveSidebarSection('bible');
      expect(useUIStore.getState().activeSidebarSection).toBe('bible');
    });
  });

  describe('theme', () => {
    it('sets theme to dark', () => {
      useUIStore.getState().setTheme('dark');
      expect(useUIStore.getState().theme).toBe('dark');
    });

    it('sets theme to light', () => {
      useUIStore.getState().setTheme('light');
      expect(useUIStore.getState().theme).toBe('light');
    });
  });

  describe('toasts', () => {
    it('adds a toast', () => {
      useUIStore.getState().addToast({ type: 'success', title: 'Saved!' });
      expect(useUIStore.getState().toasts).toHaveLength(1);
      expect(useUIStore.getState().toasts[0].type).toBe('success');
      expect(useUIStore.getState().toasts[0].title).toBe('Saved!');
    });

    it('removes a toast by ID', () => {
      useUIStore.getState().addToast({ type: 'error', title: 'Failed' });
      const toastId = useUIStore.getState().toasts[0].id;
      useUIStore.getState().removeToast(toastId);
      expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('clears all toasts', () => {
      useUIStore.getState().addToast({ type: 'success', title: 'One' });
      useUIStore.getState().addToast({ type: 'info', title: 'Two' });
      useUIStore.getState().clearToasts();
      expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('auto-removes toast after default duration', () => {
      useUIStore.getState().addToast({ type: 'info', title: 'Auto-dismiss' });
      expect(useUIStore.getState().toasts).toHaveLength(1);
      vi.advanceTimersByTime(5000);
      expect(useUIStore.getState().toasts).toHaveLength(0);
    });

    it('does not auto-remove toast with duration 0', () => {
      useUIStore.getState().addToast({ type: 'error', title: 'Persistent', duration: 0 });
      vi.advanceTimersByTime(10000);
      expect(useUIStore.getState().toasts).toHaveLength(1);
    });
  });

  describe('confirm modal', () => {
    it('opens confirm modal with config', () => {
      const onConfirm = vi.fn();
      useUIStore.getState().openConfirmModal({
        title: 'Delete project?',
        description: 'This cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Keep',
        onConfirm,
        variant: 'danger',
      });

      const modal = useUIStore.getState().confirmModal;
      expect(modal.isOpen).toBe(true);
      expect(modal.title).toBe('Delete project?');
      expect(modal.variant).toBe('danger');
      expect(modal.confirmText).toBe('Delete');
    });

    it('closes confirm modal and resets state', () => {
      useUIStore.getState().openConfirmModal({
        title: 'Test',
        description: 'Test',
        confirmText: 'OK',
        cancelText: 'Cancel',
        onConfirm: vi.fn(),
        variant: 'warning',
      });
      useUIStore.getState().closeConfirmModal();

      const modal = useUIStore.getState().confirmModal;
      expect(modal.isOpen).toBe(false);
      expect(modal.title).toBe('');
      expect(modal.onConfirm).toBeNull();
    });
  });

  describe('onboarding and help', () => {
    it('sets onboarding complete', () => {
      useUIStore.getState().setOnboardingComplete(true);
      expect(useUIStore.getState().isOnboardingComplete).toBe(true);
    });

    it('toggles help panel', () => {
      useUIStore.getState().toggleHelpPanel();
      expect(useUIStore.getState().showHelpPanel).toBe(true);
    });

    it('sets help topic and opens panel', () => {
      useUIStore.getState().setHelpTopic('getting-started');
      expect(useUIStore.getState().currentHelpTopic).toBe('getting-started');
      expect(useUIStore.getState().showHelpPanel).toBe(true);
    });

    it('clears help topic and closes panel', () => {
      useUIStore.getState().setHelpTopic('topic');
      useUIStore.getState().setHelpTopic(null);
      expect(useUIStore.getState().currentHelpTopic).toBeNull();
      expect(useUIStore.getState().showHelpPanel).toBe(false);
    });
  });

  describe('loading state', () => {
    it('sets page loading with message', () => {
      useUIStore.getState().setPageLoading(true, 'Saving project...');
      expect(useUIStore.getState().isPageLoading).toBe(true);
      expect(useUIStore.getState().loadingMessage).toBe('Saving project...');
    });

    it('clears loading state', () => {
      useUIStore.getState().setPageLoading(true, 'Loading');
      useUIStore.getState().setPageLoading(false);
      expect(useUIStore.getState().isPageLoading).toBe(false);
      expect(useUIStore.getState().loadingMessage).toBeNull();
    });
  });

  describe('mobile menu', () => {
    it('toggles mobile menu', () => {
      useUIStore.getState().toggleMobileMenu();
      expect(useUIStore.getState().isMobileMenuOpen).toBe(true);
      useUIStore.getState().toggleMobileMenu();
      expect(useUIStore.getState().isMobileMenuOpen).toBe(false);
    });

    it('closes mobile menu explicitly', () => {
      useUIStore.getState().toggleMobileMenu();
      useUIStore.getState().closeMobileMenu();
      expect(useUIStore.getState().isMobileMenuOpen).toBe(false);
    });
  });
});
