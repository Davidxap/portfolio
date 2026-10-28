import type { PlaceId } from "@/data/places";

/** The window title shown in the title bar: the program that would run it on the real desktop. A plain module (no "use client"), so both
 * server pages and the client window can read it. */
export const APP_TITLE: Record<PlaceId, string> = {
  about: "kitty — david@manizales: ~",
  projects: "yazi — ~/projects",
  experience: "kitty — git log --graph",
  stack: "fastfetch — david@manizales",
  arcade: "launcher — arcade",
  contact: "mail — new message",
};
