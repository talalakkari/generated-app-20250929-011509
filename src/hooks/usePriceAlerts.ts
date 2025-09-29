import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
export function usePriceAlerts() {
  const { marketData, priceAlerts, userSettings } = useAppStore();
  const previousPriceRef = useRef<number | null>(null);
  const triggeredAlertsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const currentPrice = marketData?.btcPrice.price;
    if (!currentPrice) return;
    const previousPrice = previousPriceRef.current;
    // Reset triggered status if price goes back above a threshold
    triggeredAlertsRef.current.forEach(alertId => {
      const alert = (priceAlerts || []).find(a => a.id === alertId);
      if (alert && currentPrice > alert.btcThreshold) {
        triggeredAlertsRef.current.delete(alertId);
      }
    });
    // Check for new triggers
    for (const alert of priceAlerts || []) {
      if (
        alert.isEnabled &&
        !triggeredAlertsRef.current.has(alert.id) &&
        previousPrice !== null &&
        previousPrice > alert.btcThreshold &&
        currentPrice <= alert.btcThreshold
      ) {
        // Mark as triggered to prevent spam
        triggeredAlertsRef.current.add(alert.id);
        // In-app notification
        toast.info(`🚨 BTC Price Alert: < ${alert.btcThreshold.toLocaleString()}`, {
          description: `Bitcoin price has dropped to ${currentPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
          duration: 10000,
        });
        // Email notification
        if (userSettings.email) {
          fetch('/api/send-alert-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: userSettings.email,
              btcPrice: currentPrice,
              threshold: alert.btcThreshold,
            }),
          }).catch(err => console.error("Failed to send alert email:", err));
        }
      }
    }
    // Update previous price for the next check
    previousPriceRef.current = currentPrice;
  }, [marketData, priceAlerts, userSettings.email]);
}