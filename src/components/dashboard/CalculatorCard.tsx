import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import { Calculator, Bitcoin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
const calculatorSchema = z.object({
  audBudget: z.coerce.number().min(0, "Budget must be positive"),
  transferFeePercent: z.coerce.number().min(0, "Fee must be positive").max(100, "Fee cannot exceed 100%"),
  email: z.string().email("Please enter a valid email address.").or(z.literal("")).optional(),
});
type CalculatorFormValues = z.infer<typeof calculatorSchema>;
export function CalculatorCard() {
  const { userSettings, marketData, updateSettingsAndAlerts, isSettingsLoading } = useAppStore();
  const btcPrice = marketData?.btcPrice.price ?? 0;
  const audRate = marketData?.audRate ?? 0.65;
  const form = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: userSettings,
  });
  useEffect(() => {
    form.reset(userSettings);
  }, [userSettings, form]);
  const watchedValues = form.watch();
  const usdAmount = (watchedValues.audBudget || 0) * audRate;
  const feeAmount = usdAmount * ((watchedValues.transferFeePercent || 0) / 100);
  const finalUsdAmount = usdAmount - feeAmount;
  const purchasableBtc = btcPrice > 0 ? finalUsdAmount / btcPrice : 0;
  const onSubmit = (data: CalculatorFormValues) => {
    updateSettingsAndAlerts({ settings: data });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Opportunity Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isSettingsLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="audBudget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AUD Budget</FormLabel>
                      <FormControl><Input type="number" placeholder="500,000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="transferFeePercent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fee (%)</FormLabel>
                      <FormControl><Input type="number" step="0.1" placeholder="1.5" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Email</FormLabel>
                    <FormControl><Input type="email" placeholder="you@example.com" {...field} value={field.value ?? ''} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="p-4 bg-muted rounded-md text-center">
                <p className="text-sm text-muted-foreground">Purchasable BTC Volume</p>
                <p className="text-2xl font-bold flex items-center justify-center gap-2">
                  <Bitcoin className="h-6 w-6" />
                  {purchasableBtc.toFixed(2)}
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={!form.formState.isDirty}>
                Save Settings
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}