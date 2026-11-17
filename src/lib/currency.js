// Ported verbatim from legacy/src/js/controllers/currency.js's _roundFloat
// and $rootScope.currency.getConvertion - pure functions, no framework
// dependency, so they're directly unit-testable.

export function roundFloat(x, n) {
  if (!parseInt(n, 10) || !parseFloat(x)) n = 0;
  return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
}

// `state` is {symbol, factor, netSymbol}. For 'USD', `factor` is the
// ARRR/USD rate from the /currency endpoint; until that has loaded, or if
// the price feed is down (the API reports a rate of 0), amounts are shown
// in the native unit rather than mislabelled or zeroed as USD.
//
// Returns {amount, unit} so callers can style the unit separately; `unit`
// is '' when the value can't be converted.
export function convertParts(value, state) {
  if (state.symbol === 'USD' && !(state.factor > 0)) {
    return convertParts(value, {...state, symbol: state.netSymbol, factor: 1});
  }

  value = value * 1; // Convert to number

  if (isNaN(value) || value === null || typeof value === 'undefined') {
    return {amount: 'value error', unit: ''};
  }

  if (value === 0.0) return {amount: '0', unit: state.symbol};

  let factor = state.factor;
  let response;

  if (state.symbol === 'USD') {
    response = roundFloat(value * factor, 2);
  } else if (state.symbol === 'm' + state.netSymbol) {
    factor = 1000;
    response = roundFloat(value * factor, 5);
  } else {
    factor = 1;
    response = value;
  }

  // prevent sci notation
  if (response < 1e-7) response = response.toFixed(8);

  return {amount: String(response), unit: state.symbol};
}

// The unit choices the header's currency menu offers.
export function currencyOptions(netSymbol) {
  return ['USD', netSymbol, 'm' + netSymbol];
}

// Earlier releases labeled the native unit 'PIRATE' and offered a 'bits'
// unit, and a visitor's choice is kept in their browser across visits.
// Maps whatever was saved onto a currently offered option, so a returning
// visitor doesn't keep seeing a retired label.
export function normalizeStoredSymbol(stored, netSymbol) {
  if (stored === 'mPIRATE') return 'm' + netSymbol;
  if (currencyOptions(netSymbol).includes(stored)) return stored;
  return netSymbol;
}
