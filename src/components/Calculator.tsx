import { useMathWorker } from "@/hooks/useWorker";
import { useState } from "react";

export function Calculator() {
  const { addNumbers, isCalculating } = useMathWorker();
  const [result, setResult] = useState<number | null>(null);

  const handleAdd = async () => {
    try {
      const sum = await addNumbers(5, 3);
      setResult(sum);
    } catch (error) {
      console.error("Failed:", error);
    }
  };

  return (
    <div>
      <button onClick={handleAdd} disabled={isCalculating}>
        {isCalculating ? "Calculating..." : "Add 5 + 3"}
      </button>
      {result && <span> Result: {result}</span>}
    </div>
  );
}
