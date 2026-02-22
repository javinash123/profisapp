import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import * as Haptics from "expo-haptics";
import { AppSettings, MatchState, Alarm, WeatherData, DEFAULT_SETTINGS, NetData, MatchConfig } from "./types";
import * as Storage from "./storage";
import { generateId } from "./utils";
import { StoredUser } from "./storage";
import { getApiUrl } from "./query-client";

interface AppContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  currentMatch: MatchState | null;
  lastCompletedMatch: MatchState | null;
  startMatch: (config: MatchConfig) => Promise<void>;
  endMatch: () => Promise<MatchState | null>;
  updateNetWeight: (netIndex: number, delta: number) => void;
  setNetWeight: (netIndex: number, weight: number) => void;
  updateNetName: (netIndex: number, name: string) => void;
  updateMatchUnit: (unit: "lb/oz" | "kg/g") => void;
  alarms: Alarm[];
  addAlarm: (alarm: Omit<Alarm, "id">) => Promise<void>;
  updateAlarm: (id: string, updates: Partial<Alarm>) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  weather: WeatherData | null;
  refreshWeather: () => Promise<void>;
  logout: () => Promise<void>;
  login: (user: StoredUser) => Promise<void>;
  isLoading: boolean;
  currentUser: StoredUser | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [currentMatch, setCurrentMatch] = useState<MatchState | null>(null);
  const [lastCompletedMatch, setLastCompletedMatch] = useState<MatchState | null>(null);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);

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
      const [loadedSettings, loadedMatch, loadedAlarms, loadedWeather, loadedUser] = await Promise.all([
        Storage.getSettings(),
        Storage.getCurrentMatch(),
        Storage.getAlarms(),
        Storage.getWeather(),
        Storage.getUser(),
      ]);
      setSettings(loadedSettings);
      setCurrentMatch(loadedMatch);
      setAlarms(loadedAlarms);
      setWeather(loadedWeather);
      setCurrentUser(loadedUser);
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
    const nets: NetData[] = Array.from({ length: config.numberOfNets }, (_, i) => ({
      id: generateId(),
      name: `Net ${i + 1}`,
      weight: 0,
      capacity: config.netCapacity,
    }));
    
    const match: MatchState = {
      id: generateId(),
      config,
      startTime: Date.now(),
      nets,
      catches: [],
      isActive: true,
    };
    
    setCurrentMatch(match);
    await Storage.saveCurrentMatch(match);

    // Auto-save to database
    const user = await Storage.getUser();
    if (user) {
      try {
        const baseUrl = getApiUrl();
        const apiPath = `${baseUrl}/api/matches`;
        console.log("Starting match save to:", apiPath, "for user:", user._id);
        
        const response = await fetch(apiPath, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          credentials: "include",
          body: JSON.stringify({
            userId: user._id,
            details: {
            venue: config.name,
            lakeName: config.lakeName,
            weatherDescription: config.weatherDescription,
            totalWeight: 0,
            duration: config.durationMinutes / 60,
            nets: nets,
            pegNumber: config.pegNumber
          },
            summary: `Match at ${config.name} started`,
            status: 'active'
          }),
        });
      
        console.log("Match save status:", response.status);
        const responseText = await response.text();
        console.log("Match save response text:", responseText);

        if (response.ok) {
          try {
            const savedMatch = JSON.parse(responseText);
            setCurrentMatch(prev => prev ? { ...prev, dbId: savedMatch._id } : null);
            console.log("Match saved successfully with ID:", savedMatch._id);
          } catch (e: any) {
            console.error("Failed to parse match save JSON error:", e.message);
          }
        } else {
          console.error("Match save failed with status:", response.status, responseText);
        }
      } catch (error) {
        console.error("Initial match save failed with error details:", error instanceof Error ? error.message : String(error));
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.error("Network error detected - possible CORS or connectivity issue");
        }
      }
    } else {
      console.log("No user found, skipping match save to database");
    }
    
    if (settings.haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const syncMatchToDb = useCallback(async (match: MatchState) => {
    if (!match.dbId) return;
    try {
      const user = await Storage.getUser();
      if (!user) {
        console.log("No user found, skipping match sync");
        return;
      }
      const totalWeight = match.nets.reduce((sum, net) => sum + net.weight, 0);
      const baseUrl = getApiUrl();
      const response = await fetch(`${baseUrl}/api/matches/${match.dbId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          userId: user._id,
          details: {
            venue: match.config.name,
            lakeName: match.config.lakeName,
            weatherDescription: match.config.weatherDescription,
            totalWeight: totalWeight,
            duration: match.config.durationMinutes / 60,
            nets: match.nets,
            pegNumber: match.config.pegNumber
          },
          summary: match.isActive 
            ? `Live match at ${match.config.name}` 
            : `Match at ${match.config.name} finished`,
          status: match.isActive ? 'active' : 'completed'
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Match sync failed with status:", response.status, errorText);
      }
    } catch (error) {
      console.error("Match sync failed:", error);
    }
  }, []);

  const endMatch = async () => {
    if (currentMatch) {
      const completedMatch: MatchState = {
        ...currentMatch,
        endTime: Date.now(),
        isActive: false,
      };
      
      // Update state first
      setLastCompletedMatch(completedMatch);
      setCurrentMatch(null);
      
      // Persist changes
      await Storage.saveMatchToHistory(completedMatch);
      await syncMatchToDb(completedMatch);
      await Storage.saveCurrentMatch(null);
      
      if (settings.haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      return completedMatch;
    }
    return null;
  };

  const updateNetWeight = useCallback((netIndex: number, delta: number) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      const newNets = [...prev.nets];
      const newWeight = Math.max(0, newNets[netIndex].weight + delta);
      newNets[netIndex] = { ...newNets[netIndex], weight: newWeight };
      
      const newCatches = [...prev.catches];
      if (delta > 0) {
        newCatches.push({
          id: generateId(),
          weight: delta,
          timestamp: Date.now(),
          netIndex,
        });
      }
      
      const updated = { ...prev, nets: newNets, catches: newCatches };
      syncMatchToDb(updated);
      return updated;
    });
    
    if (settings.haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [settings.haptics, syncMatchToDb]);

  const setNetWeight = useCallback((netIndex: number, weight: number) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      const newNets = [...prev.nets];
      const oldWeight = newNets[netIndex].weight;
      const capacity = newNets[netIndex].capacity;
      const diff = weight - oldWeight;
      
      if (capacity && weight > capacity) {
        // We allow it, but we could trigger a warning here if we had a UI for it.
        // For now, we just ensure the weight is set as requested.
        console.warn(`Net ${netIndex + 1} exceeds capacity: ${weight} > ${capacity}`);
      }
      
      newNets[netIndex] = { ...newNets[netIndex], weight: Math.max(0, weight) };
      
      const newCatches = [...prev.catches];
      if (diff > 0) {
        newCatches.push({
          id: generateId(),
          weight: diff,
          timestamp: Date.now(),
          netIndex,
        });
      }
      
      const updated = { ...prev, nets: newNets, catches: newCatches };
      syncMatchToDb(updated);
      return updated;
    });
  }, [syncMatchToDb]);

  const updateNetName = useCallback((netIndex: number, name: string) => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      const newNets = [...prev.nets];
      newNets[netIndex] = { ...newNets[netIndex], name };
      const updated = { ...prev, nets: newNets };
      syncMatchToDb(updated);
      return updated;
    });
  }, [syncMatchToDb]);

  const updateMatchUnit = useCallback((unit: "lb/oz" | "kg/g") => {
    setCurrentMatch((prev) => {
      if (!prev) return prev;
      const oldUnit = prev.config.unit;
      if (oldUnit === unit) return prev;
      
      const conversionFactor = oldUnit === "kg/g" && unit === "lb/oz" 
        ? 1 / 28.35 
        : oldUnit === "lb/oz" && unit === "kg/g" 
        ? 28.35 
        : 1;
      
      const convertedNets = prev.nets.map(net => ({
        ...net,
        weight: Math.round(net.weight * conversionFactor * 100) / 100,
        capacity: net.capacity ? Math.round(net.capacity * conversionFactor * 100) / 100 : undefined,
      }));
      
      return { 
        ...prev, 
        config: { ...prev.config, unit },
        nets: convertedNets,
      };
    });
  }, []);

  const addAlarm = async (alarm: Omit<Alarm, "id">) => {
    const newAlarm: Alarm = { ...alarm, id: generateId(), tone: (alarm as any).tone || "default" };
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

  const refreshWeather = useCallback(async () => {
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
  }, []);

  const logout = async () => {
    try {
      await Storage.saveUser(null);
      await Storage.saveCurrentMatch(null);
      // We don't clear settings or history to keep user preferences
      setCurrentMatch(null);
      setCurrentUser(null);
      
      if (settings.haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const login = async (user: StoredUser) => {
    try {
      await Storage.saveUser(user);
      setCurrentUser(user);
      
      if (settings.haptics) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        currentMatch,
        lastCompletedMatch,
        startMatch,
        endMatch,
        updateNetWeight,
        setNetWeight,
        updateNetName,
        updateMatchUnit,
        alarms,
        addAlarm,
        updateAlarm,
        deleteAlarm,
        weather,
        refreshWeather,
        isLoading,
        logout,
        login,
        currentUser,
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
