import { useCoreWorker } from "@/hooks/useCoreWorker";
import { useTleQuery } from "@/hooks/useTleQuery";
import type { Satellite } from "@/lib/const";
import { calculateLookAngles, type LookAngles } from "@/lib/core";
import { SECOND } from "@/lib/core/helpers/utils";
import type {
  ObserverLocation,
  Pass,
  StateVector,
  Tle,
} from "@/lib/core/types";
import { cn, degreesToDirection } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { ArrowUp, Navigation, X } from "lucide-react";
import type { ReactNode } from "react";
import { QueryHandler } from "./QueryHandler";
import {
  PointOnMap,
  PulsingPointOnMap,
  SatellitePath,
  WorldMap,
} from "./WorldMap";
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
        if (!api) {
          if (isReady) {
            throw new Error("Something went wrong when loading worker thread");
          } else {
            throw new Error("Worker thread not loaded yet");
          }
        } else {
          return api.calculateStateVector(new Date(), tleQuery.data);
        }
      } else {
        throw new Error("No tle data found");
      }
    },
    enabled: isReady && !!tleQuery.data,
    refetchInterval: SECOND,
  });

  const sunTimeQuery = useQuery({
    queryKey: ["sun_time", location],
    queryFn: () => {
      if (location) {
        if (!api) {
          if (isReady) {
            throw new Error("Something went wrong when loading worker thread");
          } else {
            throw new Error("Worker thread not loaded yet");
          }
        } else {
          return api.getSunTimes(
            location.latitude,
            location.longitude,
            new Date()
          );
        }
      } else {
        throw new Error("Location not detected");
      }
    },
    enabled: isReady && !!location,
  });

  const satellitePathQuery = useQuery({
    queryKey: ["satellite_path"],
    queryFn: async () => {
      if (tleQuery.data) {
        if (!api) {
          if (isReady) {
            throw new Error("Something went wrong when loading worker thread");
          } else {
            throw new Error("Worker thread not loaded yet");
          }
        } else {
          const data = await api.calculateCurrentOrbitPath(
            tleQuery.data,
            new Date()
          );
          if (data.length < 2) {
            throw new Error("Invalid data");
          } else {
            return {
              startTime: data[0].time,
              endTime: data[data.length - 1].time,
              path: data.map((point) => ({
                latitude: point.stateVector.geodetic.position.latitude,
                longitude: point.stateVector.geodetic.position.longitude,
              })),
            };
          }
        }
      } else {
        throw new Error("No tle data found");
      }
    },
    enabled: isReady && !!tleQuery.data,
  });

  const formatCoord = (val: number) =>
    val >= 0 ? `+${val.toFixed(4)}` : val.toFixed(4);

  return (
    <div
      className="lg:sticky lg:top-0 lg:max-h-[calc(100svh-4rem-1rem)] lg:overflow-auto"
      id="satelliteInfo"
    >
      {selectedPass && location && tleQuery.data && stateVectorQuery.data ? (
        <SelectedPass
          selectedPass={selectedPass}
          setSelectedPass={setSelectedPass}
          location={location}
          tle={tleQuery.data}
          stateVector={stateVectorQuery.data}
        />
      ) : (
        ""
      )}
      <div
        className={cn("mt-0 rounded-md border p-4 transition-[margin]", {
          "mt-4": selectedPass != null,
        })}
      >
        <div className="relative -m-4 overflow-hidden">
          <WorldMap>
            {satellitePathQuery.data && (
              <SatellitePath path={satellitePathQuery.data.path} />
            )}
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
              <PulsingPointOnMap
                point={{
                  latitude: stateVectorQuery.data.geodetic.position.latitude,
                  longitude: stateVectorQuery.data.geodetic.position.longitude,
                }}
              />
            )}
          </WorldMap>
        </div>
        <div className="space-y-4 py-4">
          <QueryHandler query={stateVectorQuery}>
            {(data) => (
              <div className="grid gap-1">
                <span className="text-center text-lg">
                  {satellite.longName}
                </span>
                <Field title="Latitude">
                  {formatCoord(data.geodetic.position.latitude)}°
                </Field>
                <Field title="Longitude">
                  {formatCoord(data.geodetic.position.longitude)}°
                </Field>
                <Field title="Altitude">
                  {data.geodetic.position.height.toFixed(2)} km
                </Field>
              </div>
            )}
          </QueryHandler>
          {location != null && (
            <QueryHandler query={sunTimeQuery}>
              {(data) => (
                <div className="grid gap-1">
                  <Field title="Sunrise">
                    {new Date(data.sunrise).toLocaleTimeString()}
                  </Field>
                  <div className="flex justify-between gap-2">
                    <span>Solarnoon</span>
                    <span className="font-mono">
                      {new Date(data.solarNoon).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span>Sunset</span>
                    <span className="font-mono">
                      {new Date(data.sunset).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}
            </QueryHandler>
          )}
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

function SelectedPass({
  selectedPass,
  setSelectedPass,
  location,
  tle,
  stateVector,
}: {
  selectedPass: Pass;
  setSelectedPass: React.Dispatch<React.SetStateAction<Pass | null>>;
  location: ObserverLocation;
  tle: Tle;
  stateVector: StateVector;
}) {
  const { api, isReady } = useCoreWorker();

  const lookAnglesRangeQuery = useQuery({
    queryKey: ["look_angles_range", selectedPass],
    queryFn: () => {
      if (!api) {
        if (isReady) {
          throw new Error("Something went wrong when loading worker thread");
        } else {
          throw new Error("Worker thread not loaded yet");
        }
      } else {
        return api.calculateLookAnglesRange(
          location,
          tle,
          new Date(selectedPass.startingTime),
          new Date(selectedPass.endingTime),
          5
        );
      }
    },
    enabled: isReady,
  });
  return (
    <div className="rounded-md border p-4 pt-2">
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

      <SkyMap
        lookAnglesRange={lookAnglesRangeQuery.data}
        currentPosition={{
          ...calculateLookAngles(stateVector, location).lookAnglesInDegrees,
          isVisible:
            new Date().getTime() >=
              new Date(selectedPass.startingTime).getTime() &&
            new Date().getTime() <= new Date(selectedPass.endingTime).getTime(),
        }}
      />

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

interface LookAngle {
  lookAngles: LookAngles;
  time: Date;
}

function SkyMap({
  lookAnglesRange,
  currentPosition = null,
}: {
  lookAnglesRange: LookAngle[] | undefined;
  currentPosition?: {
    azimuth: number;
    elevation: number;
    isVisible: boolean;
  } | null;
}) {
  // Convert azimuth/elevation to x,y coordinates on the sky dome

  // Get current ISS position if provided
  const getCurrentISSPosition = () => {
    if (!currentPosition || !currentPosition.isVisible) return null;

    const { x, y } = skyToCartesian(
      currentPosition.azimuth,
      currentPosition.elevation
    );
    return { x: 250 + x, y: 250 + y };
  };

  const currentISSPos = getCurrentISSPosition();

  return (
    <div className="flex justify-center p-4">
      <svg
        viewBox="0 0 500 500"
        width="100%"
        height="100%"
        className="bg-background/5 rounded-full border border-gray-600 backdrop-blur-sm"
      >
        {/* Horizon circle */}
        <circle
          cx="250"
          cy="250"
          r="200"
          fill="none"
          stroke="#4a5568"
          strokeWidth="2"
        />

        {/* Elevation circles */}
        <circle
          cx="250"
          cy="250"
          r="150"
          fill="none"
          stroke="#4a5568"
          strokeWidth="1"
          opacity="0.3"
        />
        <circle
          cx="250"
          cy="250"
          r="100"
          fill="none"
          stroke="#4a5568"
          strokeWidth="1"
          opacity="0.3"
        />
        <circle
          cx="250"
          cy="250"
          r="50"
          fill="none"
          stroke="#4a5568"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Cardinal directions */}
        <text
          x="250"
          y="40"
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
        >
          N
        </text>
        <text
          x="460"
          y="255"
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
        >
          E
        </text>
        <text
          x="250"
          y="470"
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
        >
          S
        </text>
        <text
          x="40"
          y="255"
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
        >
          W
        </text>

        {/* Elevation labels */}
        <text x="270" y="255" fill="white" fontSize="10" opacity="0.7">
          90°
        </text>
        <text x="320" y="255" fill="white" fontSize="10" opacity="0.7">
          60°
        </text>
        <text x="370" y="255" fill="white" fontSize="10" opacity="0.7">
          30°
        </text>
        <text x="420" y="255" fill="white" fontSize="10" opacity="0.7">
          0°
        </text>

        {/* Smooth Satellite Path */}
        {lookAnglesRange ? (
          <SatellitePathInSky lookAnglesRange={lookAnglesRange} />
        ) : (
          ""
        )}

        {/* Current ISS Position (independent of path) */}
        {currentISSPos && (
          <g>
            <circle
              cx={currentISSPos.x}
              cy={currentISSPos.y}
              r="8"
              fill="#ff4444"
              stroke="white"
              strokeWidth="2"
            />
            {/* Pulsing animation around current position */}
            <circle
              cx={currentISSPos.x}
              cy={currentISSPos.y}
              r="15"
              fill="none"
              stroke="#ff4444"
              strokeWidth="2"
              opacity="0.6"
            >
              <animate
                attributeName="r"
                values="15;25;15"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0.1;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}
      </svg>
    </div>
  );
}

function SatellitePathInSky({
  lookAnglesRange,
}: {
  lookAnglesRange: LookAngle[];
}) {
  const generateSmoothPath = (data: LookAngle[]) => {
    const visibleData = data.filter(
      (d) => d.lookAngles.isSatelliteAboveHorizon
    );
    if (visibleData.length < 2) return "";

    const points = visibleData.map((point) => {
      const { x, y } = skyToCartesian(
        point.lookAngles.lookAnglesInDegrees.azimuth,
        point.lookAngles.lookAnglesInDegrees.elevation
      );
      return { x: 250 + x, y: 250 + y };
    });

    let pathData = `M ${points[0].x} ${points[0].y}`;

    // Create smooth curves between points
    for (let i = 1; i < points.length; i++) {
      if (i === 1) {
        // First curve - use quadratic
        const midX = (points[0].x + points[1].x) / 2;
        const midY = (points[0].y + points[1].y) / 2;
        pathData += ` Q ${midX} ${midY} ${points[1].x} ${points[1].y}`;
      } else {
        // Use cubic Bezier for smooth transitions
        const prev = points[i - 2];
        const curr = points[i - 1];
        const next = points[i];

        // Calculate control points for smooth curve
        const cp1x = curr.x + (next.x - prev.x) * 0.15;
        const cp1y = curr.y + (next.y - prev.y) * 0.15;
        const cp2x = next.x - (next.x - curr.x) * 0.15;
        const cp2y = next.y - (next.y - curr.y) * 0.15;

        pathData += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${next.x} ${next.y}`;
      }
    }

    return pathData;
  };
  return (
    <path
      d={generateSmoothPath(lookAnglesRange)}
      fill="none"
      stroke="#ffd700"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.8"
    />
  );
}

function skyToCartesian(
  azimuth: number,
  elevation: number,
  radius: number = 200
) {
  const azRad = (azimuth * Math.PI) / 180;
  // const elRad = (elevation * Math.PI) / 180;

  // Project onto 2D circle (0° elevation = edge, 90° elevation = center)
  const projRadius = radius * (1 - elevation / 90);

  // Azimuth: 0° = North (top), 90° = East (right), 180° = South (bottom), 270° = West (left)
  const x = projRadius * Math.sin(azRad);
  const y = -projRadius * Math.cos(azRad);

  return { x, y };
}
