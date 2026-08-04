import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {verifyMessage} from '../api/messages';

export default function MessagesVerify() {
  const {t} = useTranslation();
  const [address, setAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('unverified'); // unverified|loading|verified|error
  const [result, setResult] = useState(null);
  const [verifiedAddress, setVerifiedAddress] = useState('');
  const [error, setError] = useState(null);

  const verifiable = !!(address && signature && message);

  async function verify() {
    setStatus('loading');
    setVerifiedAddress(address);
    try {
      const data = await verifyMessage({address, signature, message});
      if (typeof data.result !== 'boolean') {
        setStatus('error');
        setError(null);
        return;
      }
      setStatus('verified');
      setResult(data.result);
    } catch (e) {
      setStatus('error');
      setError(e.data);
    }
  }

  function unverify() {
    setStatus('unverified');
  }

  return (
    <section>
      <div className="page-header">
        <h1>
          <span>{t('Verify signed message')}</span>
        </h1>
      </div>
      <div className="row">
        <div className="col-xs-12 col-md-8">
          <form
            className="form-horizontal"
            onSubmit={(e) => {
              e.preventDefault();
              if (verifiable) verify();
            }}
          >
            <div className="form-group">
              <label htmlFor="verify-message-address" className="col-sm-2 control-label">
                {t('Address')}
              </label>
              <div className="col-sm-10">
                <input
                  type="text"
                  className="form-control"
                  id="verify-message-address"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    unverify();
                  }}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="verify-message-signature" className="col-sm-2 control-label">
                {t('Signature')}
              </label>
              <div className="col-sm-10">
                <input
                  type="text"
                  className="form-control"
                  id="verify-message-signature"
                  value={signature}
                  onChange={(e) => {
                    setSignature(e.target.value);
                    unverify();
                  }}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="verify-message-message" className="col-sm-2 control-label">
                {t('Message')}
              </label>
              <div className="col-sm-10">
                <textarea
                  className="form-control"
                  id="verify-message-message"
                  rows={5}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    unverify();
                  }}
                />
              </div>
            </div>
            <div className="form-group">
              <div className="col-sm-offset-2 col-sm-10">
                <button className="btn btn-default" type="submit" disabled={!verifiable}>
                  {t('Verify')}
                </button>
              </div>
            </div>
          </form>
          {status !== 'unverified' && (
            <div className="row">
              <div className="col-sm-offset-2 col-sm-10">
                {status === 'loading' && <div>{t('Loading...')}</div>}
                {status === 'verified' && result && (
                  <div className="alert alert-success">
                    {t('The message is verifiably from {{verification.address}}.', {verification: {address: verifiedAddress}})}
                  </div>
                )}
                {status === 'verified' && !result && <div className="alert alert-danger">{t('The message failed to verify.')}</div>}
                {status === 'error' && (
                  <div className="alert alert-warning">
                    <p>{t('An error occured in the verification process.')}</p>
                    {error && (
                      <p>
                        <strong>{t('Error message:')}</strong> {JSON.stringify(error)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="col-xs-12 col-md-4 col-gray">
          <p>{t('Komodo comes with a way of signing arbitrary messages.')}</p>
          <p>{t('This form can be used to verify that a message comes from a specific Komodo address.')}</p>
        </div>
      </div>
    </section>
  );
}
