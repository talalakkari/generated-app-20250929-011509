import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { ApiResponse, MarketData, Timeframe } from '@shared/types';
const TIMEFRAME_DAYS_MAP: Record<Timeframe, number> = {
  '1D': 1,
  '7D': 7,
  '1M': 30,
  '1Y': 365,
};
export function useMarketData() {
  const { activeTimeframe, setMarketData, setIsLoading, setError } = useAppStore();
  const fetchData = useCallback(async (timeframe: Timeframe) => {
    setIsLoading(true);
    try {
      const days = TIMEFRAME_DAYS_MAP[timeframe];
      const response = await fetch(`/api/market-data?timeframe=${days}`);
      const result: ApiResponse<MarketData> = await response.json();
      if (result.success && result.data) {
        setMarketData(result.data);
        setError(null);
      } else {
        throw new Error(result.error || 'Failed to fetch market data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [setMarketData, setIsLoading, setError]);
  useEffect(() => {
    fetchData(activeTimeframe);
  }, [activeTimeframe, fetchData]);
  useEffect(() => {
    const interval = setInterval(() => {
      // Fetch data with the current timeframe from the store to avoid stale closures
      fetchData(useAppStore.getState().activeTimeframe);
    }, 60000); // Poll every 60 seconds
    return () => clearInterval(interval);
  }, [fetchData]);
}