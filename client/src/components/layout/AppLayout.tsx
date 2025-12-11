import React from 'react';
import { useMatchStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Sun, Moon, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';

export function AppLayout({ children, className }: { children: React.ReactNode, className?: string }) {
  const { fieldMode, toggleFieldMode } = useMatchStore();
  const [location] = useLocation();

  const isLive = location === '/live';

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 flex flex-col font-sans",
      fieldMode ? "field-mode bg-black text-white" : "bg-background text-foreground"
    )}>
      {/* Top Header - Hidden on Live Match to maximize space if needed, 
          but spec says "One-Page Main Screen" implies header is part of it. 
          Let's keep a minimal header or just let the page handle it.
          We'll add a global mode toggle here for non-live pages.
      */}
      {!isLive && (
        <header className="p-4 flex justify-between items-center border-b border-white/10">
          <Link href="/">
            <img src="/logo.jpeg" alt="PegPro" className="h-16 w-auto cursor-pointer object-contain" />
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFieldMode}
            className="rounded-full hover:bg-white/10"
          >
            {fieldMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </header>
      )}

      <main className={cn("flex-1 flex flex-col", className)}>
        {children}
      </main>
    </div>
  );
}
