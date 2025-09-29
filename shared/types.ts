// Base API response structure
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
// For the demo page, can be removed later
export interface DemoItem {
  id: string;
  name: string;
  value: number;
}
// --- StellarPulse Specific Types ---
export type Timeframe = '1D' | '7D' | '1M' | '1Y';
export interface PriceData {
  price: number;
  change24h: number;
}
export type ChartDataPoint = [number, number, number, number, number]; // [timestamp, open, high, low, close]
export interface MarketData {
  btcPrice: PriceData;
  audRate: number;
  chartData: ChartDataPoint[];
}
export interface UserSettings {
  audBudget: number;
  transferFeePercent: number;
  email?: string;
}
export interface PriceAlert {
  id: string;
  btcThreshold: number;
  isEnabled: boolean;
}
export interface UserSettingsAndAlerts {
  settings: UserSettings;
  alerts: PriceAlert[];
}