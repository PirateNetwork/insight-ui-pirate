import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {getCurrency} from '../api/currency';
import {convertParts, currencyOptions, normalizeStoredSymbol} from '../lib/currency';

// Pirate Chain's ticker, used as the native-unit currency option.
export const NET_SYMBOL = 'ARRR';

const CurrencyContext = createContext(null);

// An amount with its unit set apart (smaller and dimmer, see .amount-unit),
// so a column of values reads as numbers rather than a run of "ARRR"s.
function Amount({parts}) {
  return (
    <span className="amount">
      {parts.amount}
      {parts.unit && (
        <>
          {' '}
          <span className="amount-unit">{parts.unit}</span>
        </>
      )}
    </span>
  );
}

export function CurrencyProvider({children}) {
  const [symbol, setSymbol] = useState(() =>
    normalizeStoredSymbol(localStorage.getItem('insight-currency'), NET_SYMBOL)
  );
  // Only USD uses this (convertParts() fixes the native and milli units' own
  // factors); 0 means the USD rate hasn't loaded yet.
  const [factor, setFactor] = useState(0);
  const [bitstamp, setBitstamp] = useState(0);

  const refreshUsdFactor = useCallback(() => {
    getCurrency()
      .then((res) => {
        setBitstamp(res.data.bitstamp);
        if (symbol === 'USD') {
          setFactor(res.data.bitstamp);
        }
      })
      .catch(() => {
        // Leave the rate unset - amounts stay in the native unit.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    refreshUsdFactor();
  }, [refreshUsdFactor]);

  const setCurrency = useCallback((newSymbol) => {
    setSymbol(newSymbol);
    localStorage.setItem('insight-currency', newSymbol);
    if (newSymbol === 'USD') {
      setFactor(0);
      getCurrency()
        .then((res) => {
          setBitstamp(res.data.bitstamp);
          setFactor(res.data.bitstamp);
        })
        .catch(() => {
          // Leave the rate unset - amounts stay in the native unit.
        });
    } else if (newSymbol === 'm' + NET_SYMBOL) {
      setFactor(1000);
    } else {
      setFactor(1);
    }
  }, []);

  const value = {
    symbol,
    factor,
    bitstamp,
    netSymbol: NET_SYMBOL,
    options: currencyOptions(NET_SYMBOL),
    setCurrency,
    getConvertion: (v) => <Amount parts={convertParts(v, {symbol, factor, netSymbol: NET_SYMBOL})} />
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
