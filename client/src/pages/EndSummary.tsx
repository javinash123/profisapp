import React from 'react';
import { useMatchStore } from '@/lib/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Share2, Download, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function EndSummary() {
  const { matchTitle, pegNumber, nets, unit, durationMinutes } = useMatchStore();
  const totalWeight = nets.reduce((acc, net) => acc + net.weight, 0);

  return (
    <AppLayout>
      <div className="max-w-md mx-auto w-full p-6 space-y-8">
        <div className="text-center space-y-2 pt-8">
          <h1 className="text-3xl font-bold text-white">Match Summary</h1>
          <p className="text-primary text-xl font-medium">{matchTitle} • Peg {pegNumber}</p>
        </div>

        <Card className="bg-card border-white/10 p-6 flex flex-col items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
            <span className="text-sm text-muted-foreground uppercase tracking-widest">Total Weight</span>
            <span className="text-6xl font-bold font-mono text-white tracking-tighter">
                {totalWeight.toFixed(2)}
                <span className="text-xl ml-2 text-muted-foreground">{unit}</span>
            </span>
            <div className="flex gap-4 text-sm text-muted-foreground">
                <span>{nets.length} Nets Used</span>
                <span>•</span>
                <span>{durationMinutes / 60} Hours</span>
            </div>
        </Card>

        <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase px-2">Net Breakdown</h3>
            {nets.map((net) => (
                <div key={net.id} className="flex justify-between items-center p-4 bg-secondary/30 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                            {net.id}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-white">Net {net.id}</span>
                            <span className="text-xs text-muted-foreground">Max: {net.capacity}{unit}</span>
                        </div>
                    </div>
                    <span className="font-mono font-bold text-xl">
                        {net.weight.toFixed(2)}
                        <span className="text-xs ml-1 text-muted-foreground">{unit}</span>
                    </span>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
            <Button variant="outline" className="h-12">
                <Share2 className="mr-2 h-4 w-4" /> Share
            </Button>
            <Button variant="outline" className="h-12">
                <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
        </div>

        <Link href="/">
            <Button className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground">
                <RotateCcw className="mr-2 h-5 w-5" /> Start New Match
            </Button>
        </Link>
      </div>
    </AppLayout>
  );
}
