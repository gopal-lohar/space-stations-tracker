import { expose } from "comlink";

import type { StateVector, Tle } from "@/lib/core/index";
import { calculateStateVector } from "@/lib/core/index";

const coreOperation = {
  async calculateStateVector(time: Date, tle: Tle): Promise<StateVector> {
    const res = calculateStateVector(time, tle);
    if (typeof res == "string") {
      throw new Error(res);
    } else {
      return res;
    }
  },
};

// Expose the API to the main thread
expose(coreOperation);

// Export type for TypeScript
export type CoreWorkerAPI = typeof coreOperation;
