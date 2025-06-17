import * as satellite from "satellite.js";
import type { ObserverLocation, StateVector } from "../types";

function calculateLookAnglesInRadians(
  stateVector: StateVector,
  observerLocation: ObserverLocation
): satellite.LookAngles {
  const observerLocationGeodetic = {
    longitude: satellite.degreesToRadians(observerLocation.longitude),
    latitude: satellite.degreesToRadians(observerLocation.latitude),
    height: observerLocation.elevation / 1000,
  };

  // satellite.geodeticToEcf expects the location in geodetic coordinates
  // IN RADIANS
  const satellitePositionGeodetic = {
    longitude: satellite.degreesToRadians(
      stateVector.geodetic.position.longitude
    ),
    latitude: satellite.degreesToRadians(
      stateVector.geodetic.position.latitude
    ),
    height: stateVector.geodetic.position.height,
  };

  const satelliteEcf = satellite.geodeticToEcf(satellitePositionGeodetic);

  const lookAngles = satellite.ecfToLookAngles(
    observerLocationGeodetic,
    satelliteEcf
  );

  return lookAngles;
}

// function normalizeAzimuth(azimuth: number): number {
//   // Normalize the azimuth to [-π, π] before converting to degrees
//   while (azimuth > Math.PI) azimuth -= 2 * Math.PI;
//   while (azimuth < -Math.PI) azimuth += 2 * Math.PI;
//   return azimuth;
// }

export function calculateLookAngles(
  stateVector: StateVector,
  observerLocation: ObserverLocation
): {
  lookAnglesInDegrees: { azimuth: number; elevation: number };
  isSatelliteAboveHorizon: boolean;
  rangeSat: number;
} {
  const lookAngles = calculateLookAnglesInRadians(
    stateVector,
    observerLocation
  );
  const lookAnglesInDegrees = {
    azimuth: lookAngles.azimuth * (180 / Math.PI),
    elevation: lookAngles.elevation * (180 / Math.PI),
  };

  return {
    lookAnglesInDegrees,
    isSatelliteAboveHorizon: lookAnglesInDegrees.elevation > 10,
    rangeSat: lookAngles.rangeSat, // in kilometers
  };
}
