import { useCoreWorker } from "@/hooks/useCoreWorker";
import { useTleQuery } from "@/hooks/useTleQuery";
import type { Satellite } from "@/lib/const";
import { SECOND } from "@/lib/core/helpers/utils";
import type { ObserverLocation } from "@/lib/core/types";
import { useQuery } from "@tanstack/react-query";

export default function SatelliteInfo({
  satellite,
  location,
}: {
  satellite: Satellite;
  location: ObserverLocation | null;
}) {
  const tleQuery = useTleQuery(satellite.noradId);

  const { api, isReady } = useCoreWorker();
  const stateVectorQuery = useQuery({
    queryKey: ["state_vector", satellite.noradId],
    queryFn: () => {
      if (tleQuery.data) {
        return api!.calculateStateVector(new Date(), tleQuery.data);
      }
    },
    enabled: isReady && !!tleQuery.data,
    refetchInterval: SECOND,
  });

  const formatCoord = (val: number) =>
    val >= 0 ? `+${val.toFixed(4)}` : val.toFixed(4);

  return (
    <div className="sticky top-0 max-h-[calc(100svh-4rem-1rem)] overflow-auto rounded-md border-2 p-4">
      {!isReady || !tleQuery.data ? (
        "Loading Data..."
      ) : stateVectorQuery.data ? (
        <div>
          <div className="flex justify-between gap-2">
            <span>Latitude</span>
            <span className="font-mono">
              {formatCoord(stateVectorQuery.data.geodetic.position.latitude)}°
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Longitude</span>
            <span className="font-mono">
              {formatCoord(stateVectorQuery.data.geodetic.position.longitude)}°
            </span>
          </div>
          <div className="flex justify-between gap-2">
            <span>Altitude</span>
            <span className="font-mono">
              {stateVectorQuery.data.geodetic.position.height.toFixed(2)} km
            </span>
          </div>
        </div>
      ) : (
        "calculating..."
      )}
    </div>
  );
}
