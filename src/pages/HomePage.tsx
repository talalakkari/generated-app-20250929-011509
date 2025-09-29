import { useEffect } from 'react';
import { Header } from '@/components/dashboard/Header';
import { BtcChartCard } from '@/components/dashboard/BtcChartCard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { CalculatorCard } from '@/components/dashboard/CalculatorCard';
import { AlertsCard } from '@/components/dashboard/AlertsCard';
import { useMarketData } from '@/hooks/useMarketData';
import { useAppStore } from '@/store/useAppStore';
import { Toaster } from '@/components/ui/sonner';
import { Bitcoin, Globe } from 'lucide-react';
import type { ApiResponse, UserSettingsAndAlerts } from '@shared/types';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';
import { useTheme } from '@/hooks/use-theme';
export function HomePage() {
  useMarketData();
  usePriceAlerts();
  const { isDark } = useTheme();
  const { marketData, isLoading, initializeSettings, setIsSettingsLoading } = useAppStore();
  useEffect(() => {
    const fetchSettings = async () => {
      setIsSettingsLoading(true);
      try {
        const response = await fetch('/api/settings');
        const result: ApiResponse<UserSettingsAndAlerts> = await response.json();
        if (result.success && result.data) {
          initializeSettings(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch user settings:", error);
      } finally {
        setIsSettingsLoading(false);
      }
    };
    fetchSettings();
  }, [initializeSettings, setIsSettingsLoading]);
  const btcPrice = marketData?.btcPrice;
  const audRate = marketData?.audRate;
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="space-y-6">
          <Header />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
            {/* Main Chart */}
            <div className="lg:col-span-3">
              <BtcChartCard />
            </div>
            {/* Sidebar */}
            <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                <MetricCard
                  title="BTC/USD Price"
                  value={btcPrice ? `${btcPrice.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}` : '...'}
                  change={btcPrice?.change24h}
                  isLoading={isLoading}
                  icon={<Bitcoin className="h-4 w-4 text-muted-foreground" />}
                />
                <MetricCard
                  title="USD/AUD Exchange Rate"
                  value={audRate ? audRate.toFixed(4) : '...'}
                  isLoading={isLoading}
                  icon={<Globe className="h-4 w-4 text-muted-foreground" />}
                />
              </div>
              <CalculatorCard />
              <AlertsCard />
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground">
        StellarPulse | Built with ❤️ at Cloudflare
      </footer>
      <Toaster richColors theme={isDark ? 'dark' : 'light'} />
    </div>
  );
}