import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {sendRawTransaction} from '../api/transactions';

const HEX_PATTERN = /^[0-9A-Fa-f]+$/;

export default function SendRawTransaction() {
  const {t} = useTranslation();
  const [transaction, setTransaction] = useState('');
  const [status, setStatus] = useState('ready'); // ready|loading|sent|error
  const [txid, setTxid] = useState('');
  const [error, setError] = useState(null);

  const patternError = transaction && !HEX_PATTERN.test(transaction);
  const valid = transaction && !patternError;

  async function send() {
    setStatus('loading');
    try {
      const data = await sendRawTransaction(transaction);
      if (typeof data.txid !== 'string') {
        setStatus('error');
        setError('The transaction was sent but no transaction id was got back');
        return;
      }
      setStatus('sent');
      setTxid(data.txid);
    } catch (e) {
      setStatus('error');
      setError(e.data || 'No error message given (connection error?)');
    }
  }

  return (
    <section>
      <div className="page-header">
        <h1>
          <span>{t('Broadcast Raw Transaction')}</span>
        </h1>
      </div>
      <div className="row">
        <div className="col-xs-12 col-md-8">
          <form
            className="form-horizontal"
            onSubmit={(e) => {
              e.preventDefault();
              if (valid) send();
            }}
          >
            <div className={'form-group' + (patternError ? ' has-error' : '')}>
              <label htmlFor="transaction-rawdata" className="col-sm-2 control-label">
                {t('Raw transaction data')}
              </label>
              <div className="col-sm-10">
                <textarea
                  className="form-control"
                  id="transaction-rawdata"
                  value={transaction}
                  onChange={(e) => setTransaction(e.target.value)}
                  rows={10}
                  required
                />
                {patternError && (
                  <span className="help-block">{t('Raw transaction data must be a valid hexadecimal string.')}</span>
                )}
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-offset-2 col-sm-10">
                <button className="btn btn-default" type="submit" disabled={!valid}>
                  {t('Send transaction')}
                </button>
              </div>
            </div>
          </form>
          {status !== 'ready' && (
            <div className="row">
              <div className="col-sm-offset-2 col-sm-10">
                {status === 'loading' && <div>{t('Loading...')}</div>}
                {status === 'sent' && (
                  <div className="alert alert-success">
                    {t('Transaction succesfully broadcast.')}
                    <br />
                    Transaction id: {txid}
                  </div>
                )}
                {status === 'error' && (
                  <div className="alert alert-warning">
                    {t('An error occured:')}
                    <br />
                    {JSON.stringify(error)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="col-xs-12 col-md-4 col-gray">
          <p>{t('This form can be used to broadcast a raw transaction in hex format over the Komodo network.')}</p>
        </div>
      </div>
    </section>
  );
}
