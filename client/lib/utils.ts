import { WeightUnit } from "./types";

export function formatWeight(grams: number, unit: WeightUnit): string {
  if (unit === "kg/g") {
    if (grams >= 1000) {
      const kg = Math.floor(grams / 1000);
      const g = Math.round(grams % 1000);
      return g > 0 ? `${kg}.${String(g).padStart(3, "0").slice(0, 1)}kg` : `${kg}kg`;
    }
    return `${Math.round(grams)}g`;
  } else {
    const totalOunces = grams / 28.3495;
    const pounds = Math.floor(totalOunces / 16);
    const ounces = Math.round(totalOunces % 16);
    if (pounds > 0) {
      return ounces > 0 ? `${pounds}lb ${ounces}oz` : `${pounds}lb`;
    }
    return `${ounces}oz`;
  }
}

export function parseWeight(value: string, unit: WeightUnit): number {
  const num = parseFloat(value) || 0;
  if (unit === "kg/g") {
    return num;
  } else {
    return num * 28.3495;
  }
}

export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) {
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }
  return `${mins}m`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getProgressColor(percentage: number, colors: { success: string; warning: string; error: string }): string {
  if (percentage < 80) return colors.success;
  if (percentage <= 100) return colors.warning;
  return colors.error;
}
