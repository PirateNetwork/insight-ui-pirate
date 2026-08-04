import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {getStatus, getSync} from '../api/status';
import {humanSince} from '../lib/time';
import {useSocket} from '../hooks/useSocket';

export default function Status() {
  const {t} = useTranslation();
  const [sync, setSync] = useState(null);
  const [lastBlock, setLastBlock] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    getSync()
      .then(setSync)
      .catch((e) => setSync({error: 'Could not get sync information' + e.toString()}));
    getStatus('getLastBlockHash').then(setLastBlock);
    getStatus('getInfo').then((d) => setInfo(d.info));
  }, []);

  useSocket((socket) => {
    socket.emit('subscribe', 'sync');
    function onStatus(s) {
      setSync(s);
    }
    socket.on('status', onStatus);
    return () => socket.off('status', onStatus);
  });

  return (
    <section>
      <div className="page-header">
        <h1>{t('Application Status')}</h1>
      </div>
      <div id="status" className="row">
        <div className="col-xs-12 col-md-8">
          <h2>{t('Sync Status')}</h2>
          <table className="table">
            <tbody>
              <tr>
                <td>{t('Sync Progress')}</td>
                <td>
                  <div className="progress">
                    <div
                      className="progress-bar progress-bar-info"
                      role="progressbar"
                      style={{width: (sync && sync.syncPercentage) + '%'}}
                    >
                      {sync && sync.syncPercentage > 0 && (
                        <span>
                          {sync.syncPercentage}% <span>{t('Complete')}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <td>{t('Current Sync Status')}</td>
                <td className="text-right">
                  {sync && !sync.error && <span>{sync.status}</span>}
                  {sync && sync.error && (
                    <span className="text-danger">
                      <span className="glyphicon glyphicon-warning-sign" /> {sync.error}
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td>{t('Start Date')}</td>
                <td className="text-right">
                  {sync && sync.startTs && (
                    <time title={new Date(sync.startTs).toLocaleString()}>{humanSince(sync.startTs / 1000)}</time>
                  )}
                </td>
              </tr>
              {sync && sync.endTs && (
                <tr>
                  <td>{t('Finish Date')}</td>
                  <td className="text-right">
                    <time title={new Date(sync.endTs).toLocaleString()}>{humanSince(sync.endTs / 1000)}</time>
                  </td>
                </tr>
              )}
              <tr>
                <td>{t('Initial Block Chain Height')}</td>
                <td className="text-right">{sync && sync.blockChainHeight}</td>
              </tr>
              <tr>
                <td>{t('Synced Blocks')}</td>
                <td className="text-right">{sync && sync.syncedBlocks}</td>
              </tr>
              <tr>
                <td>{t('Skipped Blocks (previously synced)')}</td>
                <td className="text-right">{sync && sync.skippedBlocks}</td>
              </tr>
              <tr>
                <td>{t('Sync Type')}</td>
                <td className="text-right">{sync && sync.type}</td>
              </tr>
            </tbody>
          </table>

          <h2>{t('Last Block')}</h2>
          <table className="table" style={{tableLayout: 'fixed'}}>
            <tbody>
              <tr>
                <td>{t('Last Block Hash (Komodod)')}</td>
                <td className="text-right ellipsis">
                  {lastBlock && <Link to={'/block/' + lastBlock.lastblockhash}>{lastBlock.lastblockhash}</Link>}
                </td>
              </tr>
              <tr>
                <td>{t('Current Blockchain Tip (insight)')}</td>
                <td className="text-right ellipsis">
                  {lastBlock && <Link to={'/block/' + lastBlock.syncTipHash}>{lastBlock.syncTipHash}</Link>}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="col-xs-12 col-md-4 col-gray">
          <h2>{t('Komodo node information')}</h2>
          <table className="table">
            <tbody>
              <tr>
                <td>{t('Version')}</td>
                <td className="text-right">{info && info.version}</td>
              </tr>
              <tr>
                <td>{t('Protocol version')}</td>
                <td className="text-right">{info && info.protocolversion}</td>
              </tr>
              <tr>
                <td>{t('Blocks')}</td>
                <td className="text-right">
                  {info && <Link to={'/block-index/' + info.blocks}>{info.blocks}</Link>}
                </td>
              </tr>
              <tr>
                <td>{t('Last Notarized Height')}</td>
                <td className="text-right">{info && info.notarized}</td>
              </tr>
              <tr>
                <td>{t('Time Offset')}</td>
                <td className="text-right">{info && info.timeoffset}</td>
              </tr>
              <tr>
                <td>{t('Connections to other nodes')}</td>
                <td className="text-right">{info && info.connections}</td>
              </tr>
              <tr>
                <td>{t('Mining Difficulty')}</td>
                <td className="text-right">{info && info.difficulty}</td>
              </tr>
              <tr>
                <td>{t('Network')}</td>
                <td className="text-right">{info && info.network}</td>
              </tr>
              <tr>
                <td>{t('Proxy setting')}</td>
                <td className="text-right">{info && info.proxy}</td>
              </tr>
              <tr>
                <td>{t('Info Errors')}</td>
                <td className="text-right">{info && info.errors}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
