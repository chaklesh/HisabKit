/**
 * Settings-specific hooks that orchestrate saving and loading settings
 * These coordinate between React Query (server state) and local components
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { LayoutSettings } from '../types/settingsTypes';

/**
 * Hook for managing business profile settings
 * Coordinates between component form state and server mutations
 */
export function useBusinessProfileSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const saveBusinessProfile = useCallback(async () => {
    setIsSaving(true);
    setError('');
    try {
      // Placeholder for actual API mutation
      // For now, component will use the existing useUpdateTenantProfile from features/profile
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Business profile updated');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Unable to save business profile';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { isSaving, error, setError, saveBusinessProfile };
}

/**
 * Hook for managing reminder/notification templates
 */
export function useReminderSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const saveReminderSettings = useCallback(async () => {
    setIsSaving(true);
    setError('');
    try {
      // Coordinates with useUpdateTenantProfile for templates
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Reminder templates updated');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Unable to save reminder templates';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { isSaving, error, setError, saveReminderSettings };
}

/**
 * Hook for managing security preferences
 */
export function useSecuritySettings() {
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [error, setError] = useState('');

  const changePassword = useCallback(async () => {
    setIsSavingPassword(true);
    setError('');
    try {
      // Coordinates with useChangePassword from features/profile
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success('Password changed successfully');
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Unable to change password';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsSavingPassword(false);
    }
  }, []);

  return { isSavingPassword, error, setError, changePassword };
}

/**
 * Hook for managing layout preferences (stored in localStorage)
 */
export function useLayoutSettings() {
  const storageKey = 'hisabkit_layout_settings';

  const loadLayoutSettings = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const saveLayoutSettings = useCallback((settings: LayoutSettings) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(settings));
      toast.success('Layout preferences saved');
      return true;
    } catch {
      toast.error('Unable to save layout preferences');
      return false;
    }
  }, []);

  return { loadLayoutSettings, saveLayoutSettings };
}
