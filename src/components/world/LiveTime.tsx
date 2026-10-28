"use client";
import { useEffect, useState } from "react";

/** Manizales time, never the visitor's: the zone is fixed to America/Bogota. Exported for tests. */
export const formatManizales = (d: Date = new Date()) => new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Bogota" }).format(d);

/** Manizales local time (UTC-5, no daylight saving). Renders a fixed-width placeholder until mounted so nothing shifts. */
export function LiveTime({ label }: { label?: string }) {
  const [time, setTime] = useState("--:--");
  useEffect(() => {
    const tick = () => setTime(formatManizales());
    tick();
    const id = window.setInterval(tick, 20000);
    return () => window.clearInterval(id);
  }, []);
  return <time className="live-time" title={label} aria-label={label} suppressHydrationWarning>{time}</time>;
}
