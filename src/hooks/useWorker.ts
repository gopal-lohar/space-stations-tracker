import { useEffect, useRef, useState } from "react";

export function useMathWorker() {
  const [isCalculating, setIsCalculating] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../workers/math.worker.ts", import.meta.url),
      { type: "module" }
    );

    return () => workerRef.current?.terminate();
  }, []);

  const addNumbers = async (a: number, b: number): Promise<number> => {
    if (!workerRef.current) throw new Error("Worker not ready");

    setIsCalculating(true);

    return new Promise((resolve, reject) => {
      const id = crypto.randomUUID();

      workerRef.current!.onmessage = (event) => {
        if (event.data.id === id) {
          setIsCalculating(false);
          if (event.data.type === "RESULT") {
            resolve(event.data.payload.result);
          } else {
            reject(new Error(event.data.payload.error));
          }
        }
      };

      workerRef.current!.postMessage({
        id,
        type: "ADD_NUMBERS",
        payload: { a, b },
      });
    });
  };

  return { addNumbers, isCalculating };
}
