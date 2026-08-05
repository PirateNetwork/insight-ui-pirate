import {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {getBlocks} from '../api/blocks';
import {humanSinceDay} from '../lib/time';

export default function Blocks() {
  const {t} = useTranslation();
  const {blockDate, startTimestamp} = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    setLoading(true);
    getBlocks({blockDate, startTimestamp}).then((res) => {
      setLoading(false);
      setBlocks(res.blocks);
      setPagination(res.pagination);
    });
  }, [blockDate, startTimestamp]);

  const detail = blockDate ? 'On ' + blockDate : '';
  let before = '';
  if (startTimestamp) {
    const d = new Date(startTimestamp * 1000);
    const m = d.getMinutes();
    before = ' before ' + d.getHours() + ':' + (m < 10 ? '0' + m : m);
  }

  return (
    <div className="row">
      <div className="col-xs-12 col-md-3 col-gray col-gray-fixed">
        <div className="block-id">
          <div className="icon-block text-center">
            <span className="glyphicon glyphicon-list" />
            <h3>
              <span>{t('Blocks')}</span> <br />
              <span>{t('mined on:')}</span>
            </h3>
          </div>
        </div>
        <p className="lead text-center m20v">
          {pagination ? pagination.current : ''} UTC
          <input
            type="date"
            className="btn btn-primary btn-xs"
            onChange={(e) => {
              if (e.target.value) navigate('/blocks-date/' + e.target.value);
            }}
          />
        </p>
        {!pagination && <div className="m20v text-center text-muted">{t('Loading Selected Date...')}</div>}
        {pagination && (
          <div>
            {pagination.isToday && !loading && <p className="text-center m20v">{t('Today')}</p>}
            {!pagination.isToday && !loading && (
              <p className="text-center m20v">{humanSinceDay(pagination.currentTs)}</p>
            )}
            <div className="m50v text-center">
              <Link className="btn btn-primary" to={'/blocks-date/' + pagination.prev}>
                <small>&larr; {pagination.prev}</small>
              </Link>
              {!pagination.isToday && (
                <Link className="btn btn-primary" to={'/blocks-date/' + pagination.next}>
                  <small>{pagination.next} &rarr;</small>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="col-xs-12 col-md-9">
        <div className="page-header">
          <h1>
            <span>{t('Blocks')}</span>{' '}
            <small>
              <span>{t('by date.')}</span> {detail} {before}
            </small>
          </h1>
        </div>
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <th>{t('Height')}</th>
              <th>{t('Timestamp')}</th>
              <th className="text-right">{t('Transactions')}</th>
              <th className="text-right hidden-xs">{t('Mined by')}</th>
              <th className="text-right">{t('Size')}</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5}>
                  <span>{t('Waiting for blocks...')}</span>
                </td>
              </tr>
            )}
            {blocks.map((b) => (
              <tr className="fader" key={b.hash}>
                <td>
                  <Link to={'/block/' + b.hash}>{b.height}</Link>
                </td>
                <td>{new Date(b.time * 1000).toLocaleString()}</td>
                <td className="text-right">{b.txlength}</td>
                <td className="text-right hidden-xs">
                  {b.poolInfo && b.poolInfo.poolName && (
                    <a href={b.poolInfo.url} title={b.poolInfo.poolName} target="_blank" rel="noreferrer">
                      {b.poolInfo.poolName}
                    </a>
                  )}
                </td>
                <td className="text-right">{b.size}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {pagination && pagination.more && (
          <div>
            <Link className="btn btn-primary" to={'/blocks-date/' + pagination.current}>
              Lastest block from date
            </Link>
            <Link className="btn btn-primary" to={'/blocks-date/' + pagination.current + '/' + pagination.moreTs}>
              Older blocks from this date
            </Link>
          </div>
        )}
        {!blocks.length && !loading && <h2 className="text-center text-muted">{t('No blocks yet.')}</h2>}
      </div>
    </div>
  );
}
