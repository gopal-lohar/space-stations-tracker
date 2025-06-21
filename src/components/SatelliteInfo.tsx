import { useCoreWorker } from "@/hooks/useCoreWorker";
import { useTleQuery } from "@/hooks/useTleQuery";
import type { Satellite } from "@/lib/const";
import { SECOND } from "@/lib/core/helpers/utils";
import type { ObserverLocation, Pass } from "@/lib/core/types";
import { cn, degreesToDirection } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowUp, Navigation, X } from "lucide-react";
import type { ReactNode } from "react";
import { PointOnMap, WorldMap } from "./WorldMap";
import { Button } from "./ui/button";

export default function SatelliteInfo({
  satellite,
  location,
  selectedPass,
  setSelectedPass,
}: {
  satellite: Satellite;
  location: ObserverLocation | null;
  selectedPass: Pass | null;
  setSelectedPass: React.Dispatch<React.SetStateAction<Pass | null>>;
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
    <div className="lg:sticky lg:top-0 lg:max-h-[calc(100svh-4rem-1rem)] lg:overflow-auto">
      {selectedPass && (
        <div className="rounded-md border-2 p-4 pt-2">
          <div className="flex items-center justify-between pb-2">
            <span className="text-lg">{selectedPass.objectName}</span>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setSelectedPass(null)}
            >
              <X />
            </Button>
          </div>
          <div className="grid gap-2">
            <Field title="Date">
              {new Date(selectedPass.startingTime).toLocaleDateString()}
            </Field>
            <Field title="Start Time">
              {new Date(selectedPass.startingTime).toLocaleTimeString()}
            </Field>
            <Field title="End Time">
              {new Date(selectedPass.endingTime).toLocaleTimeString()}
            </Field>
            <Field title="Start Direction">
              <DegreesToDirectionIcon degrees={selectedPass.startDirection} />
              {degreesToDirection(selectedPass.startDirection)} (
              {Math.floor(selectedPass.startDirection)})°
            </Field>
            <Field title="End Direction">
              <DegreesToDirectionIcon degrees={selectedPass.endDirection} />
              {degreesToDirection(selectedPass.endDirection)} (
              {Math.floor(selectedPass.endDirection)})°
            </Field>
            <Field title="Start Elevation">
              {selectedPass.startElevation.toFixed(1)}°
            </Field>
            <Field title="End Elevation">
              {selectedPass.endElevation.toFixed(1)}°
            </Field>
            <Field title="Max Elevation">
              {selectedPass.maxElevation.toFixed(1)}°
            </Field>
            <Field title="Magnitude">{selectedPass.magnitude}</Field>
          </div>
        </div>
      )}
      <div
        className={cn("mt-0 rounded-md border-2 p-4 transition-[margin]", {
          "mt-4": selectedPass != null,
        })}
      >
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
              <Field title="Latitude">
                {formatCoord(stateVectorQuery.data.geodetic.position.latitude)}°
              </Field>
              <Field title="Longitude">
                {formatCoord(stateVectorQuery.data.geodetic.position.longitude)}
                °
              </Field>
              <Field title="Altitude">
                {stateVectorQuery.data.geodetic.position.height.toFixed(2)} km
              </Field>
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
                <Field title="Sunrise">
                  {new Date(sunTimeQuery.data.sunrise).toLocaleTimeString()}
                </Field>
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
    </div>
  );
}

function Field({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <span>{title}</span>
      <span className="font-mono">{children}</span>
    </div>
  );
}

function DegreesToDirectionIcon({
  degrees,
  ...props
}: { degrees: number } & React.ComponentProps<typeof Navigation>) {
  // Normalize degrees to the range [0, 360)
  const normalized = ((degrees % 360) + 360) % 360;

  // Calculate index (16 points = 22.5° per segment)
  const index = Math.round(normalized / 22.5) % 16;
  const rotation = index * 22.5;

  return (
    <ArrowUp
      className="mr-1 inline-block"
      {...props}
      style={{
        transform: `rotate(${rotation}deg)`,
        transformOrigin: "center",
        transition: "transform 0.3s ease",
        ...props.style,
      }}
    />
  );
}
