import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { PriceAlert } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
export function AlertsCard() {
  const { priceAlerts, updateSettingsAndAlerts, isSettingsLoading } = useAppStore();
  const handleAlertToggle = (alertId: string, isEnabled: boolean) => {
    const updatedAlerts = (priceAlerts || []).map(alert =>
      alert.id === alertId ? { ...alert, isEnabled } : alert
    );
    updateSettingsAndAlerts({ alerts: updatedAlerts });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Price Alerts (USD)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isSettingsLoading ? (
            <>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-10" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-10" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-10" />
              </div>
            </>
          ) : (priceAlerts || []).length > 0 ? (
            (priceAlerts || []).map((alert: PriceAlert) => (
              <div key={alert.id} className="flex items-center justify-between">
                <Label htmlFor={alert.id} className="text-base">
                  Notify when BTC &lt; ${alert.btcThreshold.toLocaleString()}
                </Label>
                <Switch
                  id={alert.id}
                  checked={alert.isEnabled}
                  onCheckedChange={(checked) => handleAlertToggle(alert.id, checked)}
                />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center">No alerts configured.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}