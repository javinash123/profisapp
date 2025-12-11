import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft, Cloud, CloudRain, Wind, Droplets, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function WeatherDetail() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center gap-4 border-b border-white/10">
          <Link href="/live">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Weather Conditions</h1>
        </div>

        <div className="p-6 space-y-6">
          <Card className="p-8 bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-white/10 flex flex-col items-center gap-4">
            <Cloud className="h-24 w-24 text-primary" />
            <div className="text-center">
              <h2 className="text-6xl font-bold text-white tracking-tighter">14°</h2>
              <p className="text-xl text-muted-foreground font-medium">Overcast Clouds</p>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-card border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wind className="h-5 w-5" />
                <span className="text-sm">Wind</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">12</span>
                <span className="text-sm text-muted-foreground">mph</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-primary">
                <ArrowUpRight className="h-3 w-3" />
                <span>NE Direction</span>
              </div>
            </Card>

            <Card className="p-4 bg-card border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Droplets className="h-5 w-5" />
                <span className="text-sm">Humidity</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">78</span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </Card>

            <Card className="p-4 bg-card border-white/10 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CloudRain className="h-5 w-5" />
                <span className="text-sm">Pressure</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">1012</span>
                <span className="text-sm text-muted-foreground">hPa</span>
              </div>
            </Card>
          </div>
          
          <div className="text-center text-xs text-muted-foreground mt-8">
            Last updated: 10:45 AM • Offline Cached
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
