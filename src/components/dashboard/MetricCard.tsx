import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  isLoading: boolean;
  icon: React.ReactNode;
}
export function MetricCard({ title, value, change, isLoading, icon }: MetricCardProps) {
  const isPositive = change !== undefined && change >= 0;
  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change !== undefined && (
              <p className={cn(
                "text-xs text-muted-foreground flex items-center",
                isPositive ? "text-green-500" : "text-red-500"
              )}>
                {isPositive ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                {change.toFixed(2)}% (24h)
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}