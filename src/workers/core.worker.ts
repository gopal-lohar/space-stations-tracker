import { expose } from "comlink";

import { calculateCurrentOrbitPath } from "@/lib/core/ganit/calculateStateVector";
import type { StateVector, Tle } from "@/lib/core/index";
import {
  calculateLookAnglesRange,
  calculateStateVector,
  computePasses,
  getSunTimes,
} from "@/lib/core/index";

const coreOperation = {
  computePasses,
  calculateLookAnglesRange,
  async calculateStateVector(time: Date, tle: Tle): Promise<StateVector> {
    const res = calculateStateVector(time, tle);
    if (typeof res == "string") {
      throw new Error(res);
    } else {
      return res;
    }
  },
  getSunTimes(latitude: number, longitude: number, date?: Date) {
    const res = getSunTimes(latitude, longitude, date);
    if (typeof res.error == "string") {
      throw new Error(res.error);
    } else if (!res.data) {
      throw new Error("Couldn't calculate sun times");
    } else {
      return res.data;
    }
  },

  calculateCurrentOrbitPath(
    tle: Tle,
    time: Date
  ): { stateVector: StateVector; time: Date }[] {
    const res = calculateCurrentOrbitPath(tle, time);
    if (res.error) {
      throw new Error(res.error);
    } else if (!res.stateVectors) {
      throw new Error("Couldn't calculate sun times");
    } else {
      return res.stateVectors;
    }
  },
};

// Expose the API to the main thread
expose(coreOperation);

// Export type for TypeScript
export type CoreWorkerAPI = typeof coreOperation;
