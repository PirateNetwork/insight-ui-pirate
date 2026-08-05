import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getPeers} from '../api/status';
import {groupPeers, NETWORK_TABS} from '../lib/peers';
import {humanSince} from '../lib/time';
import CopyButton from '../components/CopyButton';

const POLL_INTERVAL = 15000;

function PeerTable({title, peers, emptyText, t}) {
  return (
    <div className="m20v">
      <h2>{title}</h2>
      {!peers.length && <p className="text-muted">{emptyText}</p>}
      {!!peers.length && (
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <th>{t('Address')}</th>
              <th>{t('Client')}</th>
              <th className="text-right">{t('Connected')}</th>
              <th className="text-right">{t('Starting Height')}</th>
            </tr>
          </thead>
          <tbody>
            {peers.map((peer) => (
              <tr key={peer.id ?? peer.addr}>
                <td>
                  <span className="ellipsis">
                    {peer.addr}
                    <CopyButton text={peer.addr} />
                  </span>
                </td>
                <td>
                  <span className="ellipsis">{peer.subver}</span>
                </td>
                <td className="text-right">{peer.conntime ? humanSince(peer.conntime) : ''}</td>
                <td className="text-right">{peer.startingheight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// Lists connected peers from getpeerinfo, grouped by network (IPv4/IPv6/
// Tor/I2P) and by direction, so a new user having trouble connecting can
// find addresses worth adding as their own -addnode. Outbound peers are
// listed first within each tab since we successfully dialed out to
// them, proving their address is reachable; inbound peers merely
// connected to us, which says nothing about whether their own address
// accepts incoming connections, so they're broken out separately.
export default function Peers() {
  const {t} = useTranslation();
  const [peers, setPeers] = useState(null);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState(NETWORK_TABS[0].key);

  useEffect(() => {
    function refresh() {
      getPeers()
        .then((d) => {
          setPeers(d.peers);
          setError(false);
        })
        .catch(() => setError(true));
    }
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const groups = groupPeers(peers);
  const active = groups[activeTab];

  return (
    <section>
      <div className="page-header">
        <h1>{t('Peers')}</h1>
      </div>

      <p className="text-muted">
        {t(
          'Peers this node is currently connected to, grouped by network. Outbound addresses are known-reachable and safe to add as your own addnode; inbound peers may not accept incoming connections themselves.'
        )}
      </p>

      {error && <div className="alert alert-danger">{t("Can't load peer list.")}</div>}

      <ul className="nav nav-tabs">
        {NETWORK_TABS.map(({key, label}) => (
          <li key={key} className={activeTab === key ? 'active' : ''}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab(key);
              }}
            >
              {label} <span className="badge">{groups[key].outbound.length + groups[key].inbound.length}</span>
            </a>
          </li>
        ))}
      </ul>

      {peers === null && !error && <p className="text-muted m20v">{t('Loading peers...')}</p>}

      {peers !== null && (
        <div className="m20v">
          <PeerTable title={t('Outbound')} peers={active.outbound} emptyText={t('No outbound peers on this network.')} t={t} />
          <PeerTable title={t('Inbound')} peers={active.inbound} emptyText={t('No inbound peers on this network.')} t={t} />
        </div>
      )}
    </section>
  );
}
