"use client";
import { useEffect, useState } from "react";
import { places } from "@/data/places";
import { readVisited } from "@/lib/visited";

/** "n / 6" places visited (localStorage, wrapped by readVisited). */
export function Visited() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const read = () => setN(readVisited().filter((v) => places.some((p) => p.id === v)).length);
    read();
    window.addEventListener("visited:change", read);
    return () => window.removeEventListener("visited:change", read);
  }, []);
  return <b>{n} / {places.length}</b>;
}
