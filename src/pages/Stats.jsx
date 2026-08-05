import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getChainStats} from '../api/status';
import {getCurrency} from '../api/currency';
import {formatSolutionRate} from '../lib/format';

const POLL_INTERVAL = 20000;

// Pirate Chain's total emission cap - a fixed, publicly documented
// protocol constant (see piratechain.com), not something derivable from
// a single RPC field (ASSETCHAINS_SUPPLY is the genesis premine, not
// the final cap, and computing the cap would mean summing the entire
// multi-era subsidy schedule).
const MAX_SUPPLY = 200000000;

function round(value, decimals) {
  if (value == null || isNaN(value)) return null;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// Recreates explorer.piratechain.com/stats using only data this node
// can actually produce itself: chain-stats RPCs (getinfo, getblocksubsidy,
// gettxoutsetinfo, getnetworksolps) plus the existing USD price feed.
// Price/market cap in BTC and KMD, and the anonset/shielded-tx totals
// from that reference page, aren't included - there's no RPC on this
// daemon for chain-wide shielded-pool stats (z_gettotalbalance only
// reports this node's own wallet), and BTC/KMD cross-rates would need
// new external price feeds this app doesn't otherwise have.
export default function Stats() {
  const {t} = useTranslation();
  const [stats, setStats] = useState(null);
  const [priceUsd, setPriceUsd] = useState(null);
  const [marketCapUsd, setMarketCapUsd] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    function refresh() {
      getChainStats()
        .then((d) => {
          setStats(d);
          setError(false);
        })
        .catch(() => setError(true));
      // CoinGecko reports market cap directly (with include_market_cap=true)
      // rather than it needing to be computed from this node's own
      // currently-observed circulating supply.
      getCurrency().then((d) => {
        setPriceUsd(d.data.bitstamp);
        setMarketCapUsd(d.data.marketCapUsd);
      });
    }
    refresh();
    const interval = setInterval(refresh, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <section>
      <div className="page-header">
        <h1>{t('Stats')}</h1>
      </div>

      {error && <div className="alert alert-danger">{t("Can't load chain stats.")}</div>}

      {stats && (
        <div className="row">
          <div className="col-xs-12 col-md-8">
            <h2>{t('Chain')}</h2>
            <table className="table">
              <tbody>
                <tr>
                  <td>{t('Last Height')}</td>
                  <td className="text-right">{stats.height}</td>
                </tr>
                <tr>
                  <td>{t('Current Reward')}</td>
                  <td className="text-right">{stats.reward != null ? stats.reward + ' ARRR' : ''}</td>
                </tr>
                <tr>
                  <td>{t('Next Block Reward')}</td>
                  <td className="text-right">{stats.nextReward != null ? stats.nextReward + ' ARRR' : ''}</td>
                </tr>
                <tr>
                  <td>{t('Supply')}</td>
                  <td className="text-right">{stats.supply != null ? Math.round(stats.supply).toLocaleString() : ''}</td>
                </tr>
                <tr>
                  <td>{t('Max Supply')}</td>
                  <td className="text-right">{MAX_SUPPLY.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>{t('Next Halving')}</td>
                  <td className="text-right">
                    {stats.nextHalvingHeight}
                    {stats.nextHalvingEta && (
                      <>
                        {' '}
                        <span className="text-muted">({new Date(stats.nextHalvingEta).toUTCString()})</span>
                      </>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="col-xs-12 col-md-4 col-gray">
            <h2>{t('Network')}</h2>
            <table className="table">
              <tbody>
                <tr>
                  <td>{t('NetHash')}</td>
                  <td className="text-right">{formatSolutionRate(stats.networkSolps)}</td>
                </tr>
                <tr>
                  <td>{t('Difficulty')}</td>
                  <td className="text-right">{round(stats.difficulty, 2)}</td>
                </tr>
              </tbody>
            </table>

            <h2>{t('Price')}</h2>
            <table className="table">
              <tbody>
                <tr>
                  <td>{t('Price (USD)')}</td>
                  <td className="text-right">{priceUsd != null ? '$' + round(priceUsd, 6) : ''}</td>
                </tr>
                <tr>
                  <td>{t('Market Cap (USD)')}</td>
                  <td className="text-right">
                    {marketCapUsd != null ? '$' + Math.round(marketCapUsd).toLocaleString() : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
