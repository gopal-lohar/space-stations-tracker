import type { ObserverLocation, StateVector } from "../types";
import { calculateLookAngles } from "./calculateLookAngles";
import { isIssIlluminated } from "./isIlluminated";
import { sunCalculation } from "./sunCalculation";

interface VisibilityInfo {
  isVisible: boolean;
  isIlluminated: boolean;
  isObserverInDarkness: boolean;
  sunElevationInDegrees: number;
  isSatelliteAboveHorizon: boolean;
  lookAnglesInDegrees: {
    azimuth: number;
    elevation: number;
  };
  distanceInKm: number;
}

export function calculateVisibility(
  stateVector: StateVector,
  observerLocation: ObserverLocation,
  time: Date
): VisibilityInfo {
  const { isObserverInDarkness, sunElevationInDegrees } = sunCalculation(
    observerLocation,
    time
  );
  const { lookAnglesInDegrees, isSatelliteAboveHorizon, rangeSat } =
    calculateLookAngles(stateVector, observerLocation);

  const isIlluminated = isIssIlluminated(stateVector, time);

  return {
    isVisible: isIlluminated && isObserverInDarkness && isSatelliteAboveHorizon,
    isIlluminated,
    isObserverInDarkness,
    sunElevationInDegrees,
    isSatelliteAboveHorizon,
    lookAnglesInDegrees,
    distanceInKm: rangeSat,
  };
}
