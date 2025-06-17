export function formatTime(date: Date, timezone: string = "UTC"): string {
  const istDate = new Date(date);

  // Format the date and time
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: timezone,
  };

  return (
    new Intl.DateTimeFormat("en-IN", options).format(istDate) + " " + timezone
  );
}

// Constants
export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
