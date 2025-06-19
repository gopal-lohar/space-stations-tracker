import { ChooseLocation } from "@/components/ChooseLocation";
import type { ObserverLocation } from "@/lib/core/types";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

export default function PassesSection({
  location,
  setLocation,
}: {
  location: ObserverLocation | null;
  setLocation: (value: ObserverLocation | null) => void;
}) {
  return (
    <div>
      {location == null ? (
        <ChooseLocation setLocation={setLocation} />
      ) : (
        <Passes location={location} setLocation={setLocation} />
      )}
    </div>
  );
}

function Passes({
  location,
  setLocation,
}: {
  location: ObserverLocation | null;
  setLocation: (value: ObserverLocation | null) => void;
}) {
  const [things, setThings] = useState([1]);
  useEffect(() => {
    const t: number[] = [];
    for (let j = 0; j < 100; j++) {
      t.push(Math.random());
    }
    setThings(t);
  }, []);
  return (
    <div>
      <Button onClick={() => setLocation(null)}>Reset Location</Button>
      <div>
        <code>{JSON.stringify(location, null, 2)}</code>
      </div>
      {things.map((thing, i) => (
        <div key={i} className="mb-2 border-2 p-4">
          {i}. {thing}
        </div>
      ))}
    </div>
  );
}
