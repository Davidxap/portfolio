import { describe, expect, it } from "vitest";
import { transitionTypesFor, parentPath } from "@/lib/world";

describe("transition types", () => {
  it("picks the transition by where you come from and where you go", () => {
    expect(transitionTypesFor("/", "/about/")).toEqual(["to-place"]);
    expect(transitionTypesFor("/about/", "/")).toEqual(["to-map"]);
    expect(transitionTypesFor("/es/", "/es/arcade/")).toEqual(["to-place"]);
    expect(transitionTypesFor("/arcade/", "/arcade/ikai/")).toEqual(["to-game"]);
    expect(transitionTypesFor("/arcade/ikai/", "/arcade/")).toEqual(["from-game"]);
    expect(transitionTypesFor("/projects/", "/projects/ikai/")).toEqual(["to-place"]);
  });
});

describe("B button destination", () => {
  it("goes one level up: place to map, project to projects, game to arcade, map stays", () => {
    expect(parentPath("/about/")).toBe("/");
    expect(parentPath("/es/sobre-mi/")).toBe("/es/");
    expect(parentPath("/projects/ikai/")).toBe("/projects/");
    expect(parentPath("/es/proyectos/ikai/")).toBe("/es/proyectos/");
    expect(parentPath("/arcade/zen/")).toBe("/arcade/");
    expect(parentPath("/direct/")).toBe("/");
    expect(parentPath("/es/directo/")).toBe("/es/");
    expect(parentPath("/")).toBeNull();
  });
});

import { nearestInDirection } from "@/lib/world";

describe("pin navigation", () => {
  const boxes = [{ x: 10, y: 10 }, { x: 50, y: 12 }, { x: 52, y: 80 }, { x: 90, y: 10 }];
  it("moves to the nearest pin in the pressed direction", () => {
    expect(nearestInDirection(boxes, 0, "right")).toBe(1);
    expect(nearestInDirection(boxes, 1, "down")).toBe(2);
    expect(nearestInDirection(boxes, 1, "right")).toBe(3);
    expect(nearestInDirection(boxes, 3, "left")).toBe(1);
  });
  it("wraps when nothing lies in that direction and starts at the first pin when none is focused", () => {
    expect(nearestInDirection(boxes, 3, "right")).toBe(0);
    expect(nearestInDirection(boxes, 0, "up")).toBe(3);
    expect(nearestInDirection(boxes, -1, "left")).toBe(0);
  });
});
