import { describe, it, expect } from "vitest";
import { canPerformAction } from "@pm/permissions";

describe("canPerformAction", () => {
  it("lets a manager delete tasks", () => {
    expect(canPerformAction("manager", "tasks", "DELETE")).toBe(true);
  });

  it("blocks an editor from deleting tasks", () => {
    expect(canPerformAction("editor", "tasks", "DELETE")).toBe(false);
  });

  it("blocks a viewer from creating tasks", () => {
    expect(canPerformAction("viewer", "tasks", "POST")).toBe(false);
  });

  it("lets a viewer read tasks", () => {
    expect(canPerformAction("viewer", "tasks", "GET")).toBe(true);
  });

  it("normalises lowercase verbs so call sites can pass either casing", () => {
    expect(canPerformAction("manager", "tasks", "delete")).toBe(true);
  });

  it("returns false when role is missing", () => {
    expect(canPerformAction(null, "tasks", "GET")).toBe(false);
    expect(canPerformAction(undefined, "tasks", "GET")).toBe(false);
  });

  it("returns false for an unknown resource", () => {
    expect(canPerformAction("manager", "nonexistent", "GET")).toBe(false);
  });

  it("returns false for an unknown action on a known resource", () => {
    expect(canPerformAction("manager", "tasks", "PURGE")).toBe(false);
  });

  it("lets anyone signed in create a project but only managers mutate it", () => {
    expect(canPerformAction("viewer", "projects", "POST")).toBe(true);
    expect(canPerformAction("editor", "projects", "POST")).toBe(true);
    expect(canPerformAction("manager", "projects", "POST")).toBe(true);
    expect(canPerformAction("editor", "projects", "PATCH")).toBe(false);
    expect(canPerformAction("manager", "projects", "PATCH")).toBe(true);
  });
});
