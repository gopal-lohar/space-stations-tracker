// Assume ECI vector is defined as follows:
export interface EciVec3 {
  x: number;
  y: number;
  z: number;
}

export interface StateVector {
  geodetic: {
    position: {
      latitude: number;
      longitude: number;
      height: number;
    };
    velocity: number; // in m/s
  };
  eci: {
    position: EciVec3;
    velocity: EciVec3;
  };
}

function dot(v1: EciVec3, v2: EciVec3): number {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

function norm(v: EciVec3): number {
  return Math.sqrt(dot(v, v));
}

// function subtract(v1: EciVec3, v2: EciVec3): EciVec3 {
//   return { x: v1.x - v2.x, y: v1.y - v2.y, z: v1.z - v2.z };
// }

// --- Compute the Sun's position in ECI coordinates ---
// This simple approximation is sufficient for our illumination test. (ig)
function getSunEciPosition(date: Date): EciVec3 {
  const rad = Math.PI / 180;
  const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0);
  const daysSinceJ2000 = (date.getTime() - J2000) / 86400000;

  // Mean anomaly of the Sun (in degrees)
  const M = (357.5291 + 0.98560028 * daysSinceJ2000) % 360;
  // Mean longitude corrected for the Sun's perihelion (approximation)
  const L = (M + 102.9372 + 180) % 360;
  const Lrad = L * rad;

  // Obliquity of the ecliptic
  const obliquity = 23.4397 * rad;
  // Approximate distance from Earth to Sun in km (~1 AU)
  const sunDistance = 149597870.7;

  return {
    x: sunDistance * Math.cos(Lrad),
    y: sunDistance * Math.cos(obliquity) * Math.sin(Lrad),
    z: sunDistance * Math.sin(obliquity) * Math.sin(Lrad),
  };
}

// --- Main function to determine if the satellite is illuminated ---
// Based on the geometry described in the Celestrak column:
// The satellite is in full shadow (umbra) if the angular separation
// between the satellite and the Sun (as seen from Earth's center)
// is less than (Earth's angular radius from the satellite - Sun's angular radius).
export function isIssIlluminated(state: StateVector, date: Date): boolean {
  // Constants (in kilometers)
  const earthRadius = 6378.137; // Mean Earth radius
  const sunRadius = 696000; // Sun's radius

  // Satellite's ECI position and its magnitude
  const satPos = state.eci.position;
  const satDist = norm(satPos);

  // Compute Sun's ECI position and its magnitude
  const sunPos = getSunEciPosition(date);
  const sunDist = norm(sunPos);

  // Angular separation (theta) between satellite and Sun as seen from Earth's center
  const cosTheta = dot(satPos, sunPos) / (satDist * sunDist);
  const theta = Math.acos(Math.min(Math.max(cosTheta, -1), 1)); // Clamp for safety

  // Earth's angular radius as seen from the satellite
  const earthAngularRadius = Math.asin(earthRadius / satDist);

  // Sun's angular radius as seen from Earth (satDist << sunDist, so similar for satellite)
  const sunAngularRadius = Math.asin(sunRadius / sunDist);

  // If theta is less than (earthAngularRadius - sunAngularRadius), then the satellite is fully in the umbra.
  // Otherwise, some portion of the Sun is visible.
  return theta >= earthAngularRadius - sunAngularRadius;
}
