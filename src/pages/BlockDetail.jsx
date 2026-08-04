import {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {getBlock} from '../api/blocks';
import CopyButton from '../components/CopyButton';
import TransactionList from '../components/TransactionList';

export default function BlockDetail() {
  const {t} = useTranslation();
  const {blockHash} = useParams();
  const navigate = useNavigate();
  const [block, setBlock] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setBlock(null);
    getBlock(blockHash)
      .then(setBlock)
      .catch((e) => {
        if (e.status === 400) setError('Invalid Block Hash: ' + blockHash);
        else if (e.status === 503) setError('Backend Error. ' + e.data);
        else setError('Block Not Found');
        navigate('/');
      });
  }, [blockHash, navigate]);

  return (
    <section>
      {error && <div className="alert alert-danger">{error}</div>}
      {!block && (
        <div className="text-muted">
          <span>{t('Loading Block Information')}</span> <span className="loader-gif" />
        </div>
      )}
      {block && (
        <div>
          <div className="well well-sm ellipsis">
            <strong>BlockHash</strong> <span className="txid text-muted">{block.hash}</span>
            <CopyButton text={block.hash} />
          </div>
          <h2>{t('Summary')}</h2>
          <div className="row">
            <div className="col-md-6">
              <table className="table" style={{tableLayout: 'fixed'}}>
                <tbody>
                  <tr>
                    <td>
                      <strong>{t('Number Of Transactions')}</strong>
                    </td>
                    <td className="text-right text-muted">{block.tx.length}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{t('Height')}</strong>
                    </td>
                    <td className="text-right text-muted">
                      {block.height}{' '}
                      {block.isMainChain ? (
                        <span className="text-success">(Mainship)</span>
                      ) : (
                        <span className="text-danger">
                          <span className="glyphicon glyphicon-warning-sign" /> (Orphaned)
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{t('Block Reward')}</strong>
                    </td>
                    <td className="text-right text-muted">{block.reward}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{t('Timestamp')}</strong>
                    </td>
                    <td className="text-right text-muted">{new Date(block.time * 1000).toLocaleString()}</td>
                  </tr>
                  {block.poolInfo && block.poolInfo.poolName && (
                    <tr>
                      <td>
                        <strong>{t('Mined by')}</strong>
                      </td>
                      <td className="text-right text-muted">
                        <a href={block.poolInfo.url} target="_blank" rel="noreferrer" title={block.poolInfo.poolName}>
                          {block.poolInfo.poolName}
                        </a>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <table className="table" style={{tableLayout: 'fixed'}}>
                <tbody>
                  <tr>
                    <td>
                      <strong>{t('Difficulty')}</strong>
                    </td>
                    <td className="text-right text-muted">{block.difficulty}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Bits</strong>
                    </td>
                    <td className="text-right text-muted">{block.bits}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>{t('Size (bytes)')}</strong>
                    </td>
                    <td className="text-right text-muted">{block.size}</td>
                  </tr>
                  {block.previousblockhash && (
                    <tr>
                      <td>
                        <strong>{t('Previous Block')}</strong>
                      </td>
                      <td className="text-right">
                        <Link to={'/block/' + block.previousblockhash}>{block.height - 1}</Link>
                      </td>
                    </tr>
                  )}
                  {block.nextblockhash && (
                    <tr>
                      <td>
                        <strong>{t('Next Block')}</strong>
                      </td>
                      <td className="text-right">
                        <Link to={'/block/' + block.nextblockhash}>{block.height + 1}</Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {block && (
        <div>
          <h3>{t('Transactions')}</h3>
          <TransactionList by="block" value={block.hash} />
        </div>
      )}
    </section>
  );
}
