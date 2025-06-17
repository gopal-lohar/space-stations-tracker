export const DATA_DIR = "./data";
import fs from "fs/promises";

export async function getDataFromDataDir<T>(
  filename: string
): Promise<T | null> {
  const filePath = `${DATA_DIR}/${filename}`;
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function ensureDataDirExists(): Promise<boolean> {
  let error = false;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    error = true;
  }
  return error || true;
}
