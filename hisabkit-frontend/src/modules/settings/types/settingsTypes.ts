/**
 * Settings module types
 * Organized by feature area for workspace control center
 */

export type ThemeChoice = 'light' | 'dark' | 'system';
export type DashboardDensity = 'compact' | 'comfortable' | 'spacious';

/**
 * Appearance/theme preferences
 */
export interface AppearanceSettings {
  theme: ThemeChoice;
}

/**
 * Language/localization preferences
 */
export interface LanguageSettings {
  language: 'en' | 'hi';
}

/**
 * Business profile and brand settings
 */
export interface BusinessProfile {
  name: string;
  businessType?: string;
  ownerName?: string;
  businessPhone?: string;
  businessEmail?: string;
  businessAddress?: string;
  gstNumber?: string;
  logoUrl?: string;
  timezone?: string;
}

/**
 * Notification and reminder templates
 */
export interface ReminderSettings {
  smsTemplate?: string;
  whatsappTemplate?: string;
}

/**
 * Security and session preferences
 */
export interface SecuritySettings {
  sessionTimeout?: number; // minutes
  requireMfaForPasswordChange?: boolean;
  allowRememberDevice?: boolean;
}

/**
 * Dashboard and layout preferences
 */
export interface LayoutSettings {
  dashboardDensity: DashboardDensity;
  defaultView?: 'dashboard' | 'ledger' | 'reports';
  hidePlannedModules?: boolean;
  compactNavigationSidebar?: boolean;
}

/**
 * Complete settings state combining all sections
 */
export interface WorkspaceSettings {
  appearance: AppearanceSettings;
  language: LanguageSettings;
  business: BusinessProfile;
  reminders: ReminderSettings;
  security: SecuritySettings;
  layout: LayoutSettings;
}

/**
 * Settings section tabs
 */
export type SettingsTab = 'appearance' | 'language' | 'business' | 'reminders' | 'security' | 'layout';
