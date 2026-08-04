import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getStatus, getSync} from '../api/status';
import {getBlock} from '../api/blocks';
import {useSocket} from '../hooks/useSocket';

// Mirrors the inline `data-ng-controller="StatusController"` block and
// the header's own block-count tracking (from HeaderController) inside
// legacy/views/includes/header.html - the small "Conn / Height /
// Notarized" status line in the nav bar.
export default function StatusBadge() {
  const {t} = useTranslation();
  const [info, setInfo] = useState(null);
  const [sync, setSync] = useState(null);
  const [totalBlocks, setTotalBlocks] = useState(null);

  useEffect(() => {
    getStatus('getInfo').then((d) => setInfo(d.info));
    getSync()
      .then(setSync)
      .catch((e) => setSync({error: 'Could not get sync information' + e.toString()}));
  }, []);

  useSocket((socket) => {
    socket.emit('subscribe', 'sync');
    function onStatus(s) {
      setSync(s);
    }
    socket.on('status', onStatus);

    socket.emit('subscribe', 'inv');
    function onBlock(block) {
      getBlock(block.toString()).then((b) => setTotalBlocks(b.height));
    }
    socket.on('block', onBlock);

    return () => {
      socket.off('status', onStatus);
      socket.off('block', onBlock);
    };
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
      <strong>{t('Height')}</strong> {totalBlocks ?? (info && info.blocks)} &middot;
      <strong>{t('Notarized')}</strong> {info && info.notarized}
    </div>
  );
}
