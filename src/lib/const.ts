export const LOCAL_SATELLITE_KEY = "selected_satellite";
export const LOCAL_LOCATION_KEY = "local_location";
export const API_URL = "https://tle.ivanstanojevic.me/api/tle";

export type Satellite = {
  noradId: number;
  shortName: string;
  module: string;
  longName: string;
  operator?: string;
  launchDate?: string;
  mass?: number;
};

// NOTE: make sure it has at least one satellite
export const satellites: Satellite[] = [
  {
    noradId: 25544,
    shortName: "ISS",
    module: "ZARYA",
    longName: "International Space Station",
    operator: "NASA/Roscosmos/ESA/JAXA/CSA",
    launchDate: "1998-11-20",
    mass: 420000,
  },
  {
    noradId: 48274,
    shortName: "CSS",
    module: "TIANHE",
    longName: "China Space Station (Tiangong)",
    operator: "China Manned Space Agency",
    launchDate: "2021-04-29",
    mass: 66000,
  },
];
