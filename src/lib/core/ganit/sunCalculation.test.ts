import { describe, expect, it } from "vitest";
import { getDataFromDataDir } from "../helpers/filesystem";
import type { VisibilitySampleRecord } from "../types";
import { sunCalculation } from "./sunCalculation";

describe("#calculateVisibility", () => {
  it("should return true for isObserverInDarkness if the Observer is in darkness for every visible passes of iss", async () => {
    const records = await getDataFromDataDir<VisibilitySampleRecord[]>(
      "sat_visibility_samples.json"
    );
    if (!records) {
      throw new Error("No data found");
    }

    records.forEach((record) => {
      record.satellites.forEach((satellite) => {
        satellite.visibility.forEach((pass) => {
          const { isObserverInDarkness: atStart } = sunCalculation(
            record.observerLocation,
            new Date(pass.startingTime)
          );
          expect(atStart).toBe(true);
          const { isObserverInDarkness: atEnd } = sunCalculation(
            record.observerLocation,
            new Date(pass.endingTime)
          );
          expect(atEnd).toBe(true);
        });
      });
    });
  });
});
