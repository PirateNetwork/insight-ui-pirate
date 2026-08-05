import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {getCurrency} from '../api/currency';
import {convert} from '../lib/currency';

// This fork's coin ticker, used as the "native unit" currency option -
// explorer.piratechain.com displays amounts as e.g. "0.25 PIRATE", not
// the Komodo-forked codebase's original 'KMD'.
export const NET_SYMBOL = 'PIRATE';

const CurrencyContext = createContext(null);

export function CurrencyProvider({children}) {
  const [symbol, setSymbol] = useState(
    localStorage.getItem('insight-currency') || NET_SYMBOL
  );
  const [factor, setFactor] = useState(1);
  const [bitstamp, setBitstamp] = useState(0);

  const refreshUsdFactor = useCallback(() => {
    getCurrency().then((res) => {
      setBitstamp(res.data.bitstamp);
      if (symbol === 'USD') {
        setFactor(res.data.bitstamp);
      }
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
      getCurrency().then((res) => {
        setBitstamp(res.data.bitstamp);
        setFactor(res.data.bitstamp);
      });
    } else if (newSymbol === 'm' + NET_SYMBOL) {
      setFactor(1000);
    } else if (newSymbol === 'bits') {
      setFactor(1000000);
    } else {
      setFactor(1);
    }
  }, []);

  const value = {
    symbol,
    factor,
    bitstamp,
    netSymbol: NET_SYMBOL,
    setCurrency,
    getConvertion: (v) => convert(v, {symbol, factor, netSymbol: NET_SYMBOL})
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
