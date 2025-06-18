import type { CoreWorkerAPI } from "@/workers/core.worker";
import type { Remote } from "comlink";
import { wrap } from "comlink";
import { useEffect, useRef, useState } from "react";

export function useCoreWorker() {
  const workerRef = useRef<Worker | null>(null);
  const apiRef = useRef<Remote<CoreWorkerAPI> | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Create worker
    workerRef.current = new Worker(
      new URL("@/workers/core.worker.ts", import.meta.url),
      { type: "module" }
    );

    // Wrap with Comlink
    apiRef.current = wrap<CoreWorkerAPI>(workerRef.current);
    setIsReady(true);

    // Cleanup
    return () => {
      workerRef.current?.terminate();
      setIsReady(false);
    };
  }, []);

  return {
    api: apiRef.current,
    isReady,
  };
}
