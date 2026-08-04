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

          {/* eslint-disable-next-line react/no-unknown-property */}
          <coingecko-coin-ticker-widget coin-id="pirate-chain" currency="usd" locale="en" background-color="#c0c0c0" />
        </div>
        <div className="col-xs-12 col-md-4 col-gray">
          <iframe
            width="100%"
            height="400"
            frameBorder="none"
            title="Changelly swap widget"
            src="https://widget.changelly.com?amount=2.777&address=&fromDefault=xmr&toDefault=arrr&theme=default&merchant_id=ej56txho9r4w49lh&payment_id=&v=3"
          >
            Can&apos;t load widget
          </iframe>

          <h2>{t('What is PIRATE?')}</h2>
          <p className="subIntro">
            Pirate (ARRR) is a real privacy coin which takes financial privacy very serious. Pirate (ARRR) is a 100%
            private cryptocurrency. PIRATE uses a privacy protocol that cannot be compromised by other users activity
            on the network.
          </p>
          <p className="subIntro">
            Basic Statistics at{' '}
            <a href="https://explorer.pirate.black/stats" target="_blank" rel="noreferrer">
              <font color="#ff5050">https://explorer.pirate.black/stats</font>
            </a>
          </p>
          <p className="subIntro">
            Pirate Website{' '}
            <a href="https://pirate.black" target="_blank" rel="noreferrer">
              <font color="#ff5050">https://pirate.black</font>
            </a>
          </p>
          <a className="twitter-timeline" href="https://twitter.com/PirateChain" target="_blank" rel="noreferrer">
            Tweets by PirateChain
          </a>
          <div id="powered" className="row">
            <center>
              <img src="/img/pirate.png" width="300px" alt="Pirate Chain" />
              <br />
              <a href="piratechain:zs1sv7m6s76d00pkhyshw05hafgxczuykt3s573fr7ea8sr84x03pwdhdhhqa4sjtd26vf9u8jht64">
                <img src="https://pirate.black/donate-pirate" width="199" height="69" alt="Donate ARRR" />
              </a>
            </center>
          </div>
        </div>
      </div>
    </div>
  );
}
