import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { createDatabase, type Database } from "../db.js";
import { TodoStore } from "../todo-store.js";

function makeTmpDir(): string {
  return mkdtempSync(join(tmpdir(), "fn-todo-store-"));
}

let fusionDir: string;
let db: Database;
let store: TodoStore;

afterEach(() => {
  db.close();
  rmSync(fusionDir, { recursive: true, force: true });
});

beforeEach(() => {
  fusionDir = makeTmpDir();
  db = createDatabase(fusionDir);
  db.init();
  store = new TodoStore(db);
});

describe("TodoStore", () => {
  describe("list CRUD", () => {
    it("createList returns a list with generated id and timestamps", () => {
      const list = store.createList("proj-a", { title: "Inbox" });

      expect(list.id).toMatch(/^TDL-[A-Z0-9]+-[A-Z0-9]+$/);
      expect(list.projectId).toBe("proj-a");
      expect(list.title).toBe("Inbox");
      expect(list.createdAt).toBeTruthy();
      expect(list.updatedAt).toBeTruthy();
    });

    it("getList returns list by id and undefined when missing", () => {
      const list = store.createList("proj-a", { title: "Backlog" });

      expect(store.getList(list.id)).toEqual(list);
      expect(store.getList("TDL-MISSING")).toBeUndefined();
    });

    it("listLists returns lists ordered by createdAt and scoped by project", () => {
      const now = new Date();
      db.prepare(
        "INSERT INTO todo_lists (id, projectId, title, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)"
      ).run("TDL-OLD", "proj-a", "Older", new Date(now.getTime() - 10_000).toISOString(), new Date(now.getTime() - 10_000).toISOString());
      db.prepare(
        "INSERT INTO todo_lists (id, projectId, title, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)"
      ).run("TDL-NEW", "proj-a", "Newer", now.toISOString(), now.toISOString());
      store.createList("proj-b", { title: "Other project" });

      const lists = store.listLists("proj-a");
      expect(lists.map((l) => l.id)).toEqual(["TDL-OLD", "TDL-NEW"]);
    });

    it("updateList updates title and updatedAt; returns undefined when missing", () => {
      const list = store.createList("proj-a", { title: "Before" });
      const updated = store.updateList(list.id, { title: "After" });

      expect(updated).toBeDefined();
      expect(updated?.title).toBe("After");
      expect(updated?.updatedAt >= list.updatedAt).toBe(true);
      expect(store.updateList("TDL-MISSING", { title: "x" })).toBeUndefined();
    });

    it("deleteList removes list, returns true/false, and cascades items", () => {
      const list = store.createList("proj-a", { title: "Delete me" });
      const item = store.createItem(list.id, { text: "child" });

      expect(store.deleteList(list.id)).toBe(true);
      expect(store.getList(list.id)).toBeUndefined();
      expect(store.getItem(item.id)).toBeUndefined();
      expect(store.deleteList(list.id)).toBe(false);
    });
  });

  describe("item CRUD", () => {
    it("createItem auto-increments sortOrder and accepts explicit sortOrder", () => {
      const list = store.createList("proj-a", { title: "L" });
      const first = store.createItem(list.id, { text: "first" });
      const second = store.createItem(list.id, { text: "second" });
      const explicit = store.createItem(list.id, { text: "explicit", sortOrder: 10 });

      expect(first.sortOrder).toBe(0);
      expect(second.sortOrder).toBe(1);
      expect(explicit.sortOrder).toBe(10);
    });

    it("getItem retrieves an item by id", () => {
      const list = store.createList("proj-a", { title: "L" });
      const item = store.createItem(list.id, { text: "fetch me" });

      expect(store.getItem(item.id)).toEqual(item);
      expect(store.getItem("TDI-MISSING")).toBeUndefined();
    });

    it("listItems returns items ordered by sortOrder then createdAt", () => {
      const list = store.createList("proj-a", { title: "L" });
      const now = new Date().toISOString();
      db.prepare(
        `INSERT INTO todo_items (id, listId, text, completed, completedAt, sortOrder, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run("TDI-B", list.id, "b", 0, null, 0, now, now);
      db.prepare(
        `INSERT INTO todo_items (id, listId, text, completed, completedAt, sortOrder, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run("TDI-A", list.id, "a", 0, null, 0, new Date(Date.now() - 1000).toISOString(), new Date(Date.now() - 1000).toISOString());
      db.prepare(
        `INSERT INTO todo_items (id, listId, text, completed, completedAt, sortOrder, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run("TDI-C", list.id, "c", 0, null, 1, now, now);

      const items = store.listItems(list.id);
      expect(items.map((i) => i.id)).toEqual(["TDI-A", "TDI-B", "TDI-C"]);
    });

    it("updateItem updates text and bumps updatedAt", () => {
      const list = store.createList("proj-a", { title: "L" });
      const item = store.createItem(list.id, { text: "before" });

      const updated = store.updateItem(item.id, { text: "after" });
      expect(updated?.text).toBe("after");
      expect(updated?.updatedAt >= item.updatedAt).toBe(true);
    });

    it("toggleItem flips completion and completedAt", () => {
      const list = store.createList("proj-a", { title: "L" });
      const item = store.createItem(list.id, { text: "toggle" });

      const completed = store.toggleItem(item.id)!;
      expect(completed.completed).toBe(true);
      expect(completed.completedAt).toBeTruthy();

      const reopened = store.toggleItem(item.id)!;
      expect(reopened.completed).toBe(false);
      expect(reopened.completedAt).toBeNull();
    });

    it.each([
      { completed: true, expectedCompletedAt: "set" },
      { completed: false, expectedCompletedAt: "cleared" },
    ])("updateItem handles completed=$completed by setting/clearing completedAt", ({ completed, expectedCompletedAt }) => {
      const list = store.createList("proj-a", { title: "L" });
      const item = store.createItem(list.id, { text: "status" });
      if (!completed) {
        store.updateItem(item.id, { completed: true });
      }

      const updated = store.updateItem(item.id, { completed })!;
      expect(updated.completed).toBe(completed);
      if (expectedCompletedAt === "set") {
        expect(updated.completedAt).toBeTruthy();
      } else {
        expect(updated.completedAt).toBeNull();
      }
    });

    it("deleteItem removes item and returns true/false", () => {
      const list = store.createList("proj-a", { title: "L" });
      const item = store.createItem(list.id, { text: "x" });

      expect(store.deleteItem(item.id)).toBe(true);
      expect(store.getItem(item.id)).toBeUndefined();
      expect(store.deleteItem(item.id)).toBe(false);
    });

    it("reorderItems reassigns sortOrder and validates list membership", () => {
      const list = store.createList("proj-a", { title: "L" });
      const i1 = store.createItem(list.id, { text: "1" });
      const i2 = store.createItem(list.id, { text: "2" });
      const i3 = store.createItem(list.id, { text: "3" });

      const reordered = store.reorderItems(list.id, [i3.id, i1.id, i2.id]);
      expect(reordered.map((i) => [i.id, i.sortOrder])).toEqual([
        [i3.id, 0],
        [i1.id, 1],
        [i2.id, 2],
      ]);

      const other = store.createList("proj-a", { title: "Other" });
      const otherItem = store.createItem(other.id, { text: "other" });
      expect(() => store.reorderItems(list.id, [i1.id, i2.id, otherItem.id])).toThrow(/does not belong to list/);
      expect(() => store.reorderItems(list.id, [i1.id, i2.id])).toThrow(/must include all items/);
    });
  });

  describe("composite queries", () => {
    it("getListsWithItems returns all lists with populated items", () => {
      const l1 = store.createList("proj-a", { title: "A" });
      const l2 = store.createList("proj-a", { title: "B" });
      const i1 = store.createItem(l1.id, { text: "a1" });
      const i2 = store.createItem(l1.id, { text: "a2" });
      const i3 = store.createItem(l2.id, { text: "b1" });

      const lists = store.getListsWithItems("proj-a");
      expect(lists).toHaveLength(2);
      expect(lists.find((l) => l.id === l1.id)?.items.map((i) => i.id)).toEqual([i1.id, i2.id]);
      expect(lists.find((l) => l.id === l2.id)?.items.map((i) => i.id)).toEqual([i3.id]);
    });

    it("getListsWithItems is scoped by projectId", () => {
      const listA = store.createList("proj-a", { title: "A" });
      store.createItem(listA.id, { text: "a1" });
      const listB = store.createList("proj-b", { title: "B" });
      store.createItem(listB.id, { text: "b1" });

      const lists = store.getListsWithItems("proj-a");
      expect(lists).toHaveLength(1);
      expect(lists[0].id).toBe(listA.id);
    });
  });

  describe("event emissions", () => {
    it("emits list events with expected payloads", () => {
      const createdHandler = vi.fn();
      const updatedHandler = vi.fn();
      const deletedHandler = vi.fn();
      store.on("list:created", createdHandler);
      store.on("list:updated", updatedHandler);
      store.on("list:deleted", deletedHandler);

      const list = store.createList("proj-a", { title: "Events" });
      const updated = store.updateList(list.id, { title: "Events 2" })!;
      store.deleteList(list.id);

      expect(createdHandler).toHaveBeenCalledWith(list);
      expect(updatedHandler).toHaveBeenCalledWith(updated);
      expect(deletedHandler).toHaveBeenCalledWith(list.id);
    });

    it("emits item and reorder events", () => {
      const list = store.createList("proj-a", { title: "Events" });
      const createdHandler = vi.fn();
      const updatedHandler = vi.fn();
      const deletedHandler = vi.fn();
      const reorderedHandler = vi.fn();

      store.on("item:created", createdHandler);
      store.on("item:updated", updatedHandler);
      store.on("item:deleted", deletedHandler);
      store.on("items:reordered", reorderedHandler);

      const a = store.createItem(list.id, { text: "A" });
      const b = store.createItem(list.id, { text: "B" });
      const updated = store.updateItem(a.id, { text: "A+" })!;
      store.reorderItems(list.id, [b.id, a.id]);
      store.deleteItem(a.id);

      expect(createdHandler).toHaveBeenCalledTimes(2);
      expect(updatedHandler).toHaveBeenCalledWith(updated);
      expect(reorderedHandler).toHaveBeenCalledWith({
        listId: list.id,
        items: expect.any(Array),
      });
      expect(deletedHandler).toHaveBeenCalledWith(a.id);
    });
  });
});
