import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppSettings, MatchState, Alarm, WeatherData, DEFAULT_SETTINGS } from "./types";

const KEYS = {
  SETTINGS: "@pegpro_settings",
  CURRENT_MATCH: "@pegpro_current_match",
  MATCH_HISTORY: "@pegpro_match_history",
  ALARMS: "@pegpro_alarms",
  WEATHER: "@pegpro_weather",
};

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (data) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

export async function getCurrentMatch(): Promise<MatchState | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CURRENT_MATCH);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveCurrentMatch(match: MatchState | null): Promise<void> {
  try {
    if (match) {
      await AsyncStorage.setItem(KEYS.CURRENT_MATCH, JSON.stringify(match));
    } else {
      await AsyncStorage.removeItem(KEYS.CURRENT_MATCH);
    }
  } catch (error) {
    console.error("Failed to save match:", error);
  }
}

export async function getMatchHistory(): Promise<MatchState[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.MATCH_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveMatchToHistory(match: MatchState): Promise<void> {
  try {
    const history = await getMatchHistory();
    history.unshift(match);
    const limitedHistory = history.slice(0, 50);
    await AsyncStorage.setItem(KEYS.MATCH_HISTORY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error("Failed to save match to history:", error);
  }
}

export async function getAlarms(): Promise<Alarm[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.ALARMS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveAlarms(alarms: Alarm[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.ALARMS, JSON.stringify(alarms));
  } catch (error) {
    console.error("Failed to save alarms:", error);
  }
}

export async function getWeather(): Promise<WeatherData | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.WEATHER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveWeather(weather: WeatherData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.WEATHER, JSON.stringify(weather));
  } catch (error) {
    console.error("Failed to save weather:", error);
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  } catch (error) {
    console.error("Failed to clear data:", error);
  }
}
