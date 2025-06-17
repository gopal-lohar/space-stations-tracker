import type { EciVec3 } from "satellite.js";

// Fetching data from api
export interface Tle {
  satelliteId: number;
  name: string;
  date: string; // ISO 8601 format
  line1: string;
  line2: string;
}

export interface TLESearchResponse {
  totalItems: number;
  member: Tle[];
  parameters: {
    search: string;
    sort: string;
    "sort-dir": string;
    page: number;
    "page-size": number;
  };
  view: {
    first: string;
    previous: string;
    last: string;
  };
}

export interface ApiResponse<T> {
  error: string | null;
  data: T | null;
}

// State Vector for the satellite
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
    position: EciVec3<number>;
    velocity: EciVec3<number>;
    // basically = {
    //   x: number;
    //   y: number;
    //   z: number;
    // }
  };
}

export type StateVectorRange = {
  stateVectors: Array<{
    time: Date;
    stateVector: StateVector;
  }>;
  errorCount: number; // number of state vectors went wrong
  error: string; // actual errors in the function itself
};

export interface ObserverLocation {
  latitude: number;
  longitude: number;
  elevation: number; // meters above sea level
}

// visibility samples for testing
export interface Pass {
  startingTime: string;
  endingTime: string;
  startElevation: number;
  maxElevation: number;
  endElevation: number;
  startDirection: number;
  endDirection: number;
  magnitude: number;
}

interface SatelliteData {
  tle: Tle;
  visibility: Pass[];
}

export interface VisibilitySampleRecord {
  recordDate: string;
  dataTill: string;
  observerLocation: ObserverLocation;
  satellites: SatelliteData[];
}
