import { getPosition } from "suncalc";
import type { ObserverLocation } from "../types";

export function sunCalculation(
  observerLocation: ObserverLocation,
  time: Date
): { sunElevationInDegrees: number; isObserverInDarkness: boolean } {
  const sunPosition = getPosition(
    time,
    observerLocation.latitude,
    observerLocation.longitude
  );
  const sunElevationInDegrees = sunPosition.altitude * (180 / Math.PI);
  const isObserverInDarkness = sunElevationInDegrees <= -6;

  return {
    sunElevationInDegrees,
    isObserverInDarkness,
  };
}

import * as SunCalc from "suncalc";

interface SunTimes {
  sunrise: string;
  sunset: string;
  solarNoon: string;
}

export function getSunTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): { data: SunTimes | null; error: string | null } {
  if (latitude < -90 || latitude > 90) {
    return {
      data: null,
      error: "Latitude must be between -90 and 90 degrees",
    };
  }
  if (longitude < -180 || longitude > 180) {
    return {
      data: null,
      error: "Longitude must be between -180 and 180 degrees",
    };
  }

  const times = SunCalc.getTimes(date, latitude, longitude);

  return {
    data: {
      sunrise: times.sunrise.toISOString(),
      sunset: times.sunset.toISOString(),
      solarNoon: times.solarNoon.toISOString(),
    },
    error: null,
  };
}
