interface WorkerMessage {
  id: string;
  type: "ADD_NUMBERS";
  payload: { a: number; b: number };
}

export interface WorkerResponse {
  id: string;
  type: "RESULT" | "ERROR";
  payload: { result: number } | { error: string };
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data;

  try {
    if (type === "ADD_NUMBERS") {
      // Simulate heavy computation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const result = payload.a + payload.b;

      self.postMessage({
        id,
        type: "RESULT",
        payload: { result },
      });
    }
  } catch (error) {
    self.postMessage({
      id,
      type: "ERROR",
      payload: { error: `Addition failed, Error: ${error}` },
    });
  }
};
