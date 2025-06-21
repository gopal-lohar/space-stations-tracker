import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLocalData<T>(key: string): T | null {
  const item = localStorage.getItem(key);
  if (!item) return null;
  const data = JSON.parse(item);
  return data;
}

export function setLocalData<T>(key: string, data: T) {
  const item = JSON.stringify(data);
  localStorage.setItem(key, item);
}

export function degreesToDirection(degrees: number) {
  // Normalize degrees to the range [0, 360)
  const normalized = ((degrees % 360) + 360) % 360;

  // clockwise order
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];

  // Calculate index (16 points = 22.5° per segment)
  const index = Math.round(normalized / 22.5) % 16;

  return directions[index];
}
