/**
 * Naive wall-clock display for SmartAstro schedule timestamps (#292 / #140).
 * DB times arrive as ISO strings whose UTC components are studio local wall clock.
 */

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

/** Popup slot line: `Tue Jun 30 · 6:45–7:45pm` */
function formatWeekPopupSlotDisplayTime(start, end) {
  return `${formatNaiveWeekdayMonthDay(start)} · ${formatNaiveTimeRangeForPopup(start, end)}`;
}

/** Table-style range: `6:45pm - 7:45pm` */
function formatNaiveTimeRangeForTable(start, end) {
  return `${formatNaiveTime12Hour(start)} - ${formatNaiveTime12Hour(end)}`;
}

/** YYYY-MM-DD from naive UTC components (not Intl timezone shift). */
function toYmdFromNaiveIsoDateTime(isoDateTime) {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = {
  formatNaiveTimeRangeForTable,
  formatWeekPopupSlotDisplayTime,
  toYmdFromNaiveIsoDateTime,
};
