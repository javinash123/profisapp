import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import * as Haptics from "expo-haptics";
import { AppSettings, MatchState, Alarm, WeatherData, DEFAULT_SETTINGS, NetData, MatchConfig } from "./types";
import * as Storage from "./storage";
import { generateId } from "./utils";

interface AppContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  currentMatch: MatchState | null;
  startMatch: (config: MatchConfig) => Promise<void>;
  endMatch: () => Promise<void>;
  updateNetWeight: (netIndex: number, delta: number) => void;
  setNetWeight: (netIndex: number, weight: number) => void;
  alarms: Alarm[];
  addAlarm: (alarm: Omit<Alarm, "id">) => Promise<void>;
  updateAlarm: (id: string, updates: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  weather: WeatherData | null;
  refreshWeather: () => Promise<void>;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [currentMatch, setCurrentMatch] = useState<MatchState | null>(null);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentMatch) {
      Storage.saveCurrentMatch(currentMatch);
    }
  }, [currentMatch]);

  const loadInitialData = async () => {
    try {
      const [loadedSettings, loadedMatch, loadedAlarms, loadedWeather] = await Promise.all([
        Storage.getSettings(),
        Storage.getCurrentMatch(),
        Storage.getAlarms(),
        Storage.getWeather(),
      ]);
      setSettings(loadedSettings);
      setCurrentMatch(loadedMatch);
      setAlarms(loadedAlarms);
      setWeather(loadedWeather);
    } catch (error) {
      console.error("Failed to load initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await Storage.saveSettings(newSettings);
  };

  const startMatch = async (config: MatchConfig) => {
    const nets: NetData[] = Array.from({ length: config.numberOfNets }, () => ({
      weight: 0,
      capacity: config.netCapacity,
    }));
    
    const match: MatchState = {
      id: generateId(),
      config,
      startTime: Date.now(),
      nets,
      isActive: true,
    };
    
    setCurrentMatch(match);
    await Storage.saveCurrentMatch(match);
    
    if (settings.haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const endMatch = async () => {
    if (currentMatch) {
      const completedMatch: MatchState = {
        ...currentMatch,
        endTime: Date.now(),
        isActive: false,
      };
      await Storage.saveMatchToHistory(completedMatch);
      setCurrentMatch(null);
      await Storage.saveCurrentMatch(null);
      
      if (settings.haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const updateNetWeight = useCallback((netIndex: number, delta: number) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      const newNets = [...prev.nets];
      const newWeight = Math.max(0, newNets[netIndex].weight + delta);
      newNets[netIndex] = { ...newNets[netIndex], weight: newWeight };
      return { ...prev, nets: newNets };
    });
    
    if (settings.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [settings.haptics]);

  const setNetWeight = useCallback((netIndex: number, weight: number) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      const newNets = [...prev.nets];
      newNets[netIndex] = { ...newNets[netIndex], weight: Math.max(0, weight) };
      return { ...prev, nets: newNets };
    });
  }, []);

  const addAlarm = async (alarm: Omit<Alarm, "id">) => {
    const newAlarm: Alarm = { ...alarm, id: generateId() };
    const newAlarms = [...alarms, newAlarm];
    setAlarms(newAlarms);
    await Storage.saveAlarms(newAlarms);
  };

  const updateAlarm = async (id: string, updates: Partial<Alarm>) => {
    const newAlarms = alarms.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setAlarms(newAlarms);
    await Storage.saveAlarms(newAlarms);
  };

  const deleteAlarm = async (id: string) => {
    const newAlarms = alarms.filter((a) => a.id !== id);
    setAlarms(newAlarms);
    await Storage.saveAlarms(newAlarms);
  };

  const refreshWeather = async () => {
    const mockWeather: WeatherData = {
      temperature: 18,
      humidity: 65,
      windSpeed: 12,
      pressure: 1013,
      pressureTrend: "stable",
      description: "Partly Cloudy",
      lastUpdated: Date.now(),
      isOffline: false,
    };
    setWeather(mockWeather);
    await Storage.saveWeather(mockWeather);
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        currentMatch,
        startMatch,
        endMatch,
        updateNetWeight,
        setNetWeight,
        alarms,
        addAlarm,
        updateAlarm,
        deleteAlarm,
        weather,
        refreshWeather,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
