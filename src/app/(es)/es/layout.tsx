import type { ReactNode } from "react";
import { RootHtml } from "@/components/RootHtml";
import { WorldShell } from "@/components/world/WorldShell";
export { viewport } from "@/lib/seo";

export default function Layout({ children }: { children: ReactNode }) {
  return <RootHtml locale="es"><WorldShell locale="es">{children}</WorldShell></RootHtml>;
}
