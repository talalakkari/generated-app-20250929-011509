import { Waves } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
export function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
          <Waves className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold font-display text-foreground">
          StellarPulse
        </h1>
      </div>
      <ThemeToggle className="static" />
    </header>
  );
}