import { expose } from "comlink";

// Your complex calculation functions
const mathOperations = {
  async addNumbers(a: number, b: number): Promise<number> {
    // Simulate heavy computation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log(`Worker: Adding ${a} + ${b}`);
    return a + b;
  },

  async multiplyNumbers(a: number, b: number): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return a * b;
  },

  async complexCalculation(
    numbers: number[]
  ): Promise<{ sum: number; average: number }> {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const average = sum / numbers.length;

    return { sum, average };
  },
};

// Expose the API to the main thread
expose(mathOperations);

// Export type for TypeScript
export type MathWorkerAPI = typeof mathOperations;
