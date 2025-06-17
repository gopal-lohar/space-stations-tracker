// This file is for checking and updating the tle data into the /data directory
// to see how often does tle's update and for copy pasting purposes
// the data directory is NOT ignored in git - for keeping previous data for testing/comparision etc
// for testing/comparision etc

import fs from "fs/promises";
import { getTle, satelliteIds } from "./getTle";
import {
  DATA_DIR,
  ensureDataDirExists,
  getDataFromDataDir,
} from "./helpers/filesystem";
import { formatTime } from "./helpers/utils";
import type { Tle } from "./types";

interface SatelliteData {
  name: string;
  satelliteId: number;
  tle: Tle[];
}

async function updateTleFile(satellite: SatelliteData[]) {
  for (const sat of satellite) {
    const filePath = `${DATA_DIR}/norad-${sat.satelliteId}.json`;
    await fs.writeFile(filePath, JSON.stringify(sat.tle, null, 2));
  }
}

async function updateData(satellites: SatelliteData[]) {
  console.log("");
  console.log("Starting Update");
  console.log(`Time: ${formatTime(new Date())}`);
  for (const satellite of satellites) {
    console.log("Fetching data for ", satellite.name);
    const temp = await getTle(satellite.satelliteId);
    let { data: satelliteTle } = temp;
    const { error: tleError } = temp;
    if (!satelliteTle || tleError) {
      console.error("Failed to fetch TLE data");
      console.error("Error fetching TLE:", tleError);
      continue;
    }

    satelliteTle = {
      satelliteId: satellite.satelliteId,
      name: satellite.name,
      date: satelliteTle.date,
      line1: satelliteTle.line1,
      line2: satelliteTle.line2,
    };

    if (
      satellite.tle.length === 0 ||
      satellite.tle[0].date !== satelliteTle.date
    ) {
      console.log(`New TLE data for ${satellite.name}`);
      satellite.tle.unshift(satelliteTle);
      await updateTleFile(satellites);
    } else {
      console.log(`No TLE updates for ${satellite.name}`);
    }
  }
  console.log("");
}

function formatMs(diffMs: number) {
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  diffMs %= 1000 * 60 * 60 * 24;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  diffMs %= 1000 * 60 * 60;

  const minutes = Math.floor(diffMs / (1000 * 60));
  diffMs %= 1000 * 60;

  const seconds = Math.floor(diffMs / 1000);

  return `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
}

function getUpdateStats(satellites: SatelliteData[]) {
  satellites.forEach((satellite) => {
    console.log("\n For ", satellite.name);
    const updateIntervals: Array<number> = [];
    let updateInterval = 0;
    let lastUpdateTime: Date | null = null;
    satellite.tle.forEach((tle) => {
      if (!lastUpdateTime) {
        lastUpdateTime = new Date(tle.date);
      } else {
        updateInterval =
          lastUpdateTime.getTime() - new Date(tle.date).getTime();
        updateIntervals.push(updateInterval);
        console.log("Update Interval: ", formatMs(updateInterval));
        lastUpdateTime = new Date(tle.date);
      }
    });
    const averageUpdateInterval =
      updateIntervals.reduce((sum, val) => sum + val, 0) /
      updateIntervals.length;
    console.log(
      `Average Update Interval for ${satellite.name} is ${formatMs(averageUpdateInterval)}`
    );
  });
}

async function check(fetchInterval: number) {
  await ensureDataDirExists();

  const satellites: SatelliteData[] = [
    {
      name: "ISS",
      satelliteId: satelliteIds.iss,
      tle: ((await getDataFromDataDir<Tle[]>(
        `norad-${satelliteIds.iss}.json`
      )) || []) as Tle[],
    },
    {
      name: "CSS",
      satelliteId: satelliteIds.css,
      tle: ((await getDataFromDataDir<Tle[]>(
        `norad-${satelliteIds.css}.json`
      )) || []) as Tle[],
    },
  ];

  console.log("Stored Data: ", satellites, "\n");
  getUpdateStats(satellites);

  updateData(satellites);
  setInterval(() => {
    updateData(satellites);
  }, fetchInterval);
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const fetchInterval = 6 * HOUR;
check(fetchInterval);
