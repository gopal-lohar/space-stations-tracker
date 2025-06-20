import { ChooseLocation } from "@/components/ChooseLocation";
import { useCoreWorker } from "@/hooks/useCoreWorker";
import { useTleQuery } from "@/hooks/useTleQuery";
import type { Satellite } from "@/lib/const";
import { DAY, SECOND } from "@/lib/core/helpers/utils";
import type { ObserverLocation, Pass, Tle } from "@/lib/core/types";
import { useQuery } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { Button } from "./ui/button";

export default function PassesSection({
  location,
  setLocation,
  satellite,
}: {
  location: ObserverLocation | null;
  setLocation: (value: ObserverLocation | null) => void;
  satellite: Satellite;
}) {
  const tleQuery = useTleQuery(satellite.noradId);
  return (
    <div>
      {location == null ? (
        <ChooseLocation setLocation={setLocation} />
      ) : tleQuery.isLoading ? (
        "Fetching TLE..."
      ) : tleQuery.isError ? (
        "Failed Fetching TLE"
      ) : (
        tleQuery.data && (
          <Passes
            location={location}
            setLocation={setLocation}
            tle={tleQuery.data}
            satellite={satellite}
          />
        )
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
}: {
  location: ObserverLocation | null;
  setLocation: (value: ObserverLocation | null) => void;
  tle: Tle;
  satellite: Satellite;
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
    },
    enabled: isReady && !!location,
  });

  return (
    <div>
      <div className="flex items-center justify-between border-b-2 pb-2">
        <span className="text-xl">{satellite.longName}</span>
        <Button variant="secondary" onClick={() => setLocation(null)}>
          Reset Location
        </Button>
      </div>
      <div>
        <div className="space-y-2 py-4">
          {passesQuery.isLoading
            ? "Calculating passes"
            : passesQuery.isError
              ? "Error while calculating"
              : passesQuery.data
                ? passesQuery.data.map((dayPass, index) => (
                    <DayPasses dayPasses={dayPass} key={index} />
                  ))
                : ""}
        </div>
      </div>
    </div>
  );
}

function DayPasses({ dayPasses }: { dayPasses: DayPass }) {
  return (
    <div>
      <div className="p-1 text-sm">{dayPasses.date}</div>
      <div className="space-y-2">
        {dayPasses.passes.map((pass, index) => (
          <Pass pass={pass} key={index} />
        ))}
      </div>
    </div>
  );
}

function Pass({ pass }: { pass: Pass }) {
  return (
    <div className="focus-within:border-primary flex gap-2 rounded-md border-2 px-3 py-4">
      <div className="flex flex-col">
        <span>{pass.objectName}</span>
        <span>{pass.magnitude}</span>
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
        <Button variant="ghost">
          <Info />
        </Button>
      </div>
    </div>
  );
}

function degreesToDirection(degrees: number) {
  // Normalize degrees to the range [0, 360)
  const normalized = ((degrees % 360) + 360) % 360;

  // clockwise order
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];

  // Calculate index (16 points = 22.5° per segment)
  const index = Math.round(normalized / 22.5) % 16;

  return directions[index];
}
