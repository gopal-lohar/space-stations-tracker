import Navbar from "@/components/Navbar";
import PassesSection from "@/components/PassesSection";
import SatelliteInfo from "@/components/SatelliteInfo";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Satellite } from "@/lib/const";
import {
  LOCAL_LOCATION_KEY,
  LOCAL_SATELLITE_KEY,
  satellites,
} from "@/lib/const";
import type { ObserverLocation, Pass } from "@/lib/core/types";
import { useState } from "react";
import StarfieldBackground from "./components/StarfieldBackground";

export default function App() {
  const [satellite, setSatellite] = useLocalStorage<Satellite>(
    LOCAL_SATELLITE_KEY,
    satellites[0]
  );
  const [location, setLocation] = useLocalStorage<ObserverLocation | null>(
    LOCAL_LOCATION_KEY,
    null
  );
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
  const [dropOnMap, setDropOnMap] = useState<{
    dropping: boolean;
    location: ObserverLocation;
  }>({
    dropping: false,
    // default to delhi
    location: { elevation: 0, latitude: 28.6139, longitude: 77.209 },
  });

  return (
    <div className="h-svh">
      <StarfieldBackground />
      <Navbar satellite={satellite} setSatellite={setSatellite} />
      {/* removed 0.75rem of gap from the width (total max width width 80rem) */}
      <div className="grid w-full gap-3 overflow-y-auto px-1 lg:h-[calc(100%_-_4rem)] lg:grid-cols-[32rem_minmax(0,47.25rem)] lg:items-start lg:justify-center">
        <SatelliteInfo
          location={location}
          satellite={satellite}
          selectedPass={selectedPass}
          setSelectedPass={setSelectedPass}
          dropOnMap={dropOnMap}
          setDropOnMap={setDropOnMap}
        />
        <PassesSection
          location={location}
          setLocation={setLocation}
          satellite={satellite}
          selectedPass={selectedPass}
          setSelectedPass={setSelectedPass}
          dropOnMap={dropOnMap}
          setDropOnMap={setDropOnMap}
        />
      </div>
    </div>
  );
}
