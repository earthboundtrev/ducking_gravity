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
    className: "",
    innerHTML: "",
    textContent: "",
    type: "",
    parent: null,
    removed: false,
    classList: {
      contains() {
        return false;
      },
    },
    append(...nodes) {
      for (const node of nodes) {
        this.appendChild(node);
      }
    },
    appendChild(node) {
      node.parent = this;
      this.children.push(node);
      return node;
    },
    replaceChildren(...nodes) {
      this.children = [];
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
      }
    },
    querySelector(selector) {
      if (selector === "[data-smartastro-popup-slot-root]") {
        return findFirst(this, (node) => node.dataset && node.dataset.smartastroPopupSlotRoot === "true");
      }
      if (selector === "[data-smartastro-popup-heading]") {
        return findFirst(this, (node) => node.dataset && node.dataset.smartastroPopupHeading === "true");
      }
      if (selector === "[data-smartastro-popup-heading-suffix]") {
        return findFirst(this, (node) => node.dataset && node.dataset.smartastroPopupHeadingSuffix === "true");
      }
      if (selector === ".popup-slot-button") {
        return findFirst(this, (node) => node.className === "popup-slot-button");
      }
      return null;
    },
    querySelectorAll(selector) {
      if (selector === "[data-smartastro-schedule-id]") {
        const matches = [];
        collectMatches(
          this,
          (node) => node.dataset && node.dataset.smartastroScheduleId,
          matches,
        );
        return matches;
      }
      if (selector === ".popup-dropdown-container") {
        const matches = [];
        collectMatches(this, (node) => node.className === "popup-dropdown-container", matches);
        return matches;
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

function loadPopupHelpers() {
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
    window: {},
  };

  vm.runInNewContext(
    `${body}
module.exports = {
  renderPopupDestination,
};`,
    sandbox,
  );

  return sandbox.module.exports;
}

function createPopupSlide() {
  const slide = createElement("div");
  slide.dataset.smartastroPopupDestination = "homepage-all-classes-week";

  const slotRoot = createElement("div");
  slotRoot.dataset.smartastroPopupSlotRoot = "true";
  slide.appendChild(slotRoot);

  return { slide, slotRoot };
}

function sampleHomeschoolSlot(scheduleId, groupKey, groupLabel) {
  return {
    scheduleId,
    groupKey,
    groupLabel,
    startsAt: "2026-09-02T17:00:00.000Z",
    endsAt: "2026-09-02T18:00:00.000Z",
    displayTime: "Tue Sep 2 · 1:00–2:00pm",
    isFull: false,
    availableSpots: 3,
    isClosed: false,
    signUpUrl: `https://smartastro.app/calendar?class=${scheduleId}`,
  };
}

test("renderPopupDestination keeps static markup before sync (#23)", () => {
  const { renderPopupDestination } = loadPopupHelpers();
  const { slide, slotRoot } = createPopupSlide();
  const fallback = createElement("div");
  fallback.className = "popup-dropdown-container";
  slotRoot.appendChild(fallback);

  renderPopupDestination(slide, { slots: [] }, {});

  assert.equal(slotRoot.children.length, 1);
  assert.equal(slotRoot.children[0], fallback);
});

test("renderPopupDestination shows persistent homeschool empty groups after sync (#23)", () => {
  const { renderPopupDestination } = loadPopupHelpers();
  const { slide, slotRoot } = createPopupSlide();

  renderPopupDestination(
    slide,
    {
      updatedAt: "2026-09-01T12:00:00.000Z",
      heading: "All classes this week — Sep 1 through Sep 5, 2026",
      slots: [
        sampleHomeschoolSlot(1468, "silks-foundations", "Silks Foundations"),
      ],
    },
    {},
  );

  const groups = slotRoot.querySelectorAll(".popup-dropdown-container");
  assert.equal(groups.length, 3);
  assert.equal(groups[0].dataset.smartastroPopupGroup, "silks-foundations");
  assert.equal(groups[1].dataset.smartastroPopupGroup, "homeschool-foundations");
  assert.equal(groups[1].dataset.smartastroPopupEmpty, "true");
  assert.equal(groups[2].dataset.smartastroPopupGroup, "junior-homeschool-foundations");
  assert.equal(groups[2].dataset.smartastroPopupEmpty, "true");
});

test("renderPopupDestination replaces homeschool empty state when slots arrive (#23)", () => {
  const { renderPopupDestination } = loadPopupHelpers();
  const { slide } = createPopupSlide();

  renderPopupDestination(
    slide,
    {
      updatedAt: "2026-09-08T12:00:00.000Z",
      slots: [
        sampleHomeschoolSlot(1740, "homeschool-foundations", "Homeschool Foundations"),
        sampleHomeschoolSlot(1736, "junior-homeschool-foundations", "Junior Homeschool Foundations"),
      ],
    },
    {},
  );

  const slideRoot = slide.querySelector("[data-smartastro-popup-slot-root]");
  const homeschool = slideRoot.children.find(
    (node) => node.dataset.smartastroPopupGroup === "homeschool-foundations",
  );
  const juniorHomeschool = slideRoot.children.find(
    (node) => node.dataset.smartastroPopupGroup === "junior-homeschool-foundations",
  );

  assert.ok(homeschool);
  assert.ok(juniorHomeschool);
  assert.equal(homeschool.dataset.smartastroPopupEmpty, undefined);
  assert.equal(juniorHomeschool.dataset.smartastroPopupEmpty, undefined);
  assert.equal(homeschool.querySelectorAll("[data-smartastro-schedule-id]").length, 1);
  assert.equal(juniorHomeschool.querySelectorAll("[data-smartastro-schedule-id]").length, 1);
});
