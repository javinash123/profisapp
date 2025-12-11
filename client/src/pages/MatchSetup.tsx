import React, { useState } from 'react';
import { useMatchStore } from '@/lib/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useLocation } from 'wouter';
import { Play, Settings, Cloud } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function MatchSetup() {
  const [, setLocation] = useLocation();
  const { startMatch, unit, setUnit, toggleFieldMode, fieldMode } = useMatchStore();
  
  const [title, setTitle] = useState("Sunday Open");
  const [peg, setPeg] = useState("");
  const [hours, setHours] = useState(5);
  const [nets, setNets] = useState(3);
  const [capacity, setCapacity] = useState(50); // Default to 50

  const handleStart = () => {
    startMatch(title, peg, hours * 60, nets, capacity);
    setLocation('/live');
  };

  return (
    <AppLayout>
      <div className="max-w-md mx-auto w-full p-6 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">Match Setup</h1>
          <p className="text-muted-foreground">Configure your session settings</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Match Title</Label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="h-12 bg-secondary/50 border-transparent text-lg"
              placeholder="e.g. Club Match"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Peg Number</Label>
              <Input 
                value={peg} 
                onChange={(e) => setPeg(e.target.value)} 
                className="h-12 bg-secondary/50 border-transparent text-lg text-center font-mono font-bold"
                placeholder="#"
              />
            </div>
            <div className="space-y-2">
              <Label>Duration (Hours)</Label>
              <div className="h-12 flex items-center justify-center bg-secondary/50 rounded-md border border-transparent">
                <Button variant="ghost" onClick={() => setHours(Math.max(1, hours - 0.5))}>-</Button>
                <span className="flex-1 text-center font-bold text-xl">{hours}h</span>
                <Button variant="ghost" onClick={() => setHours(hours + 0.5)}>+</Button>
              </div>
            </div>
          </div>

          <Card className="p-4 bg-secondary/30 border-white/5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Number of Nets</Label>
                <span className="font-mono font-bold text-primary">{nets}</span>
              </div>
              <Slider 
                value={[nets]} 
                onValueChange={(v) => setNets(v[0])} 
                min={1} 
                max={6} 
                step={1} 
                className="py-4"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Net Capacity ({unit})</Label>
                <span className="font-mono font-bold text-primary">{capacity}</span>
              </div>
              <Slider 
                value={[capacity]} 
                onValueChange={(v) => setCapacity(v[0])} 
                min={10} 
                max={100} 
                step={5} 
                className="py-4"
              />
            </div>
          </Card>

          <div className="flex justify-between items-center p-4 bg-secondary/30 rounded-lg">
            <Label>Unit System</Label>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={unit === 'lb' ? 'default' : 'outline'}
                onClick={() => setUnit('lb')}
              >
                LB/OZ
              </Button>
              <Button 
                size="sm" 
                variant={unit === 'kg' ? 'default' : 'outline'}
                onClick={() => setUnit('kg')}
              >
                KG/G
              </Button>
            </div>
          </div>

          <Button 
            className="w-full h-16 text-xl font-bold shadow-[0_0_30px_rgba(78,179,181,0.3)] hover:shadow-[0_0_40px_rgba(78,179,181,0.5)] transition-all"
            onClick={handleStart}
          >
            <Play className="mr-2 h-6 w-6 fill-current" /> START MATCH
          </Button>

          <div className="text-center">
            <Button variant="link" className="text-muted-foreground" onClick={toggleFieldMode}>
              {fieldMode ? "Disable" : "Enable"} High Contrast Field Mode
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
