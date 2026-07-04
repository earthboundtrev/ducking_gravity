const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const CLIENT_SCRIPT = path.join(PROJECT_ROOT, "js/smartastro-availability.js");

function createElement(tagName) {
  const element = {
    tagName: tagName.toUpperCase(),
    children: [],
    cells: [],
    dataset: {},
    classList: {
      contains() {
        return false;
      },
    },
    href: "",
    textContent: "",
    innerHTML: "",
    parent: null,
    removed: false,
    append(...nodes) {
      for (const node of nodes) {
        this.appendChild(node);
      }
    },
    appendChild(node) {
      node.parent = this;
      this.children.push(node);
      if (tagName === "tr") {
        this.cells.push(node);
      }
      return node;
    },
    replaceChildren(...nodes) {
      this.children = [];
      this.cells = [];
      for (const node of nodes) {
        this.appendChild(node);
      }
    },
    replaceWith(node) {
      if (this.parent) {
        const index = this.parent.children.indexOf(this);
        this.parent.children.splice(index, 1, node);
        node.parent = this.parent;
      }
    },
    remove() {
      this.removed = true;
      if (this.parent) {
        this.parent.children = this.parent.children.filter((child) => child !== this);
        if (this.parent.tagName === "TR") {
          this.parent.cells = this.parent.cells.filter((cell) => cell !== this);
        }
        if (this.parent.tagName === "TABLE") {
          this.parent.cells = this.parent.cells.filter((cell) => cell !== this);
        }
      }
    },
    querySelector(selector) {
      if (selector === "th" && this.tagName === "TR") {
        return this.cells.some((cell) => cell.tagName === "TH") ? this.cells[0] : null;
      }
      if (selector === 'a[href*="class="]') {
        return findFirst(this, (node) => node.tagName === "A" && node.href.includes("class="));
      }
      if (selector === ".popup-slot-button") {
        return findFirst(this, (node) => node.className === "popup-slot-button");
      }
      if (selector === "tr") {
        return this.tagName === "TR" ? this : findFirst(this, (node) => node.tagName === "TR");
      }
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "tr") {
        const rows = [];
        collectMatches(this, (node) => node.tagName === "TR", rows);
        return rows;
      }
      if (selector === 'tr[data-smartastro-inserted="true"]') {
        const rows = [];
        collectMatches(
          this,
          (node) => node.tagName === "TR" && node.dataset.smartastroInserted === "true",
          rows,
        );
        return rows;
      }
      return [];
    },
    forEach(callback) {
      for (const child of this.children) {
        callback(child);
      }
    },
  };
  return element;
}

function findFirst(node, predicate) {
  if (predicate(node)) return node;
  for (const child of node.children) {
    const match = findFirst(child, predicate);
    if (match) return match;
  }
  return null;
}

function collectMatches(node, predicate, matches) {
  if (predicate(node)) matches.push(node);
  for (const child of node.children) {
    collectMatches(child, predicate, matches);
  }
}

function createDocument() {
  return {
    readyState: "complete",
    createElement,
    querySelectorAll() {
      return [];
    },
    addEventListener() {},
  };
}

