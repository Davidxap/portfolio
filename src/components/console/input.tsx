"use client";
import { createContext, useCallback, useContext, useEffect, useRef } from "react";

export type Action = "up" | "down" | "left" | "right" | "a" | "b";
type Listener = (a: Action) => void;
export const InputBus = createContext<{ subscribe: (fn: Listener) => () => void } | null>(null);

/** Subscribes a demo to the console's input (keyboard, on-screen buttons and gamepad share one bus). */
export function useConsoleInput(fn: Listener) {
  const bus = useContext(InputBus);
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => bus?.subscribe((a) => ref.current(a)), [bus]);
}

/** Lets a demo tell the code panel which walkthrough step the player just exercised. */
export const StepBus = createContext<((id: string) => void) | null>(null);

/** Returns a stable `(stepId) => void` reporter; a no-op outside a console. */
export function useStep(): (id: string) => void {
  const report = useContext(StepBus);
  const ref = useRef(report);
  ref.current = report;
  return useCallback((id: string) => ref.current?.(id), []);
}
