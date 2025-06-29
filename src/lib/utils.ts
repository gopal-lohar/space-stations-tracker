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

export function formatTime(date: Date, timezone: string = "UTC"): string {
  const istDate = new Date(date);

  // Format the date and time
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: timezone,
  };

  return (
    new Intl.DateTimeFormat("en-IN", options).format(istDate) + " " + timezone
  );
}

export function formatDuration(seconds: number): string {
  if (seconds === 0) return "0 seconds";

  const timeUnits = [
    { unit: "y", seconds: 31536000 },
    { unit: "d", seconds: 86400 },
    { unit: "h", seconds: 3600 },
    { unit: "m", seconds: 60 },
    { unit: "s", seconds: 1 },
  ];

  const parts: string[] = [];
  let remaining = seconds;

  for (const { unit, seconds: unitSeconds } of timeUnits) {
    const count = Math.floor(remaining / unitSeconds);
    if (count > 0) {
      remaining %= unitSeconds;
      parts.push(`${count}${unit}`);
    }
  }

  return parts.length === 1
    ? parts[0]
    : parts.slice(0, -1).join(", ") + " " + parts[parts.length - 1];
}
