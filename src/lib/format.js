// getnetworksolps returns a raw solutions/sec number - format it with
// the same k/M/G/T sols/s unit scaling explorer.piratechain.com/stats
// uses (e.g. "8 msols/s" there is actually "M" - mega - not milli).
const SOLS_UNITS = ['sols/s', 'Ksols/s', 'Msols/s', 'Gsols/s', 'Tsols/s'];

export function formatSolutionRate(sols) {
  if (sols == null || isNaN(sols)) return '';
  let value = sols;
  let unitIndex = 0;
  while (Math.abs(value) >= 1000 && unitIndex < SOLS_UNITS.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  const decimals = unitIndex === 0 ? 0 : 2;
  return value.toFixed(decimals) + ' ' + SOLS_UNITS[unitIndex];
}
