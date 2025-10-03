import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistanceToNow(
  date: Date,
  options?: Intl.RelativeTimeFormatOptions
) {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [unit, value] of Object.entries(intervals)) {
    if (seconds >= value || unit === "second") {
      const delta = Math.floor(seconds / value);
      return new Intl.RelativeTimeFormat("en", options).format(
        -delta,
        unit as Intl.RelativeTimeFormatUnit
      );
    }
  }

  return "";
}
