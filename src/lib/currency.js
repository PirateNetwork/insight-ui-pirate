// Ported verbatim from legacy/src/js/controllers/currency.js's _roundFloat
// and $rootScope.currency.getConvertion - pure functions, no framework
// dependency, so they're directly unit-testable.

export function roundFloat(x, n) {
  if (!parseInt(n, 10) || !parseFloat(x)) n = 0;
  return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
}

// `state` is {symbol, factor, netSymbol}; USD's factor must already be set
// (from the /currency endpoint) before calling with symbol 'USD'.
export function convert(value, state) {
  value = value * 1; // Convert to number

  if (isNaN(value) || value === null || typeof value === 'undefined') {
    return 'value error';
  }

  if (value === 0.0) return '0 ' + state.symbol;

  let factor = state.factor;
  let response;

  if (state.symbol === 'USD') {
    response = roundFloat(value * factor, 2);
  } else if (state.symbol === 'm' + state.netSymbol) {
    factor = 1000;
    response = roundFloat(value * factor, 5);
  } else if (state.symbol === 'bits') {
    factor = 1000000;
    response = roundFloat(value * factor, 2);
  } else {
    factor = 1;
    response = value;
  }

  // prevent sci notation
  if (response < 1e-7) response = response.toFixed(8);

  return response + ' ' + state.symbol;
}
