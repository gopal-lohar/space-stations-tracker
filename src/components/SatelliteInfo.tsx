import { useCoreWorker } from "@/hooks/useCoreWorker";
import { useTleQuery } from "@/hooks/useTleQuery";
import type { Satellite } from "@/lib/const";
import { SECOND } from "@/lib/core/helpers/utils";
import type { ObserverLocation } from "@/lib/core/types";
import { useQuery } from "@tanstack/react-query";
import { PointOnMap, WorldMap } from "./WorldMap";

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

  const sunTimeQuery = useQuery({
    queryKey: ["sun_time", location],
    queryFn: () => {
      if (location) {
        return api!.getSunTimes(
          location.latitude,
          location.longitude,
          new Date()
        );
      }
    },
    enabled: isReady && !!location,
  });

  const formatCoord = (val: number) =>
    val >= 0 ? `+${val.toFixed(4)}` : val.toFixed(4);

  return (
    <div className="rounded-md border-2 p-4 lg:sticky lg:top-0 lg:max-h-[calc(100svh-4rem-1rem)] lg:overflow-auto">
      <div className="relative -m-3 overflow-hidden">
        <WorldMap>
          {location && (
            <PointOnMap
              point={{
                latitude: location.latitude,
                longitude: location.longitude,
                label: "You",
                color: "green",
              }}
            />
          )}
          {stateVectorQuery.data && (
            <PointOnMap
              point={{
                latitude: stateVectorQuery.data.geodetic.position.latitude,
                longitude: stateVectorQuery.data.geodetic.position.longitude,
                label: satellite.shortName,
                color: "red",
              }}
            />
          )}
        </WorldMap>
      </div>
      <div className="space-y-4 py-4">
        {!isReady || !tleQuery.data ? (
          "Loading Data..."
        ) : stateVectorQuery.data ? (
          <div className="grid gap-1">
            <span className="text-center text-lg">{satellite.longName}</span>
            <div className="flex justify-between gap-2">
              <span>Latitude</span>
              <span className="font-mono">
                {formatCoord(stateVectorQuery.data.geodetic.position.latitude)}°
              </span>
            </div>
            <div className="flex justify-between gap-2">
              <span>Longitude</span>
              <span className="font-mono">
                {formatCoord(stateVectorQuery.data.geodetic.position.longitude)}
                °
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
        {location != null &&
          (sunTimeQuery.isLoading ? (
            "Calculating Sun Time"
          ) : sunTimeQuery.error ? (
            "Error Calculating Sun Time"
          ) : sunTimeQuery.data ? (
            <div className="grid gap-1">
              <span className="text-center text-lg">Sun</span>
              <div className="flex justify-between gap-2">
                <span>Sunrise</span>
                <span className="font-mono">
                  {new Date(sunTimeQuery.data.sunrise).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Solarnoon</span>
                <span className="font-mono">
                  {new Date(sunTimeQuery.data.solarNoon).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span>Sunset</span>
                <span className="font-mono">
                  {new Date(sunTimeQuery.data.sunset).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ) : (
            `Error Calculating Sun Time ${sunTimeQuery.error}, loc ${location}`
          ))}
      </div>
    </div>
  );
}
