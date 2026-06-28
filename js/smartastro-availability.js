(function () {
  const STATE_URL = "/api/smartastro-availability";

  function createOpenButton(slot, className) {
    const anchor = document.createElement("a");
    anchor.href = slot.signUpUrl || `https://smartastro.app/calendar?class=${slot.scheduleId}`;
    anchor.target = "_blank";
    anchor.className = className || "popup-slot-button";
    anchor.textContent = className === "info-btn" ? "Sign up for this class!" : "Sign up!";
    if (className === "info-btn") {
      const span = document.createElement("span");
      span.textContent = "Sign up for this class!";
      anchor.textContent = "";
      anchor.appendChild(span);
      anchor.dataset.mobileLabel = "";
    }
    return anchor;
  }

  function createFullButton(className) {
    const span = document.createElement("span");
    span.className = className === "info-btn" ? "info-btn full" : "popup-slot-button full";
    span.dataset.mobileLabel = "";
    const inner = document.createElement("span");
    inner.textContent = "Class Full";
    span.appendChild(inner);
    return span;
  }

  function applyPopupSlotState(slotElement, slot) {
    const currentButton = slotElement.querySelector(".popup-slot-button");
    if (!currentButton) return;

    const nextButton = slot.isFull ? createFullButton() : createOpenButton(slot);
    currentButton.replaceWith(nextButton);
  }

  function applyTableRowState(row, slot) {
    const signUpCell = row.cells[row.cells.length - 1];
    if (!signUpCell) return;

    const nextButton = slot.isFull
      ? createFullButton("info-btn")
      : createOpenButton(slot, "info-btn");
    signUpCell.replaceChildren(nextButton);
  }

  function scheduleIdFromRow(row) {
    if (row.dataset.smartastroScheduleId) {
      return row.dataset.smartastroScheduleId;
    }

    const link = row.querySelector('a[href*="class="]');
    if (!link) return null;
    const match = link.href.match(/[?&]class=(\d+)/);
    return match ? match[1] : null;
  }

  function formatPriceHtml(displayPrice) {
    return displayPrice
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("<br>");
  }

  function createManagedTableRow(slot, availabilitySlots) {
    const row = document.createElement("tr");
    row.dataset.smartastroScheduleId = String(slot.scheduleId);
    row.dataset.smartastroInserted = "true";

    const dateCell = document.createElement("td");
    dateCell.textContent = slot.displayDate;

    const timeCell = document.createElement("td");
    timeCell.textContent = slot.displayTime;

    const priceCell = document.createElement("td");
    priceCell.innerHTML = formatPriceHtml(slot.displayPrice);

    const signUpCell = document.createElement("td");
    const availability = availabilitySlots[String(slot.scheduleId)] || slot;
    signUpCell.appendChild(
      availability.isFull
        ? createFullButton("info-btn")
        : createOpenButton(availability, "info-btn"),
    );

    row.append(dateCell, timeCell, priceCell, signUpCell);
    return row;
  }

  function groupSlots(slots) {
    const groups = [];
    const indexByKey = new Map();

    for (const slot of slots) {
      let groupIndex = indexByKey.get(slot.groupKey);
      if (groupIndex === undefined) {
        groupIndex = groups.length;
        indexByKey.set(slot.groupKey, groupIndex);
        groups.push({
          groupKey: slot.groupKey,
          groupLabel: slot.groupLabel,
          slots: [],
        });
      }
      groups[groupIndex].slots.push(slot);
    }

    return groups;
  }

  function createPopupSlotElement(slot) {
    const slotElement = document.createElement("div");
    slotElement.className = "popup-slot";
    slotElement.dataset.smartastroScheduleId = String(slot.scheduleId);

    const time = document.createElement("span");
    time.className = "popup-slot-time";
    time.textContent = slot.displayTime;

    const button = slot.isFull
      ? createFullButton()
      : createOpenButton({
          scheduleId: slot.scheduleId,
          signUpUrl: slot.signUpUrl,
        });

    slotElement.append(time, button);
    return slotElement;
  }

  function createDropdownGroup(group) {
    const container = document.createElement("div");
    container.className = "popup-dropdown-container";
    container.dataset.smartastroPopupGroup = group.groupKey;

    const toggle = document.createElement("button");
    toggle.className = "popup-dropdown-toggle";
    toggle.type = "button";
    toggle.innerHTML = `${group.groupLabel} <span class="popup-dropdown-arrow">▼</span>`;

    const content = document.createElement("div");
    content.className = "popup-dropdown-content";

    for (const slot of group.slots) {
      content.appendChild(createPopupSlotElement(slot));
    }

    container.append(toggle, content);
    return container;
  }

  function formatHeadingHtml(heading) {
    const parts = heading.split(" — ");
    if (parts.length < 2) {
      return `<strong>${heading}</strong>`;
    }
    return `<strong>${parts[0]}</strong> &mdash; ${parts.slice(1).join(" — ")}`;
  }

  function updatePopupHeading(slide, destination) {
    const headingElement = slide.querySelector("[data-smartastro-popup-heading]");
    if (!headingElement || !destination.heading) return;

    const suffix = headingElement.querySelector("[data-smartastro-popup-heading-suffix]");
    const suffixHtml = suffix ? suffix.outerHTML : "";
    headingElement.innerHTML = `${formatHeadingHtml(destination.heading)}${suffixHtml}`;
  }

  function renderPopupDestination(slide, destination, availabilitySlots) {
    // #229: keep static fallback markup when SmartAstro sends no slots for a destination.
    if (!destination || !Array.isArray(destination.slots) || destination.slots.length === 0) {
      return;
    }

    updatePopupHeading(slide, destination);

    const slotRoot = slide.querySelector("[data-smartastro-popup-slot-root]");
    if (!slotRoot) return;

    slotRoot.replaceChildren();
    for (const group of groupSlots(destination.slots)) {
      slotRoot.appendChild(createDropdownGroup(group));
    }

    slotRoot.querySelectorAll("[data-smartastro-schedule-id]").forEach((slotElement) => {
      const scheduleId = slotElement.dataset.smartastroScheduleId;
      const slot = availabilitySlots[scheduleId];
      if (slot) {
        applyPopupSlotState(slotElement, slot);
      }
    });
  }

  function existingScheduleIdsForTable(table) {
    const ids = new Set();
    table.querySelectorAll("tr").forEach((row) => {
      const scheduleId = scheduleIdFromRow(row);
      if (scheduleId) ids.add(scheduleId);
    });
    return ids;
  }

  function renderManagedDestination(table, destination, availabilitySlots) {
    if (!destination || !Array.isArray(destination.slots) || destination.slots.length === 0) {
      return;
    }

    const existingIds = existingScheduleIdsForTable(table);
    const insertedRows = table.querySelectorAll('tr[data-smartastro-inserted="true"]');
    insertedRows.forEach((row) => row.remove());

    const rowsToInsert = destination.slots.filter(
      (slot) => !existingIds.has(String(slot.scheduleId)),
    );

    for (const slot of rowsToInsert) {
      table.appendChild(createManagedTableRow(slot, availabilitySlots));
    }

    table.querySelectorAll("tr").forEach((row) => {
      const scheduleId = scheduleIdFromRow(row);
      if (!scheduleId) return;
      const slot = availabilitySlots[scheduleId];
      if (slot) {
        applyTableRowState(row, slot);
      }
    });
  }

  async function syncSmartAstroSlots() {
    const managedPopups = document.querySelectorAll("[data-smartastro-popup-destination]");
    const managedTables = document.querySelectorAll("[data-smartastro-managed-destination]");
    const managedSlots = document.querySelectorAll("[data-smartastro-schedule-id]");

    if (
      managedPopups.length === 0 &&
      managedTables.length === 0 &&
      managedSlots.length === 0
    ) {
      return;
    }

    try {
      const response = await fetch(STATE_URL, { cache: "no-store" });
      if (!response.ok) return;

      const state = await response.json();
      const slots = state && state.slots ? state.slots : {};
      const popupDestinations =
        state && state.popups && state.popups.destinations ? state.popups.destinations : {};
      const managedDestinations =
        state && state.managed && state.managed.destinations ? state.managed.destinations : {};

      managedPopups.forEach((slide) => {
        const destinationKey = slide.dataset.smartastroPopupDestination;
        renderPopupDestination(slide, popupDestinations[destinationKey], slots);
      });

      managedTables.forEach((table) => {
        const destinationKey = table.dataset.smartastroManagedDestination;
        renderManagedDestination(table, managedDestinations[destinationKey], slots);
      });

      document.querySelectorAll("[data-smartastro-schedule-id]").forEach((slotElement) => {
        if (slotElement.dataset.smartastroSync === "false") return;

        const scheduleId = slotElement.dataset.smartastroScheduleId;
        const slot = slots[scheduleId];
        if (!slot) return;

        if (slotElement.classList.contains("popup-slot")) {
          applyPopupSlotState(slotElement, slot);
          return;
        }

        if (slotElement.tagName === "TR") {
          applyTableRowState(slotElement, slot);
        }
      });

      document.querySelectorAll("[data-smartastro-managed-destination]").forEach((table) => {
        table.querySelectorAll("tr").forEach((row) => {
          const scheduleId = scheduleIdFromRow(row);
          if (!scheduleId) return;
          const slot = slots[scheduleId];
          if (slot) {
            applyTableRowState(row, slot);
          }
        });
      });
    } catch (_err) {
      // Leave the static fallback markup untouched if the sync state is unavailable.
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncSmartAstroSlots);
  } else {
    syncSmartAstroSlots();
  }
})();
