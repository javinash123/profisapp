import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Unit = 'lb' | 'kg';

export interface Net {
  id: number;
  weight: number; // in base unit (lb or kg)
  capacity: number; // Max capacity before warning
}

export interface Alarm {
  id: string;
  name: string;
  type: 'one-time' | 'repeat' | 'duration';
  time?: string; // HH:mm
  interval?: number; // minutes
  enabled: boolean;
  nextTrigger?: number; // timestamp
}

interface MatchState {
  // Settings
  fieldMode: boolean;
  toggleFieldMode: () => void;
  unit: Unit;
  setUnit: (unit: Unit) => void;

  // Match Data
  matchTitle: string;
  pegNumber: string;
  durationMinutes: number;
  startTime: number | null; // Timestamp when match started
  isPaused: boolean;
  
  // Nets
  nets: Net[];
  
  // Actions
  startMatch: (title: string, peg: string, duration: number, netCount: number, capacity: number) => void;
  endMatch: () => void;
  updateNetWeight: (netId: number, weight: number) => void;
  addNet: () => void;
  
  // Alarms
  alarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
  toggleAlarm: (id: string) => void;
  deleteAlarm: (id: string) => void;

  // Admin Auth
  isAdminLoggedIn: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;
}

export const useMatchStore = create<MatchState>()(
  persist(
    (set) => ({
      fieldMode: false,
      toggleFieldMode: () => set((state) => ({ fieldMode: !state.fieldMode })),
      unit: 'lb',
      setUnit: (unit) => set({ unit }),
      
      matchTitle: '',
      pegNumber: '',
      durationMinutes: 300, // 5 hours default
      startTime: null,
      isPaused: false,
      
      nets: [],
      
      alarms: [],
      
      isAdminLoggedIn: false,
      loginAdmin: () => set({ isAdminLoggedIn: true }),
      logoutAdmin: () => set({ isAdminLoggedIn: false }),

      startMatch: (title, peg, duration, netCount, capacity) => {
        const newNets = Array.from({ length: netCount }).map((_, i) => ({
          id: i + 1,
          weight: 0,
          capacity: capacity
        }));
        
        set({
          matchTitle: title,
          pegNumber: peg,
          durationMinutes: duration,
          nets: newNets,
          startTime: Date.now(),
          isPaused: false
        });
      },

      endMatch: () => {
        set({ startTime: null }); // Or keep it for summary? For now just null to stop
      },

      updateNetWeight: (netId, weight) => set((state) => ({
        nets: state.nets.map(n => n.id === netId ? { ...n, weight } : n)
      })),

      addNet: () => set((state) => ({
        nets: [...state.nets, { 
          id: state.nets.length + 1, 
          weight: 0, 
          capacity: state.nets[0]?.capacity || 50 
        }]
      })),
      
      addAlarm: (alarm) => set((state) => ({ alarms: [...state.alarms, alarm] })),
      toggleAlarm: (id) => set((state) => ({
        alarms: state.alarms.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a)
      })),
      deleteAlarm: (id) => set((state) => ({
        alarms: state.alarms.filter(a => a.id !== id)
      })),
    }),
    {
      name: 'pegpro-storage',
    }
  )
);
