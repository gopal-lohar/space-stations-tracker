import * as satellite from "satellite.js";
import type { StateVector, StateVectorRange, Tle } from "../types";

export function calculateStateVector(
  time: Date,
  tle: Tle
): StateVector | string {
  const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
  // Get position in Earth-Centered Inertial (ECI) coordinates
  const positionAndVelocity = satellite.propagate(satrec, time);

  const positionEciOrBool = positionAndVelocity?.position;
  const velocityEciOrBool = positionAndVelocity?.velocity;

  // Get GMST for coordinate conversion
  const gmst = satellite.gstime(time);

  if (
    typeof positionEciOrBool === "boolean" ||
    typeof velocityEciOrBool === "boolean" ||
    !positionEciOrBool ||
    !velocityEciOrBool
  ) {
    return "Failed to calculate position and velocity";
  }

  const positionEci = positionEciOrBool as satellite.EciVec3<number>;
  const velocityEci = velocityEciOrBool as satellite.EciVec3<number>;

  // Convert to geographic coordinates
  const positionGd = satellite.eciToGeodetic(positionEci, gmst);

  // Calculate velocity magnitude
  const velocityMagnitude = Math.sqrt(
    Math.pow(positionEci.x, 2) +
      Math.pow(positionEci.y, 2) +
      Math.pow(positionEci.z, 2)
  );

  return {
    geodetic: {
      position: {
        latitude: satellite.degreesLat(positionGd.latitude),
        longitude: satellite.degreesLong(positionGd.longitude),
        height: positionGd.height,
      },
      velocity: velocityMagnitude,
    },
    eci: {
      position: positionEci,
      velocity: velocityEci,
    },
  };
}

export function calculateStateVectorRange(
  tle: Tle,
  startTime: Date,
  endTime: Date,
  stepSeconds: number = 60
): StateVectorRange {
  const data: StateVectorRange = {
    stateVectors: [],
    errorCount: 0,
    error: "",
  };

  const currentTime = new Date(startTime);

  if (startTime > endTime) {
    data.error = "Start time must be before end time";
    return data;
  }

  while (currentTime <= endTime) {
    const stateVector = calculateStateVector(currentTime, tle);
    if (typeof stateVector !== "string") {
      data.stateVectors.push({
        time: new Date(currentTime),
        stateVector,
      });
    } else {
      data.errorCount++;
    }
    currentTime.setSeconds(currentTime.getSeconds() + stepSeconds);
  }

  return data;
}
