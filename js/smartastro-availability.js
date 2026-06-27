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

  async function syncSmartAstroSlots() {
    const managedSlots = document.querySelectorAll("[data-smartastro-schedule-id]");
    if (managedSlots.length === 0) return;

    try {
      const response = await fetch(STATE_URL, { cache: "no-store" });
      if (!response.ok) return;

      const state = await response.json();
      const slots = state && state.slots ? state.slots : {};

      managedSlots.forEach((slotElement) => {
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
