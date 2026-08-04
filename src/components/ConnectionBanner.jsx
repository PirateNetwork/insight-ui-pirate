import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getPeerSync} from '../api/status';
import {useSocket} from '../hooks/useSocket';

// Mirrors legacy/src/js/controllers/connection.js - shows a banner when
// any of the three connections (browser<->internet, browser<->insight
// server, insight server<->pirated) drops.
export default function ConnectionBanner() {
  const {t} = useTranslation();
  const [apiOnline, setApiOnline] = useState(true);
  const [serverOnline, setServerOnline] = useState(true);
  const [clientOnline, setClientOnline] = useState(navigator.onLine);
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');

  useEffect(() => {
    getPeerSync()
      .then((peer) => {
        setApiOnline(peer.connected);
        setHost(peer.host);
        setPort(peer.port);
      })
      .catch(() => setApiOnline(false));

    function onOffline() {
      setClientOnline(false);
    }
    function onOnline() {
      setClientOnline(true);
    }
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  useSocket((socket) => {
    setServerOnline(true);
    function onDisconnect() {
      setServerOnline(false);
    }
    socket.on('disconnect', onDisconnect);

    function onStatus(sync) {
      setApiOnline(sync.status !== 'aborted' && sync.status !== 'error');
    }
    socket.emit('subscribe', 'sync');
    socket.on('status', onStatus);

    return () => {
      socket.off('disconnect', onDisconnect);
      socket.off('status', onStatus);
    };
  });

  if (apiOnline && serverOnline && clientOnline) {
    return null;
  }

  return (
    <div className="connection-status container">
      <div className="alert alert-danger">
        <strong>{t('Error!')}</strong>
        {!apiOnline && (
          <p>
            {t("Can't connect to pirated to get live updates from the p2p network. (Tried connecting to pirated at {{host}}:{{port}} and failed.)", {host, port})}
          </p>
        )}
        {!serverOnline && <p>{t("Can't connect to insight server. Attempting to reconnect...")}</p>}
        {!clientOnline && <p>{t("Can't connect to internet. Please, check your connection.")}</p>}
      </div>
    </div>
  );
}
