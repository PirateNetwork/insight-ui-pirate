import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {QRCodeSVG} from 'qrcode.react';
import {getAddress} from '../api/address';
import {useCurrency} from '../context/CurrencyContext';
import {useSocket} from '../hooks/useSocket';
import CopyButton from '../components/CopyButton';
import TransactionList from '../components/TransactionList';

export default function Address() {
  const {t} = useTranslation();
  const {addrStr} = useParams();
  const navigate = useNavigate();
  const {getConvertion} = useCurrency();
  const [address, setAddress] = useState(null);
  const [error, setError] = useState(null);
  const [newTx, setNewTx] = useState(null);

  useEffect(() => {
    setAddress(null);
    getAddress(addrStr)
      .then(setAddress)
      .catch((e) => {
        if (e.status === 400) setError('Invalid Address: ' + addrStr);
        else if (e.status === 503) setError('Backend Error. ' + e.data);
        else setError('Address Not Found');
        navigate('/');
      });
  }, [addrStr, navigate]);

  useSocket((socket) => {
    socket.emit('subscribe', 'bitcoind/addresstxid', [addrStr]);
    function onAddressTx(data) {
      if (data.address === addrStr) {
        setNewTx(data.txid);
        const beep = new Audio('/sound/transaction.mp3');
        beep.play().catch(() => {});
      }
    }
    socket.on('bitcoind/addresstxid', onAddressTx);
    return () => {
      socket.emit('unsubscribe', 'bitcoind/addresstxid', [addrStr]);
      socket.off('bitcoind/addresstxid', onAddressTx);
    };
  });

  return (
    <section>
      {error && <div className="alert alert-danger">{error}</div>}
      <h1>
        <span>{t('Address')}</span>{' '}
        {address && <small>{getConvertion(address.balance)}</small>}
      </h1>
      {!address && (
        <div className="text-muted">
          <span>{t('Loading Address Information')}</span> <span className="loader-gif" />
        </div>
      )}
      {address && (
        <div>
          <div className="well well-sm ellipsis">
            <strong>{t('Address')}</strong> <span className="text-muted">{address.addrStr}</span>
            <CopyButton text={address.addrStr} />
          </div>
          <h2>{t('Summary')} <small>confirmed</small></h2>
          <div className="row">
            <div className="col-md-10">
              <table className="table">
                <tbody>
                  <tr>
                    <td>
                      <strong>{t('Total Received')}</strong>
                    </td>
                    <td className="ellipsis text-right">{getConvertion(address.totalReceived)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{t('Total Sent')}</strong>
                    </td>
                    <td className="ellipsis text-right">{getConvertion(address.totalSent)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{t('Final Balance')}</strong>
                    </td>
                    <td className="ellipsis text-right">{getConvertion(address.balance)}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{t('No. Transactions')}</strong>
                    </td>
                    <td className="ellipsis text-right">{address.txApperances}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="col-md-2 text-center">
              <QRCodeSVG size={160} value={address.addrStr} />
            </div>
          </div>
          {!!address.unconfirmedTxApperances && (
            <div>
              <h3>{t('Unconfirmed')}</h3>
              <table className="table">
                <tbody>
                  <tr>
                    <td className="small">{t('Unconfirmed Txs Balance')}</td>
                    <td className="address ellipsis text-right">{getConvertion(address.unconfirmedBalance)}</td>
                  </tr>
                  <tr>
                    <td className="small">{t('No. Transactions')}</td>
                    <td className="address ellipsis text-right">{address.unconfirmedTxApperances}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {address && (
        <div>
          <h2>{t('Transactions')}</h2>
          <TransactionList by="address" value={address.addrStr} currentAddr={address.addrStr} key={newTx} />
        </div>
      )}
    </section>
  );
}
