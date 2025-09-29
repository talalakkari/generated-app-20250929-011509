import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAppStore } from '@/store/useAppStore';
import type { Timeframe } from '@shared/types';
import { format } from 'date-fns';
import { Bitcoin } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';

const timeframes: Timeframe[] = ['1D', '7D', '1M', '1Y'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-md shadow-lg">
        <p className="text-sm font-bold">{`${payload[0].value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
        <p className="text-xs text-muted-foreground">{format(new Date(label), 'MMM d, yyyy HH:mm')}</p>
      </div>
    );
  }
  return null;
};

export function BtcChartCard() {
  const { marketData, isLoading, error, activeTimeframe, setActiveTimeframe } = useAppStore();
  const chartData = marketData?.chartData.map(d => ({
    time: d[0],
    open: d[1],
    high: d[2],
    low: d[3],
    close: d[4],
  })) || [];
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Bitcoin className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-semibold">BTC/USD Price Chart</CardTitle>
        </div>
        <ToggleGroup
          type="single"
          value={activeTimeframe}
          onValueChange={(value: Timeframe) => value && setActiveTimeframe(value)}
          className="h-8"
        >
          {timeframes.map(tf => (
            <ToggleGroupItem key={tf} value={tf} aria-label={`Select ${tf}`} className="px-2.5 text-xs">
              {tf}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>
      <CardContent className="flex-grow">
        {isLoading && !marketData ? (
          <Skeleton className="w-full h-[400px]" />
        ) : error ? (
          <div className="flex items-center justify-center h-full text-destructive text-center p-4">
            <p>Failed to load chart data. Please try again later.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="time"
                tickFormatter={(time) => format(new Date(time), 'MMM d')}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                orientation="right"
                tickFormatter={(value) => `$${(value / 1000)}k`}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="close" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorClose)" strokeWidth={2} />
              <ReferenceLine y={106000} label={{ value: "$106k", position: 'insideTopRight', fill: 'hsl(var(--foreground))', fontSize: 12 }} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
              <ReferenceLine y={94000} stroke="hsl(var(--primary) / 0.5)" strokeDasharray="3 3" />
              <ReferenceLine y={90000} label={{ value: "$90-94k Zone", position: 'insideBottomRight', fill: 'hsl(var(--foreground))', fontSize: 12 }} stroke="hsl(var(--primary) / 0.5)" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}