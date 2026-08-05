import {useCallback, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {getBlocks} from '../api/blocks';
import {useSocket} from '../hooks/useSocket';
import {useCurrency} from '../context/CurrencyContext';
import {humanSince} from '../lib/time';
import SearchBox from '../components/SearchBox';

const TRANSACTION_DISPLAYED = 10;
const BLOCKS_DISPLAYED = 5;

export default function Home() {
  const {t} = useTranslation();
  const {getConvertion} = useCurrency();
  const [blocks, setBlocks] = useState([]);
  const [txs, setTxs] = useState([]);

  const refreshBlocks = useCallback(() => {
    getBlocks({limit: BLOCKS_DISPLAYED}).then((res) => setBlocks(res.blocks));
  }, []);

  useEffect(() => {
    refreshBlocks();
  }, [refreshBlocks]);

  useSocket((socket) => {
    socket.emit('subscribe', 'inv');

    function onTx(tx) {
      setTxs((prev) => [tx, ...prev].slice(0, TRANSACTION_DISPLAYED));
    }
    function onBlock() {
      refreshBlocks();
    }
    socket.on('tx', onTx);
    socket.on('block', onBlock);

    return () => {
      socket.off('tx', onTx);
      socket.off('block', onBlock);
    };
  });

  return (
    <div className="container">
      <div id="home" className="row">
        <div className="col-xs-12 col-md-8">
          <div id="search-form-mobile" className="visible-xs">
            <SearchBox inputId="search-mobile" />
          </div>

          <h1>{t('Latest Blocks')}</h1>
          <table className="table table-hover table-striped" style={{tableLayout: 'fixed'}}>
            <thead>
              <tr>
                <th>{t('Height')}</th>
                <th>{t('Age')}</th>
                <th className="text-right">
                  <span className="ellipsis">{t('Transactions')}</span>
                </th>
                <th className="text-right hidden-xs">
                  <span className="ellipsis">{t('Mined by')}</span>
                </th>
                <th className="text-right">{t('Size')}</th>
              </tr>
            </thead>
            <tbody>
              {!blocks.length && (
                <tr>
                  <td colSpan={4}>{t('Waiting for blocks...')}</td>
                </tr>
              )}
              {blocks.map((b) => (
                <tr className="fader" key={b.hash}>
                  <td>
                    <Link to={'/block/' + b.hash}>{b.height}</Link>
                  </td>
                  <td>
                    <span className="ellipsis">{humanSince(b.time)}</span>
                  </td>
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
          <div className="btn-more">
            <Link to="/blocks" className="btn btn-default">
              {t('See all blocks')}
            </Link>
          </div>

          <h2>{t('Latest Transactions')}</h2>

          <table className="table table-hover table-striped" style={{tableLayout: 'fixed'}}>
            <thead>
              <tr>
                <th>Hash</th>
                <th className="text-right">{t('Value Out')}</th>
              </tr>
            </thead>
            <tbody>
              {!txs.length && (
                <tr>
                  <td colSpan={3}>{t('Waiting for transactions...')}</td>
                </tr>
              )}
              {txs.map((tx) => (
                <tr className="fader" key={tx.txid}>
                  <td>
                    <Link className="ellipsis" to={'/tx/' + tx.txid}>
                      {tx.txid}
                    </Link>
                  </td>
                  <td className="text-right">
                    <span className="ellipsis">{getConvertion(tx.valueOut)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-xs-12 col-md-4 col-gray">
          <h2>{t('What is PIRATE?')}</h2>
          <p className="subIntro">
            Pirate Chain (ARRR) is a privacy coin which focuses on financial privacy. Pirate Chain (ARRR) is a 100%
            private cryptocurrency. Pirate Chain cannot be compromised by other users activity on the network where
            sender and receiver addresses and amounts remain private.
          </p>
          <p className="subIntro">
            Basic Statistics at{' '}
            <a href="https://explorer.piratechain.com/stats" target="_blank" rel="noreferrer">
              https://explorer.piratechain.com/stats
            </a>
          </p>
          <p className="subIntro">
            Pirate Website{' '}
            <a href="https://piratechain.com" target="_blank" rel="noreferrer">
              https://piratechain.com
            </a>
          </p>
          <a className="twitter-timeline" href="https://twitter.com/PirateChain" target="_blank" rel="noreferrer">
            Tweets by PirateChain
          </a>
          <div id="powered" className="row">
            <center>
              <img src="/img/logo-mark.svg" width="140px" alt="Pirate Chain" />
            </center>
          </div>
        </div>
      </div>
    </div>
  );
}
