import {createContext, useCallback, useContext, useEffect, useState} from 'react';
import {getBlocks} from '../api/blocks';
import {useSocket} from '../hooks/useSocket';
import {useBlockRefresh} from '../hooks/useBlockRefresh';

const BLOCKS_DISPLAYED = 5;
const TRANSACTION_DISPLAYED = 10;

const RecentActivityContext = createContext(null);

// Lives at the App level (mounted once, alongside CurrencyProvider) so
// the home page's "Latest Blocks"/"Latest Transactions" feed keeps
// running in the background instead of being torn down and restarted
// every time you navigate away from and back to "/". This matters most
// for the transactions side: there's no REST endpoint for "recent
// transactions across the whole chain" (insight-api-pirate's /txs
// requires a block hash or address), so that list can only ever be
// built up by accumulating live socket 'tx' events over time - if it
// lived in Home's own state, leaving the page reset it to empty and
// there was no way to backfill it on return.
export function RecentActivityProvider({children}) {
  const [blocks, setBlocks] = useState([]);
  const [txs, setTxs] = useState([]);

  const refreshBlocks = useCallback((isCurrent) => {
    getBlocks({limit: BLOCKS_DISPLAYED}).then((res) => {
      if (!isCurrent || isCurrent()) setBlocks(res.blocks);
    });
  }, []);

  useEffect(() => {
    refreshBlocks();
  }, [refreshBlocks]);

  useSocket((socket) => {
    socket.emit('subscribe', 'inv');
    function onTx(tx) {
      setTxs((prev) => [tx, ...prev].slice(0, TRANSACTION_DISPLAYED));
    }
    socket.on('tx', onTx);
    return () => socket.off('tx', onTx);
  });

  // Blocks can be refetched from scratch (unlike txs above), but still
  // needs the same polling fallback as everywhere else - pirated skips
  // the ZMQ notification 'block' relies on for every block connected
  // during a resync (see useBlockRefresh).
  useBlockRefresh(refreshBlocks);

  return <RecentActivityContext.Provider value={{blocks, txs}}>{children}</RecentActivityContext.Provider>;
}

export function useRecentActivity() {
  return useContext(RecentActivityContext);
}
