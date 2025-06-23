import type { LookAngles } from "./ganit/calculateLookAngles";
import {
  calculateLookAngles,
  calculateLookAnglesRange,
} from "./ganit/calculateLookAngles";
import { calculateStateVector } from "./ganit/calculateStateVector";
import { computePasses } from "./ganit/computePasses";
import { getSunTimes } from "./ganit/sunCalculation";
import type { Pass, StateVector, Tle } from "./types";

export {
  calculateLookAngles,
  calculateLookAnglesRange,
  calculateStateVector,
  computePasses,
  getSunTimes,
};
export type { LookAngles, Pass, StateVector, Tle };
