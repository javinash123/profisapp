import React, { useState } from 'react';
import { useMatchStore } from '@/lib/store';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ArrowLeft, Plus, Bell, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AlarmList() {
  const { alarms, addAlarm, toggleAlarm, deleteAlarm } = useMatchStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // New Alarm State
  const [newAlarmName, setNewAlarmName] = useState("");
  const [newAlarmType, setNewAlarmType] = useState<'one-time' | 'repeat' | 'duration'>('one-time');
  const [newAlarmTime, setNewAlarmTime] = useState("");

  const handleAdd = () => {
    addAlarm({
      id: Math.random().toString(36).substr(2, 9),
      name: newAlarmName || "New Alarm",
      type: newAlarmType,
      time: newAlarmTime,
      enabled: true
    });
    setIsAddOpen(false);
    setNewAlarmName("");
    setNewAlarmTime("");
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center gap-4 border-b border-white/10">
          <Link href="/live">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Alarms & Timers</h1>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {alarms.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No alarms set</p>
            </div>
          ) : (
            alarms.map((alarm) => (
              <Card key={alarm.id} className="p-4 flex justify-between items-center bg-card border-white/10">
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${alarm.enabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${alarm.enabled ? 'text-white' : 'text-muted-foreground'}`}>{alarm.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{alarm.type} • {alarm.time || '00:00'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => toggleAlarm(alarm.id)}>
                    {alarm.enabled ? <ToggleRight className="h-8 w-8 text-primary" /> : <ToggleLeft className="h-8 w-8 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-900/20" onClick={() => deleteAlarm(alarm.id)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <Button className="w-full h-12 text-lg font-bold" onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-5 w-5" /> Add Alarm
          </Button>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Alarm</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Alarm Name</Label>
                <Input value={newAlarmName} onChange={(e) => setNewAlarmName(e.target.value)} placeholder="e.g. Feed Pellet" />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={newAlarmType} onValueChange={(v: any) => setNewAlarmType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="repeat">Repeating Interval</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{newAlarmType === 'repeat' ? 'Interval (minutes)' : 'Time'}</Label>
                <Input 
                  type={newAlarmType === 'repeat' ? 'number' : 'time'} 
                  value={newAlarmTime} 
                  onChange={(e) => setNewAlarmTime(e.target.value)} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Save Alarm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
