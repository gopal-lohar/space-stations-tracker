import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Satellite } from "@/lib/const";
import { LOCAL_SATELLITE_KEY, satellites } from "@/lib/const";
import Navbar from "./components/Navbar";

export default function App() {
  const [satellite, setSatellite] = useLocalStorage<Satellite>(
    LOCAL_SATELLITE_KEY,
    satellites[0]
  );
  return (
    <>
      <Navbar satellite={satellite} setSatellite={setSatellite} />
    </>
  );
}
