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
