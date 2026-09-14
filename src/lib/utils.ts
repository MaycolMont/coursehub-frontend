import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "hace un momento";
  if (diffMin < 60) return `hace ${diffMin} min`;
  if (diffHour < 24) return `hace ${diffHour}h`;
  if (diffDay < 7) return `hace ${diffDay}d`;
  if (diffWeek < 4) return `hace ${diffWeek} sem`;
  if (diffMonth < 12) return `hace ${diffMonth} mes${diffMonth > 1 ? "es" : ""}`;
  return `hace ${diffYear} año${diffYear > 1 ? "s" : ""}`;
}

export function formatNumber(count: number): string {
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1)}K`;
  }
  return count.toString();
}

type ErrorBody = string | string[] | Record<string, unknown>;

function bodyToMessage(body: ErrorBody, fallback: string): string {
  if (typeof body === "string") return body;
  if (Array.isArray(body)) {
    return body.length > 0 ? String(body[0]) : fallback;
  }
  if (body && typeof body === "object") {
    const detail = (body as Record<string, unknown>)["detail"];
    if (typeof detail === "string") return detail;

    const firstKey = Object.keys(body)[0];
    if (firstKey) {
      const first = body[firstKey];
      if (typeof first === "string") return first;
      if (Array.isArray(first) && first.length > 0) return String(first[0]);
    }
  }
  return fallback;
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: ErrorBody } })?.response?.data;
  if (data !== undefined && data !== null) {
    return bodyToMessage(data, fallback);
  }
  return fallback;
}

