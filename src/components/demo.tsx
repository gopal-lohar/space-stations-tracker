import { Button } from "@/components/ui/button";
import { useCoreWorker } from "@/hooks/useCoreWorker";
import { useTheme } from "@/hooks/useTheme";
import { useTleQuery } from "@/hooks/useTleQuery";
import { satelliteIds } from "@/lib/core/getTle";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function Demo() {
  const { setTheme } = useTheme();
  const [dark, setDark] = useState(false);
  return (
    <div className="bg-background text-foreground flex h-svh w-full items-center justify-center gap-4 pb-4">
      Look at that - It's a Space Station{" "}
      <Button
        onClick={() => {
          if (dark) {
            setTheme("light");
          } else {
            setTheme("dark");
          }
          setDark((dark) => !dark);
        }}
      >
        Click Here
      </Button>
      <StateVectorISS noradId={satelliteIds.iss} />
    </div>
  );
}

function StateVectorISS({ noradId }: { noradId: number }) {
  const tleQuery = useTleQuery(noradId);
  const { api, isReady } = useCoreWorker();
  const stateVectorQuery = useQuery({
    queryKey: ["state_vector", noradId],
    queryFn: () => {
      if (tleQuery.data) {
        console.time("calculate_state_vector");
        const data = api!.calculateStateVector(new Date(), tleQuery.data);
        console.timeEnd("calculate_state_vector");
        return data;
      }
    },
    enabled: isReady && !!tleQuery.data,
  });

  return tleQuery.isLoading ? (
    "Loading..."
  ) : tleQuery.isError ? (
    "Error..."
  ) : (
    <div>{JSON.stringify(stateVectorQuery.data)}</div>
  );
}
