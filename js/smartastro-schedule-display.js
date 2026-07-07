/**
 * Browser naive wall-clock formatters for SmartAstro popup times (#292, #295).
 * Keep in sync with netlify/functions/lib/smartastro-schedule-display.js
 */
(function (global) {
  const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  function formatNaiveTime12Hour(date) {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours >= 12 ? "pm" : "am";
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    if (minutes === 0) {
      return `${hour12}:00${period}`;
    }
    return `${hour12}:${String(minutes).padStart(2, "0")}${period}`;
  }

  function formatNaiveTimeRangeForPopup(start, end) {
    const startHours = start.getUTCHours();
    const endHours = end.getUTCHours();
    const startIsPm = startHours >= 12;
    const endIsPm = endHours >= 12;
    const startMinutes = start.getUTCMinutes();
    const endMinutes = end.getUTCMinutes();
    const startHour12 = startHours === 0 ? 12 : startHours > 12 ? startHours - 12 : startHours;
    const endHour12 = endHours === 0 ? 12 : endHours > 12 ? endHours - 12 : endHours;
    const startCore = `${startHour12}:${String(startMinutes).padStart(2, "0")}`;
    const endCore = `${endHour12}:${String(endMinutes).padStart(2, "0")}`;

    if (startIsPm === endIsPm) {
      return `${startCore}–${endCore}${endIsPm ? "pm" : "am"}`;
    }

    return `${formatNaiveTime12Hour(start)}–${formatNaiveTime12Hour(end)}`;
  }

  function formatNaiveWeekdayMonthDay(date) {
    const weekday = WEEKDAYS_SHORT[date.getUTCDay()];
    const month = MONTHS_SHORT[date.getUTCMonth()];
    return `${weekday} ${month} ${date.getUTCDate()}`;
  }

  function formatWeekPopupSlotDisplayTime(start, end) {
    return `${formatNaiveWeekdayMonthDay(start)} · ${formatNaiveTimeRangeForPopup(start, end)}`;
  }

  function shouldDeriveWeekPopupDisplayTime(rawDisplayTime) {
    if (!rawDisplayTime) return true;
    if (/Members|Non-members/i.test(rawDisplayTime)) return false;
    return true;
  }

  function resolveWeekPopupDisplayTime(slot) {
    if (!slot || typeof slot !== "object") return "";
    const raw = typeof slot.displayTime === "string" ? slot.displayTime.trim() : "";
    if (
      slot.startsAt &&
      slot.endsAt &&
      shouldDeriveWeekPopupDisplayTime(raw)
    ) {
      const start = new Date(slot.startsAt);
      const end = new Date(slot.endsAt);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        return formatWeekPopupSlotDisplayTime(start, end);
      }
    }
    return raw;
  }

  global.SmartAstroScheduleDisplay = {
    formatWeekPopupSlotDisplayTime,
    shouldDeriveWeekPopupDisplayTime,
    resolveWeekPopupDisplayTime,
  };
})(typeof window !== "undefined" ? window : globalThis);
