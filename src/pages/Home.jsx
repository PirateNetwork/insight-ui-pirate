import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useCurrency} from '../context/CurrencyContext';
import {useRecentActivity} from '../context/RecentActivityContext';
import {humanSince, intlLocale} from '../lib/time';
import SearchBox from '../components/SearchBox';
import UpgradeBanner from '../components/UpgradeBanner';

export default function Home() {
  const {t, i18n} = useTranslation();
  const {getConvertion} = useCurrency();
  const {blocks, txs} = useRecentActivity();

  return (
    <>
      <UpgradeBanner />
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
              {blocks.map((b) => (
                <tr className="fader" key={b.hash}>
                  <td>
                    <Link to={'/block/' + b.hash}>{b.height}</Link>
                  </td>
                  <td>
                    <span className="ellipsis">{humanSince(b.time, intlLocale(i18n.language))}</span>
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
          {!blocks.length && <p className="table-empty">{t('Waiting for blocks...')}</p>}
          <div className="btn-more">
            <Link to="/blocks" className="btn btn-default">
              {t('See all blocks')}
            </Link>
          </div>

          <h2>{t('Latest Transactions')}</h2>

          <table className="table table-hover table-striped" style={{tableLayout: 'fixed'}}>
            <colgroup>
              <col />
              <col className="col-value" />
            </colgroup>
            <thead>
              <tr>
                <th>{t('Hash')}</th>
                <th className="text-right">{t('Value Out')}</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((tx) => (
                <tr className="fader" key={tx.txid}>
                  <td>
                    <Link className="ellipsis hash" to={'/tx/' + tx.txid}>
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
          {!txs.length && <p className="table-empty">{t('Waiting for transactions...')}</p>}
        </div>
        <aside className="col-xs-12 col-md-4">
          <div className="side-card">
            <h2>{t('What is Pirate Chain?')}</h2>
            <p className="subIntro">
              {t(
                'Pirate Chain (ARRR) is a privacy coin which focuses on financial privacy. Pirate Chain (ARRR) is a 100% private cryptocurrency. Pirate Chain cannot be compromised by other users activity on the network where sender and receiver addresses and amounts remain private.'
              )}
            </p>
            <ul className="side-links">
              <li>
                <Link to="/stats">{t('Network statistics')}</Link>
              </li>
              <li>
                <a href="https://piratechain.com" target="_blank" rel="noopener noreferrer">
                  piratechain.com
                </a>
              </li>
              <li>
                <a href="https://x.com/PirateChain" target="_blank" rel="noopener noreferrer">
                  @PirateChain {t('on X')}
                </a>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
