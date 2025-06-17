import { useMathWorker } from "@/hooks/useMathWorker";
import { useState } from "react";

export function Calculator() {
  const { api, isReady } = useMathWorker();
  const [result, setResult] = useState<number | null>(null);
  const [complexResult, setComplexResult] = useState<{
    sum: number;
    average: number;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleAdd = async () => {
    if (!api) return;

    setIsCalculating(true);
    try {
      const sum = await api.addNumbers(15, 25);
      setResult(sum);
      console.log("Addition result:", sum);
    } catch (error) {
      console.error("Addition failed:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleComplexCalculation = async () => {
    if (!api) return;

    setIsCalculating(true);
    try {
      const result = await api.complexCalculation([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ]);
      setComplexResult(result);
      console.log("Complex calculation result:", result);
    } catch (error) {
      console.error("Complex calculation failed:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  if (!isReady) {
    return <div>Loading worker...</div>;
  }

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Web Worker Calculator</h2>

      <div className="space-y-2">
        <button
          onClick={handleAdd}
          disabled={isCalculating}
          className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {isCalculating ? "Calculating..." : "Add 15 + 25"}
        </button>

        {result !== null && (
          <p className="text-green-600">Addition Result: {result}</p>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={handleComplexCalculation}
          disabled={isCalculating}
          className="rounded bg-purple-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {isCalculating ? "Calculating..." : "Complex Calculation (1-10)"}
        </button>

        {complexResult && (
          <div className="text-green-600">
            <p>Sum: {complexResult.sum}</p>
            <p>Average: {complexResult.average}</p>
          </div>
        )}
      </div>
    </div>
  );
}
