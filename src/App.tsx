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
import type { ObserverLocation } from "@/lib/core/types";

export default function App() {
  const [satellite, setSatellite] = useLocalStorage<Satellite>(
    LOCAL_SATELLITE_KEY,
    satellites[0]
  );
  const [location, setLocation] = useLocalStorage<ObserverLocation | null>(
    LOCAL_LOCATION_KEY,
    null
  );

  return (
    <div className="h-svh">
      <Navbar satellite={satellite} setSatellite={setSatellite} />
      <div className="grid-col-1 grid h-[calc(100%_-_4rem)] items-start justify-center gap-4 overflow-y-auto p-4 lg:grid-cols-[24rem_minmax(0,55rem)]">
        <SatelliteInfo location={location} satellite={satellite} />
        <PassesSection location={location} setLocation={setLocation} />
      </div>
    </div>
  );
}
