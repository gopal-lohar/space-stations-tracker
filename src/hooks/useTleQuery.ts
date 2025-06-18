import { API_URL } from "@/lib/const";
import type { Tle } from "@/lib/core";
import { DAY } from "@/lib/core/helpers/utils";
import { getLocalData, setLocalData } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export async function getTle(noradId: number): Promise<Tle> {
  const res = await axios.get<Tle>(`${API_URL}/${noradId}`);
  return res.data;
}

export function useTleQuery({ noradId }: { noradId: number }) {
  const storageKey = `cache_tle_${noradId}`;

  return useQuery({
    queryKey: ["tle_query", noradId],
    queryFn: async () => {
      // Check local storage first
      try {
        const cachedData = getLocalData<Tle>(storageKey);
        if (cachedData) {
          const cacheTimestamp = new Date(cachedData?.date).getTime();
          const now = new Date().getTime();
          if (now - cacheTimestamp < DAY) {
            return cachedData;
          }
        }
      } catch (error) {
        console.warn(
          `Error occured when getting cache tle from localStorage, now falling back to api, Error: ${error}`
        );
      }

      // Fetch fresh data if no valid cache
      const data = await getTle(noradId);

      try {
        setLocalData(storageKey, data);
      } catch (error) {
        console.warn(
          `Error occured when setting tle to localStorage, Error: ${error}`
        );
      }
      return data;
    },
    staleTime: DAY,
  });
}
