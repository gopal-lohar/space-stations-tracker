import type { StateVector } from "../types";

// Earth radius in kilometers
const EARTH_RADIUS_KM: number = 6371.0;

export interface EciVec3 {
  x: number;
  y: number;
  z: number;
}

function getSunPositionEci(date: Date): EciVec3 {
  // Calculate Julian date
  const jd: number = date.getTime() / 86400000.0 + 2440587.5;

  // Days since J2000.0
  const n: number = jd - 2451545.0;

  // Mean longitude of the Sun (degrees)
  const L: number = (280.46 + 0.9856474 * n) % 360;

  // Mean anomaly of the Sun (degrees)
  const g: number = (((357.528 + 0.9856003 * n) % 360) * Math.PI) / 180;

  // Ecliptic longitude (degrees)
  const lambda: number =
    ((L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * Math.PI) / 180;

  // Distance to Sun (AU)
  const R: number = 1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2 * g);

  // Obliquity of the ecliptic (degrees)
  const epsilon: number = ((23.439 - 0.0000004 * n) * Math.PI) / 180;

  // Convert to ECI coordinates (AU)
  const x_au: number = R * Math.cos(lambda);
  const y_au: number = R * Math.cos(epsilon) * Math.sin(lambda);
  const z_au: number = R * Math.sin(epsilon) * Math.sin(lambda);

  // Convert from AU to km (1 AU ≈ 149,597,870.7 km)
  const AU_TO_KM: number = 149597870.7;

  return {
    x: x_au * AU_TO_KM,
    y: y_au * AU_TO_KM,
    z: z_au * AU_TO_KM,
  };
}

function dotProduct(a: EciVec3, b: EciVec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function magnitude(vec: EciVec3): number {
  return Math.sqrt(vec.x * vec.x + vec.y * vec.y + vec.z * vec.z);
}

function subtract(a: EciVec3, b: EciVec3): EciVec3 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
}

/**
 * Determine if a satellite is illuminated by the Sun
 * Uses the cylindrical shadow model as described in Celestrak's visibility predictions
 */
export function isIssIlluminated(state: StateVector, date: Date): boolean {
  // Get satellite position in ECI coordinates (km)
  const satPos: EciVec3 = state.eci.position;

  // Get Sun position in ECI coordinates (km)
  const sunPos: EciVec3 = getSunPositionEci(date);

  // Calculate vector from Earth center to satellite
  const satVector: EciVec3 = { x: satPos.x, y: satPos.y, z: satPos.z };

  // Calculate unit vector from Earth to Sun
  const sunDistance: number = magnitude(sunPos);
  const sunUnit: EciVec3 = {
    x: sunPos.x / sunDistance,
    y: sunPos.y / sunDistance,
    z: sunPos.z / sunDistance,
  };

  // Calculate satellite distance from Earth center
  const satDistance: number = magnitude(satVector);

  // Project satellite position onto the Earth-Sun line
  const projection: number = dotProduct(satVector, sunUnit);

  // If satellite is on the sunward side of Earth, it's definitely illuminated
  if (projection > 0) {
    return true;
  }

  // Calculate perpendicular distance from satellite to Earth-Sun line
  // This uses the cylindrical shadow model
  const projectedPoint: EciVec3 = {
    x: projection * sunUnit.x,
    y: projection * sunUnit.y,
    z: projection * sunUnit.z,
  };

  const perpVector: EciVec3 = subtract(satVector, projectedPoint);
  const perpDistance: number = magnitude(perpVector);

  // Satellite is in shadow if:
  // 1. It's on the anti-sunward side of Earth (projection < 0)
  // 2. Its perpendicular distance from Earth-Sun line is less than Earth's radius
  // 3. It's beyond Earth's center along the shadow line

  const isInShadow: boolean =
    projection < 0 &&
    perpDistance < EARTH_RADIUS_KM &&
    Math.abs(projection) < satDistance;

  return !isInShadow;
}
