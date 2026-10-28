"use client";
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { copyText } from "@/lib/copy";

/** "Save point": copies the email and confirms. Hidden until JS is ready, since it cannot work without it. */
export function CopyButton({ value, label, done }: { value: string; label: string; done: string }) {
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef<number>(0);
  useEffect(() => { setReady(true); return () => clearTimeout(timer.current); }, []);
  return (
    <button
      className={`btn${saved ? " saved" : ""}`} type="button" data-copy={value} hidden={!ready} aria-live="polite"
      onClick={async () => {
        if (!(await copyText(value))) return;
        clearTimeout(timer.current);
        setSaved(true);
        timer.current = window.setTimeout(() => setSaved(false), 1600);
      }}
    >
      {saved ? <Check className="ic" size={17} aria-hidden="true" /> : <Copy className="ic" size={17} aria-hidden="true" />}{saved ? done : label}
    </button>
  );
}
