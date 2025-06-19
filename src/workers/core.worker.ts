import { expose } from "comlink";

import type { StateVector, Tle } from "@/lib/core/index";
import {
  calculateStateVector,
  computePasses,
  getSunTimes,
} from "@/lib/core/index";

const coreOperation = {
  async calculateStateVector(time: Date, tle: Tle): Promise<StateVector> {
    const res = calculateStateVector(time, tle);
    if (typeof res == "string") {
      throw new Error(res);
    } else {
      return res;
    }
  },
  computePasses,
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
};

// Expose the API to the main thread
expose(coreOperation);

// Export type for TypeScript
export type CoreWorkerAPI = typeof coreOperation;
