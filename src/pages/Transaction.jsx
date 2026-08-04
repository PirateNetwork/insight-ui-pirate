import {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {getTransaction} from '../api/transactions';
import {useCurrency} from '../context/CurrencyContext';
import CopyButton from '../components/CopyButton';
import TxCard from '../components/TxCard';

export default function Transaction() {
  const {t} = useTranslation();
  const {txId} = useParams();
  const navigate = useNavigate();
  const {getConvertion} = useCurrency();
  const [tx, setTx] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTx(null);
    getTransaction(txId)
      .then(setTx)
      .catch((e) => {
        if (e.status === 400) setError('Invalid Transaction ID: ' + txId);
        else if (e.status === 503) setError('Backend Error. ' + e.data);
        else setError('Transaction Not Found');
        navigate('/');
      });
  }, [txId, navigate]);

  return (
    <section>
      {error && <div className="alert alert-danger">{error}</div>}
      {!tx && (
        <div className="progress progress-striped active">
          <div className="progress-bar progress-bar-info" style={{width: '100%'}}>
            <span>{t('Loading Transaction Details')}</span>
          </div>
        </div>
      )}
      {tx && (
        <div>
          <h1>{t('Transaction')}</h1>
          <div className="well well-sm ellipsis">
            <strong>{t('Transaction')}</strong> <span className="txid text-muted">{tx.txid}</span>
            <CopyButton text={tx.txid} />
          </div>
          <h2>{t('Summary')}</h2>
          <table className="table" style={{tableLayout: 'fixed'}}>
            <tbody>
              <tr>
                <td>
                  <strong>{t('Size')}</strong>
                </td>
                <td className="text-muted text-right">{tx.size} (bytes)</td>
              </tr>
              {!!tx.fees && (
                <tr>
                  <td>
                    <strong>{t('Fee Rate')}</strong>
                  </td>
                  <td className="text-muted text-right">{getConvertion((tx.fees * 1000) / tx.size)} per kB</td>
                </tr>
              )}
              <tr>
                <td>
                  <strong>{t('Received Time')}</strong>
                </td>
                <td className="text-muted text-right">{tx.time ? new Date(tx.time * 1000).toLocaleString() : 'N/A'}</td>
              </tr>
              <tr>
                <td>
                  <strong>{t('Mined Time')}</strong>
                </td>
                <td className="text-muted text-right">
                  {tx.blocktime ? new Date(tx.blocktime * 1000).toLocaleString() : 'N/A'}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>{t('Included in Block')}</strong>
                </td>
                <td className="text-muted text-right">
                  {tx.blockhash ? (
                    <div className="ellipsis">
                      <Link to={'/block/' + tx.blockhash}>{tx.blockhash}</Link>
                    </div>
                  ) : (
                    'Unconfirmed'
                  )}
                </td>
              </tr>
              {!!tx.locktime && (
                <tr>
                  <td>
                    <strong>LockTime</strong>
                  </td>
                  <td className="text-muted text-right">{tx.locktime}</td>
                </tr>
              )}
              {tx.isCoinBase && (
                <tr>
                  <td>
                    <strong>Coinbase</strong>
                  </td>
                  <td className="text-muted text-right">
                    <div className="ellipsis">{tx.vin[0].coinbase}</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <h2>{t('Details')}</h2>
          <TxCard tx={tx} />
        </div>
      )}
    </section>
  );
}
