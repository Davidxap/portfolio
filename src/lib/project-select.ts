export type ProjectFilter = "all" | "full-stack" | "tools" | "learning";

/** The projects that belong to a filter group; "all" keeps everything, the order of the registry is preserved. */
export function filterProjects<T extends { category: string }>(items: T[], filter: ProjectFilter): T[] {
  return filter === "all" ? items : items.filter((p) => p.category === filter);
}
