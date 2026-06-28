(function () {
  const STATE_URL = "/api/smartastro-availability";

  function createOpenButton(slot) {
    const anchor = document.createElement("a");
    anchor.href = slot.signUpUrl || `https://smartastro.app/calendar?class=${slot.scheduleId}`;
    anchor.target = "_blank";
    anchor.className = "popup-slot-button";
    anchor.textContent = "Sign up!";
    return anchor;
  }

  function createFullButton() {
    const span = document.createElement("span");
    span.className = "popup-slot-button full";
    span.textContent = "Class Full";
    return span;
  }

  function applySlotState(slotElement, slot) {
    const currentButton = slotElement.querySelector(".popup-slot-button");
    if (!currentButton) return;

    const nextButton = slot.isFull ? createFullButton() : createOpenButton(slot);
    currentButton.replaceWith(nextButton);
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

  function createSlotElement(slot) {
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
      content.appendChild(createSlotElement(slot));
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
        applySlotState(slotElement, slot);
      }
    });
  }

  async function syncSmartAstroSlots() {
    const managedSlots = document.querySelectorAll("[data-smartastro-schedule-id]");
    const managedPopups = document.querySelectorAll("[data-smartastro-popup-destination]");
    if (managedSlots.length === 0 && managedPopups.length === 0) return;

    try {
      const response = await fetch(STATE_URL, { cache: "no-store" });
      if (!response.ok) return;

      const state = await response.json();
      const slots = state && state.slots ? state.slots : {};
      const destinations =
        state && state.popups && state.popups.destinations ? state.popups.destinations : {};

      managedPopups.forEach((slide) => {
        const destinationKey = slide.dataset.smartastroPopupDestination;
        renderPopupDestination(slide, destinations[destinationKey], slots);
      });

      document.querySelectorAll("[data-smartastro-schedule-id]").forEach((slotElement) => {
        if (slotElement.dataset.smartastroSync === "false") return;

        const scheduleId = slotElement.dataset.smartastroScheduleId;
        const slot = slots[scheduleId];
        if (!slot) return;

        applySlotState(slotElement, slot);
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
