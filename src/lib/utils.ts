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
