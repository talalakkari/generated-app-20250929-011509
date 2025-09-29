import { create } from 'zustand';
import { toast } from 'sonner';
import type { MarketData, Timeframe, UserSettings, PriceAlert, UserSettingsAndAlerts, ApiResponse } from '@shared/types';
interface AppState {
  marketData: MarketData | null;
  isLoading: boolean;
  isSettingsLoading: boolean;
  error: string | null;
  activeTimeframe: Timeframe;
  userSettings: UserSettings;
  priceAlerts: PriceAlert[];
  setMarketData: (data: MarketData) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSettingsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveTimeframe: (timeframe: Timeframe) => void;
  initializeSettings: (data: UserSettingsAndAlerts) => void;
  updateSettingsAndAlerts: (data: Partial<UserSettingsAndAlerts>) => Promise<void>;
}
const persistSettings = async (data: UserSettingsAndAlerts) => {
  try {
    const response = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result: ApiResponse<UserSettingsAndAlerts> = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to save settings');
    }
    return result.data;
  } catch (error) {
    console.error('Error persisting settings:', error);
    toast.error('Could not save settings. Please try again.');
    return null;
  }
};
export const useAppStore = create<AppState>((set, get) => ({
  marketData: null,
  isLoading: true,
  isSettingsLoading: true,
  error: null,
  activeTimeframe: '7D',
  userSettings: {
    audBudget: 500000,
    transferFeePercent: 1.5,
    email: '',
  },
  priceAlerts: [],
  setMarketData: (data) => set({ marketData: data, isLoading: false, error: null }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsSettingsLoading: (loading) => set({ isSettingsLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  setActiveTimeframe: (timeframe) => set({ activeTimeframe: timeframe }),
  initializeSettings: (data) => set({ userSettings: data.settings, priceAlerts: data.alerts, isSettingsLoading: false }),
  updateSettingsAndAlerts: async (data) => {
    const currentState = get();
    const newSettings = { ...currentState.userSettings, ...data.settings };
    const newAlerts = data.alerts || currentState.priceAlerts;
    set({ userSettings: newSettings, priceAlerts: newAlerts });
    toast.success('Settings updated!');
    await persistSettings({ settings: newSettings, alerts: newAlerts });
  },
}));