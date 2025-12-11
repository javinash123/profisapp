import React, { useEffect, useState } from 'react';
import { useMatchStore } from '@/lib/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { NetTile } from '@/components/match/NetTile';
import { NumericKeypad } from '@/components/match/NumericKeypad';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { Pause, Plus, Play, StopCircle, Lock, Cloud, Clock, Home, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { useInterval } from 'usehooks-ts';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function LiveMatch() {
  const [, setLocation] = useLocation();
  const { 
    matchTitle, 
    pegNumber, 
    startTime, 
    durationMinutes, 
    nets, 
    updateNetWeight, 
    addNet, 
    endMatch,
    unit,
    fieldMode,
    toggleFieldMode,
    alarms
  } = useMatchStore();

  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingNet, setEditingNet] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);

  // Timer logic
  useInterval(() => {
    setCurrentTime(new Date());
    if (startTime) {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const remaining = (durationMinutes * 60) - elapsedSeconds;
      setTimeLeft(Math.max(0, remaining));
    }
  }, 1000);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalWeight = nets.reduce((acc, net) => acc + net.weight, 0);

  const handleAddWeight = (netId: number, amount: number) => {
    const net = nets.find(n => n.id === netId);
    if (net) updateNetWeight(netId, net.weight + amount);
  };

  const handleSubtractWeight = (netId: number, amount: number) => {
    const net = nets.find(n => n.id === netId);
    if (net) updateNetWeight(netId, Math.max(0, net.weight - amount));
  };

  const handleKeypadConfirm = (val: number) => {
    if (editingNet !== null) {
      updateNetWeight(editingNet, val);
    }
  };

  const handleEndMatch = () => {
    setShowEndDialog(false);
    endMatch();
    setLocation('/summary');
  };

  if (!startTime) {
    // Redirect if no active match
    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground flex-col gap-4">
            <h2 className="text-xl">No active match found</h2>
            <Link href="/">
                <Button>Go to Setup</Button>
            </Link>
        </div>
    );
  }

  const activeAlarms = alarms.filter(a => a.enabled);

  return (
    <AppLayout className="overflow-hidden h-screen max-h-screen flex flex-col">
      {/* Top Bar - Compact */}
      <div className={cn(
        "flex justify-between items-center px-4 py-2 border-b transition-colors",
        fieldMode ? "bg-black border-white/20" : "bg-card/50 border-white/5"
      )}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-primary truncate max-w-[120px]">{matchTitle}</span>
          <span className="text-muted-foreground">|</span>
          <span className="font-mono font-bold text-white">PEG {pegNumber}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/weather">
            <div className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors">
                <Cloud className="h-4 w-4" />
                <span>14°C</span>
            </div>
          </Link>
          <div className="font-mono text-sm">
            {format(currentTime, 'HH:mm')}
          </div>
        </div>
      </div>

      {/* Timer Section */}
      <div className="flex-none py-4 flex justify-center items-center relative">
        <div className={cn(
          "text-6xl md:text-7xl font-mono font-bold tracking-tighter tabular-nums transition-colors",
          timeLeft < 300 ? "text-red-500 animate-pulse" : "text-primary",
          fieldMode ? "drop-shadow-[0_0_15px_rgba(78,179,181,0.5)]" : "drop-shadow-[0_0_10px_rgba(78,179,181,0.3)]"
        )}>
          {formatTime(timeLeft)}
        </div>
        
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
            onClick={() => setIsLocked(!isLocked)}
        >
            <Lock className={cn("h-6 w-6", isLocked ? "text-red-500" : "")} />
        </Button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {nets.map(net => (
                <div key={net.id} className={isLocked ? "pointer-events-none opacity-50 grayscale" : ""}>
                    <NetTile 
                        net={net}
                        onEdit={setEditingNet}
                        onAdd={(amt) => handleAddWeight(net.id, amt)}
                        onSubtract={(amt) => handleSubtractWeight(net.id, amt)}
                    />
                </div>
            ))}
            
            {!isLocked && (
                <button 
                    onClick={addNet}
                    className="border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-white/5 transition-all min-h-[160px]"
                >
                    <Plus className="h-8 w-8 mb-2" />
                    <span className="font-medium">Add Net</span>
                </button>
            )}
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 border-t flex flex-col gap-3 z-20 transition-colors backdrop-blur-md",
        fieldMode ? "bg-black/90 border-white/20" : "bg-card/90 border-white/10"
      )}>
        {/* Alarm Chips Row */}
        {activeAlarms.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
                {activeAlarms.map(alarm => (
                    <Badge key={alarm.id} variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30 whitespace-nowrap">
                        <Bell className="h-3 w-3 mr-1" /> {alarm.name} ({alarm.time || 'Loop'})
                    </Badge>
                ))}
            </div>
        )}

        <div className="flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">Total Weight</span>
                <span className="text-3xl font-bold font-mono text-white">
                    {totalWeight.toFixed(2)} <span className="text-sm text-muted-foreground">{unit}</span>
                </span>
            </div>

            <div className="flex gap-2">
                <Link href="/alarms">
                    <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-white/10 bg-white/5 hover:bg-white/10">
                        <Bell className="h-5 w-5" />
                    </Button>
                </Link>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-full border-white/10 bg-white/5 hover:bg-white/10" onClick={toggleFieldMode}>
                    <Home className="h-5 w-5" />
                </Button>
                <Button 
                    variant="destructive" 
                    className="h-12 px-6 rounded-full font-bold shadow-lg shadow-red-900/20"
                    onClick={() => setShowEndDialog(true)}
                >
                    <StopCircle className="mr-2 h-5 w-5" /> END
                </Button>
            </div>
        </div>
      </div>

      <NumericKeypad 
        isOpen={editingNet !== null} 
        onClose={() => setEditingNet(null)}
        onConfirm={handleKeypadConfirm}
        initialValue={editingNet ? nets.find(n => n.id === editingNet)?.weight : 0}
        title={editingNet ? `Edit Net ${editingNet} Weight` : 'Edit Weight'}
      />

      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>End Match?</DialogTitle>
                <DialogDescription>
                    Are you sure you want to finish this session? This will stop the timer and generate a summary.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowEndDialog(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleEndMatch}>Confirm End Match</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
