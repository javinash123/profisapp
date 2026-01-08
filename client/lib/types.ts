export type WeightUnit = "lb/oz" | "kg/g";

export interface NetData {
  weight: number;
  capacity?: number;
}

export interface MatchConfig {
  name: string;
  durationMinutes: number;
  pegNumber: string;
  numberOfNets: number;
  netCapacity?: number;
  unit: WeightUnit;
  keepScreenOn: boolean;
}

export interface MatchState {
  id: string;
  config: MatchConfig;
  startTime: number;
  endTime?: number;
  nets: NetData[];
  isActive: boolean;
}

export type AlarmMode = "one-time" | "repeat" | "duration-pattern";

export interface Alarm {
  id: string;
  mode: AlarmMode;
  time?: number;
  intervalMinutes?: number;
  durationSeconds?: number;
  patternMinutes?: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  enabled: boolean;
  label?: string;
  tone?: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  pressureTrend: "rising" | "falling" | "stable";
  description: string;
  lastUpdated: number;
  isOffline?: boolean;
}

export interface AppSettings {
  unit: WeightUnit;
  haptics: boolean;
  sound: boolean;
  displayName: string;
  avatarPreset: number;
  onboardingComplete: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  unit: "lb/oz",
  haptics: true,
  sound: true,
  displayName: "Angler",
  avatarPreset: 0,
  onboardingComplete: false,
};
