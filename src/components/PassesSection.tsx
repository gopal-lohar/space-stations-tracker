import { ChooseLocation } from "@/components/ChooseLocation";
import { useCoreWorker } from "@/hooks/useCoreWorker";
import { useTleQuery } from "@/hooks/useTleQuery";
import type { Satellite } from "@/lib/const";
import { DAY, SECOND } from "@/lib/core/helpers/utils";
import type { ObserverLocation, Pass, Tle } from "@/lib/core/types";
import { cn, degreesToDirection } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Info, Telescope } from "lucide-react";
import { useEffect } from "react";
import { QueryHandler } from "./QueryHandler";
import { Button } from "./ui/button";

export default function PassesSection({
  location,
  setLocation,
  satellite,
  selectedPass,
  setSelectedPass,
}: {
  location: ObserverLocation | null;
  setLocation: (value: ObserverLocation | null) => void;
  satellite: Satellite;
  selectedPass: Pass | null;
  setSelectedPass: React.Dispatch<React.SetStateAction<Pass | null>>;
}) {
  const tleQuery = useTleQuery(satellite.noradId);
  return (
    <div>
      {location == null ? (
        <ChooseLocation setLocation={setLocation} />
      ) : (
        <QueryHandler query={tleQuery}>
          {(tle) => {
            return (
              <Passes
                location={location}
                setLocation={setLocation}
                tle={tle}
                satellite={satellite}
                selectedPass={selectedPass}
                setSelectedPass={setSelectedPass}
              />
            );
          }}
        </QueryHandler>
      )}
    </div>
  );
}

type DayPass = { date: string; passes: Pass[] };

function Passes({
  location,
  setLocation,
  tle,
  satellite,
  selectedPass,
  setSelectedPass,
}: {
  location: ObserverLocation | null;
  setLocation: (value: ObserverLocation | null) => void;
  tle: Tle;
  satellite: Satellite;
  selectedPass: Pass | null;
  setSelectedPass: React.Dispatch<React.SetStateAction<Pass | null>>;
}) {
  const { api, isReady } = useCoreWorker();

  const period = DAY * 30;
  const delta = SECOND * 30;
  const startTime = new Date(new Date().toDateString());
  const endTime = new Date(startTime.getTime() + period);

  const passesQuery = useQuery({
    queryKey: ["passes", location, satellite, tle],
    queryFn: async () => {
      if (location) {
        if (!api) {
          if (isReady) {
            throw new Error("Something went wrong when loading worker thread");
          } else {
            throw new Error("Worker thread not loaded yet");
          }
        } else {
          const data = await api!.computePasses({
            tle,
            startTime,
            endTime,
            delta,
            observerLocation: location,
            objectName: `${satellite.shortName} (${satellite.module})`,
          });

          const passes: DayPass[] = [];
          let dayPass: DayPass | null = null;
          for (const pass of data) {
            const date = new Date(pass.startingTime).toLocaleDateString();
            if (dayPass === null) {
              dayPass = {
                date,
                passes: [pass],
              };
            } else {
              if (date === dayPass.date) {
                dayPass.passes.push(pass);
              } else {
                passes.push(dayPass);
                dayPass = {
                  date,
                  passes: [pass],
                };
              }
            }
          }
          if (dayPass !== null) {
            passes.push(dayPass);
          }
          return passes;
        }
      } else {
        throw new Error("Location not found");
      }
    },
    enabled: isReady && !!location,
  });

  useEffect(() => {
    if (selectedPass) {
      const passStillExist =
        passesQuery.data &&
        passesQuery.data.some((dayPass) =>
          dayPass.passes.some((pass) => pass.id === selectedPass.id)
        );
      if (!passStillExist) {
        setSelectedPass(null);
      }
    }
  }, [passesQuery.data, setSelectedPass, selectedPass]);

  return (
    <div className="py-3">
      <div className="flex items-center justify-between">
        <span className="text-xl">{satellite.longName}</span>
        <Button variant="secondary" onClick={() => setLocation(null)}>
          Reset Location
        </Button>
      </div>
      <div>
        <div className="space-y-2 py-1">
          <QueryHandler query={passesQuery}>
            {(passes) =>
              passes.map((dayPass, index) => (
                <DayPasses
                  dayPasses={dayPass}
                  key={index}
                  selectedPass={selectedPass}
                  setSelectedPass={setSelectedPass}
                />
              ))
            }
          </QueryHandler>
        </div>
      </div>
    </div>
  );
}

function DayPasses({
  dayPasses,
  selectedPass,
  setSelectedPass,
}: {
  dayPasses: DayPass;
  selectedPass: Pass | null;
  setSelectedPass: React.Dispatch<React.SetStateAction<Pass | null>>;
}) {
  return (
    <div>
      <div className="p-1 text-sm">{dayPasses.date}</div>
      <div className="space-y-2">
        {dayPasses.passes.map((pass, index) => (
          <Pass
            pass={pass}
            key={index}
            selectedPass={selectedPass}
            setSelectedPass={setSelectedPass}
          />
        ))}
      </div>
    </div>
  );
}

function Pass({
  pass,
  selectedPass,
  setSelectedPass,
}: {
  pass: Pass;
  selectedPass: Pass | null;
  setSelectedPass: React.Dispatch<React.SetStateAction<Pass | null>>;
}) {
  return (
    <div
      className={cn(
        "bg-background/5 flex gap-2 rounded-md border px-3 py-4 backdrop-blur-xs",
        {
          "border-primary": selectedPass != null && selectedPass.id === pass.id,
        }
      )}
    >
      <div className="flex flex-col">
        <span>{pass.objectName}</span>
        <span className="flex items-center gap-1">
          <Telescope className="size-4" /> {Math.round(pass.maxElevation)}°
        </span>
      </div>
      <div className="ml-auto flex flex-col">
        <span>{new Date(pass.startingTime).toLocaleTimeString()}</span>
        <span>{new Date(pass.endingTime).toLocaleTimeString()}</span>
      </div>
      <div className="flex flex-col items-center">
        <span>
          {degreesToDirection(pass.startDirection)} (
          {Math.floor(pass.startDirection)}°)
        </span>
        <span>
          {degreesToDirection(pass.endDirection)} (
          {Math.floor(pass.endDirection)}°)
        </span>
      </div>
      <div className="flex items-center">
        <Button
          className="rounded-full"
          variant="ghost"
          size="icon"
          onClick={() => setSelectedPass(pass)}
          asChild
        >
          <a href="#satelliteInfo">
            <Info />
          </a>
        </Button>
      </div>
    </div>
  );
}
