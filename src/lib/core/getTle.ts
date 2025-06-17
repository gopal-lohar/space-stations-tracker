import axios from "axios";
import type { ApiResponse, Tle, TLESearchResponse } from "./types";

const API_URL = "http://tle.ivanstanojevic.me/api/tle";

async function fetchData<T>(url: string): Promise<ApiResponse<T>> {
  let error = null;
  let data: T | null = null;
  try {
    const res = await axios.get<T>(url);
    data = res.data;
  } catch (err) {
    error = `Something went wrong: ${err}`;
  }

  return {
    data,
    error,
  };
}

export async function getTle(noradId: number): Promise<ApiResponse<Tle>> {
  return await fetchData(`${API_URL}/${noradId}`);
}

export async function searchSatellites(
  query: string
): Promise<ApiResponse<TLESearchResponse>> {
  return await fetchData(`${API_URL}?search=${query}`);
}

export const satelliteIds = {
  iss: 25544,
  css: 48274,
};

// temporary functions to avoid API calling
// TLE for International Space Station
export async function getIssTle(): Promise<ApiResponse<Tle>> {
  return {
    error: null,
    data: {
      satelliteId: 25544,
      name: "ISS",
      date: "2025-04-02T09:22:15+00:00",
      line1:
        "1 25544U 98067A   25092.39045819  .00016122  00000+0  28578-3 0  9991",
      line2:
        "2 25544  51.6385 322.4104 0003594  76.6489  92.3843 15.50403238503409",
    },
  };
}

// TLE for China Space Station
export async function getCssTle(): Promise<ApiResponse<Tle>> {
  return {
    error: null,
    data: {
      satelliteId: 48274,
      name: "CSS",
      date: "2025-04-02T10:34:59+00:00",
      line1:
        "1 48274U 21035A   25092.44096405  .00023211  00000+0  25297-3 0  9992",
      line2:
        "2 48274  41.4641 121.7664 0006067 158.4435 201.6661 15.62824832224318",
    },
  };
}
