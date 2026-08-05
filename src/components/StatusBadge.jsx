import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getStatus, getSync} from '../api/status';
import {useBlockRefresh} from '../hooks/useBlockRefresh';

// Mirrors the inline `data-ng-controller="StatusController"` block and
// the header's own block-count tracking (from HeaderController) inside
// legacy/views/includes/header.html - the small "Conn / Height /
// Notarized" status line in the nav bar.
export default function StatusBadge() {
  const {t} = useTranslation();
  const [info, setInfo] = useState(null);
  const [sync, setSync] = useState(null);

  useEffect(() => {
    getStatus('getInfo').then((d) => setInfo(d.info));
    getSync()
      .then(setSync)
      .catch((e) => setSync({error: 'Could not get sync information' + e.toString()}));
  }, []);

  // getInfo/getSync are one-shot RPC snapshots - the server never
  // actually pushes updates for either (the 'block' socket event pirated
  // would drive this from is skipped for every block connected during a
  // resync, and the 'sync'/'status' event this used to subscribe to has
  // no server-side publisher at all, in or out of sync - see
  // useBlockRefresh). Poll both instead of relying on push.
  useBlockRefresh((isCurrent) => {
    getStatus('getInfo').then((d) => {
      if (isCurrent()) setInfo(d.info);
    });
    getSync()
      .then((s) => {
        if (isCurrent()) setSync(s);
      })
      .catch((e) => {
        if (isCurrent()) setSync({error: 'Could not get sync information' + e.toString()});
      });
  });

  return (
    <div className="status">
      <div className="pull-left">
        {sync && sync.error && (
          <span className="t text-danger" title={sync.error}>
            <span className="glyphicon glyphicon-warning-sign" /> ERROR
          </span>
        )}
        {sync && sync.status === 'syncing' && (
          <span className="t" title={`${sync.syncedBlocks} / ${sync.blockChainHeight} synced. ${sync.skippedBlocks || 0} skipped`}>
            <span className="glyphicon glyphicon-refresh icon-rotate" /> {sync.syncPercentage}%
          </span>
        )}
        {sync && sync.status === 'finished' && (
          <span className="glyphicon glyphicon-ok" title="Historic sync finished" />
        )}
      </div>
      &nbsp; &middot;
      <span>
        <strong>{t('Conn')}</strong> {info && info.connections}
      </span>{' '}
      &middot;
      <strong>{t('Height')}</strong> {info && info.blocks} &middot;
      <strong>{t('Notarized')}</strong> {info && info.notarized}
    </div>
  );
}
