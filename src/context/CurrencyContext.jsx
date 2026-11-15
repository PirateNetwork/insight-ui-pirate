import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {getCurrency} from '../api/currency';
import {convert, currencyOptions, normalizeStoredSymbol} from '../lib/currency';

// Pirate Chain's ticker, used as the native-unit currency option.
export const NET_SYMBOL = 'ARRR';

const CurrencyContext = createContext(null);

export function CurrencyProvider({children}) {
  const [symbol, setSymbol] = useState(() =>
    normalizeStoredSymbol(localStorage.getItem('insight-currency'), NET_SYMBOL)
  );
  // Only USD uses this (convert() fixes the native and milli units' own
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
    getConvertion: (v) => convert(v, {symbol, factor, netSymbol: NET_SYMBOL})
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