function loadManagedTableHelpers() {
  const source = fs.readFileSync(CLIENT_SCRIPT, "utf8");
  const body = source
    .replace(/^\(function \(\) \{/, "")
    .replace(/if \(document\.readyState[\s\S]*$/, "")
    .replace(/\}\)\(\);\s*$/, "");

  const sandbox = {
    document: createDocument(),
    module: { exports: {} },
    console,
    fetch: async () => ({ ok: false }),
  };

  vm.runInNewContext(
    `${body}
module.exports = {
  removeStaleManagedTableRows,
  renderManagedDestination,
  deriveSilksWeekPopupFromAllClasses,
};`,
    sandbox,
  );

  return sandbox.module.exports;
}

function createManagedTableRow(scheduleId) {
  const row = createElement("tr");
  row.dataset.smartastroScheduleId = String(scheduleId);

  const signUpCell = createElement("td");
  const link = createElement("a");
  link.href = `https://smartastro.app/calendar?class=${scheduleId}`;
  link.className = "info-btn";
  signUpCell.appendChild(link);
  row.appendChild(signUpCell);

  return row;
}

test("removeStaleManagedTableRows drops hasEnded availability rows (#280)", () => {
  const { removeStaleManagedTableRows } = loadManagedTableHelpers();
  const table = createElement("table");
  const row = createManagedTableRow(1600);
  table.appendChild(row);

  removeStaleManagedTableRows(
    table,
    {
      updatedAt: "2026-07-01T15:00:00.000Z",
      slots: [{ scheduleId: 1600 }],
    },
    {
      1600: { scheduleId: 1600, hasEnded: true, isFull: false, removed: false },
    },
  );

  assert.equal(row.removed, true);
  assert.equal(table.children.length, 0);
});

test("removeStaleManagedTableRows drops static rows without schedule ids after sync (#281)", () => {
  const { removeStaleManagedTableRows } = loadManagedTableHelpers();
  const table = createElement("table");
  const orphanRow = createElement("tr");
  const cell = createElement("td");
  cell.textContent = "July 2";
  orphanRow.appendChild(cell);
  table.appendChild(orphanRow);

  removeStaleManagedTableRows(
    table,
    { updatedAt: "2026-07-05T12:00:00.000Z", slots: [] },
    {},
  );

  assert.equal(orphanRow.removed, true);
});

test("removeStaleManagedTableRows keeps future rows not in receiver slot list (#281)", () => {
  const { removeStaleManagedTableRows } = loadManagedTableHelpers();
  const table = createElement("table");
  const row = createManagedTableRow(1444);
  table.appendChild(row);

  removeStaleManagedTableRows(
    table,
    {
      updatedAt: "2026-07-05T12:00:00.000Z",
      slots: [{ scheduleId: 1600 }],
    },
    {},
  );

  assert.equal(row.removed, false);
});

test("renderManagedDestination cleans orphan rows when synced slots are empty (#280)", () => {
  const { renderManagedDestination } = loadManagedTableHelpers();
  const table = createElement("table");

  const syncedRow = createManagedTableRow(1600);
  syncedRow.dataset.smartastroInserted = "true";
  table.appendChild(syncedRow);

  const orphanRow = createElement("tr");
  const orphanCell = createElement("td");
  orphanCell.textContent = "Static fallback";
  orphanRow.appendChild(orphanCell);
  table.appendChild(orphanRow);

  renderManagedDestination(
    table,
    {
      updatedAt: "2026-07-01T15:00:00.000Z",
      slots: [],
    },
    {},
  );

  assert.equal(orphanRow.removed, true);
  assert.equal(syncedRow.removed, true);
});

test("deriveSilksWeekPopupFromAllClasses filters silks popup groups (#283)", () => {
  const source = fs.readFileSync(CLIENT_SCRIPT, "utf8");
  const body = source
    .replace(/^\(function \(\) \{/, "")
    .replace(/if \(document\.readyState[\s\S]*$/, "")
    .replace(/\}\)\(\);\s*$/, "");

  const sandbox = { document: createDocument(), module: { exports: {} }, console, fetch: async () => ({ ok: false }) };
  vm.runInNewContext(`${body}\nmodule.exports = { deriveSilksWeekPopupFromAllClasses };`, sandbox);
  const { deriveSilksWeekPopupFromAllClasses } = sandbox.module.exports;

  const derived = deriveSilksWeekPopupFromAllClasses({
    destinationKey: "homepage-all-classes-week",
    windowStart: "2026-07-06",
    windowEnd: "2026-07-10",
    heading: "All classes this week — Sun, Jul 5, 2026 through Fri, Jul 10, 2026",
    updatedAt: "2026-07-04T13:46:22.268Z",
    slots: [
      { scheduleId: 1, groupKey: "silks-foundations", groupLabel: "Silks Foundations", displayTime: "Tue" },
      { scheduleId: 2, groupKey: "lyra-foundations", groupLabel: "Lyra Foundations", displayTime: "Wed" },
      { scheduleId: 3, groupKey: "adult-aerials", groupLabel: "Adult Aerials", displayTime: "Thu" },
    ],
  });

  assert.equal(derived.destinationKey, "homepage-silks-week");
  assert.match(derived.heading, /^Silks classes this week/i);
  assert.deepEqual(derived.slots.map((slot) => slot.scheduleId), [1, 3]);
});
