// Relative-time formatting, replacing moment.js/angular-moment with the
// native Intl.RelativeTimeFormat (supported in all current browsers) -
// avoids pulling in a date library for what's otherwise a couple of
// `humanSince` one-liners.

const UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1]
];

function relativeFromSeconds(diffSeconds, locale) {
  const rtf = new Intl.RelativeTimeFormat(locale || 'en', {numeric: 'auto'});
  const abs = Math.abs(diffSeconds);
  for (const [unit, secondsInUnit] of UNITS) {
    if (abs >= secondsInUnit || unit === 'second') {
      const value = Math.round(diffSeconds / secondsInUnit);
      return rtf.format(-value, unit);
    }
  }
  return rtf.format(0, 'second');
}

// Mirrors legacy IndexController/AddressController/StatusController's
// humanSince(time): fine-grained "N units ago" relative to now.
export function humanSince(unixSeconds, locale) {
  const diff = Date.now() / 1000 - unixSeconds;
  return relativeFromSeconds(diff, locale);
}

// Mirrors legacy BlocksController's humanSince(time): both the block time
// and "now" are truncated to start-of-day before diffing, so a block
// mined 2 hours ago on the same UTC day shows "today" rather than
// "2 hours ago".
export function humanSinceDay(unixSeconds, locale) {
  const dayMs = 86400000;
  const blockDayStart = Math.floor((unixSeconds * 1000) / dayMs) * dayMs;
  const todayStart = Math.floor(Date.now() / dayMs) * dayMs;
  return relativeFromSeconds((blockDayStart - todayStart) / 1000, locale);
}

// Mirrors legacy StatusController's humanSince (ms-based, from /status
// timestamps that are already in milliseconds, not unix seconds).
export function humanSinceMs(msTimestamp, locale) {
  return humanSince(msTimestamp / 1000, locale);
}

// A precise, live-ticking "Dd HHh MMm SSs" duration, for a countdown that
// needs exact digits rather than humanSince's vague "in 2 days" - larger
// units are omitted once they're zero (so the display shortens naturally
// as a countdown nears its end) but seconds always show.
export function formatDuration(totalSeconds) {
  const clamped = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(clamped / 86400);
  const hours = Math.floor((clamped % 86400) / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;

  const pad = (n) => String(n).padStart(2, '0');
  const parts = [];
  if (days > 0) parts.push(days + 'd');
  if (days > 0 || hours > 0) parts.push(pad(hours) + 'h');
  if (days > 0 || hours > 0 || minutes > 0) parts.push(pad(minutes) + 'm');
  parts.push(pad(seconds) + 's');
  return parts.join(' ');
}
