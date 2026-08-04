import {useEffect, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getTransactionsByBlock, getTransactionsByAddress} from '../api/transactions';
import TxCard from './TxCard';

// Ported from legacy/src/js/controllers/transactions.js's load/loadMore
// (pagination) plus views/transaction/list.html - fetches pages of a
// block's or address's transactions and infinite-scrolls for more.
export default function TransactionList({by, value, currentAddr, prependTx}) {
  const {t} = useTranslation();
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(false);
  const pageNumRef = useRef(0);
  const pagesTotalRef = useRef(1);

  function loadMore() {
    if (pageNumRef.current >= pagesTotalRef.current || loading) return;
    setLoading(true);
    const fetcher = by === 'address' ? getTransactionsByAddress(value, pageNumRef.current) : getTransactionsByBlock(value, pageNumRef.current);
    fetcher.then((data) => {
      pagesTotalRef.current = data.pagesTotal;
      pageNumRef.current += 1;
      setTxs((prev) => [...prev, ...data.txs]);
      setLoading(false);
    });
  }

  useEffect(() => {
    setTxs([]);
    pageNumRef.current = 0;
    pagesTotalRef.current = 1;
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [by, value]);

  useEffect(() => {
    function onScroll() {
      const pageHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      if (pageHeight - (window.pageYOffset + clientHeight) < 10) {
        loadMore();
      }
    }
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allTxs = prependTx ? [prependTx, ...txs] : txs;

  return (
    <div>
      {!allTxs.length && !loading && <div className="alert alert-warning">{t('There are no transactions involving this address.')}</div>}
      {allTxs.map((tx) => (
        <TxCard key={tx.txid} tx={tx} currentAddr={currentAddr} />
      ))}
      {loading && (
        <div className="progress progress-striped active">
          <div className="progress-bar progress-bar-info" style={{width: '100%'}}>
            <span>{t('Loading Transactions...')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
