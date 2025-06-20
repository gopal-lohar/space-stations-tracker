import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { satellites, type Satellite } from "@/lib/const";

export default function Navbar({
  satellite,
  setSatellite,
}: {
  satellite: Satellite;
  setSatellite: (value: Satellite) => void;
}) {
  return (
    <nav className="bg-card sticky top-0 z-30 col-span-full h-16 px-2">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
        <div className="flex flex-col items-center opacity-75">
          <span className="text-xl">Look at that!</span>
          <span className="text-sm">it's a Space Station</span>
        </div>
        <Select
          defaultValue={satellite.noradId.toString()}
          onValueChange={(newId) => {
            const sat = satellites.find(
              (val) => val.noradId.toString() == newId
            );
            if (sat) {
              setSatellite(sat);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Object" />
          </SelectTrigger>
          <SelectContent>
            {satellites.map((sat) => {
              return (
                <SelectItem
                  value={sat.noradId.toString()}
                  key={sat.noradId.toString()}
                >
                  {sat.shortName}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </nav>
  );
}
