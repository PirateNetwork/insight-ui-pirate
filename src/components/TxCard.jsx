import {useState} from 'react';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useCurrency} from '../context/CurrencyContext';
import {aggregateItems, computePoolFlows} from '../lib/transactions';
import CopyButton from './CopyButton';

const POOL_LABELS = {
  transparent: 'Transparent',
  sprout: 'Sprout',
  sapling: 'Sapling',
  ironwood: 'Ironwood'
};

function poolCountLabel(t, pool) {
  switch (pool.key) {
    case 'transparent':
      return pool.counts.in + ' ' + t('in') + ', ' + pool.counts.out + ' ' + t('out');
    case 'sprout':
      return pool.counts.joinsplits + ' ' + t('joinsplit(s)');
    case 'sapling':
      return pool.counts.spends + ' ' + t('spend(s)') + ', ' + pool.counts.outputs + ' ' + t('output(s)');
    case 'ironwood':
      return pool.counts.actions + ' ' + t('action(s)');
    default:
      return '';
  }
}

// Ported from legacy/views/transaction/tx.html. The legacy template also
// paginated each vin/vout list 5-at-a-time with its own "show more"
// state and supported deep-linking to a single highlighted vin/vout via
// the /tx/:txId/:v_type/:v_index route - this port keeps all the same
// underlying data (addresses, values, spent status, shielded-pool
// summary, scriptSig/scriptPubKey detail) but shows the full list behind
// a single expand toggle rather than replicating that per-section
// pagination and highlight behavior.
export default function TxCard({tx, currentAddr}) {
  const {t} = useTranslation();
  const {getConvertion} = useCurrency();
  const [expanded, setExpanded] = useState(false);

  const vinSimple = aggregateItems(tx.vin);
  const voutSimple = aggregateItems(tx.vout);
  const hasIronwood =
    tx.ironwood && ((tx.ironwood.actions && tx.ironwood.actions.length > 0) || Number(tx.ironwood.valueBalance));
  const hasShielded =
    tx.bindingSig || (tx.vjoinsplit && tx.vjoinsplit.length > 0) ||
    (tx.spendDescs && tx.spendDescs.length > 0) || (tx.outputDescs && tx.outputDescs.length > 0) ||
    hasIronwood;
  const {sources: poolSources, destinations: poolDestinations, neutral: poolNeutral} = computePoolFlows(tx);

  return (
    <div className="block-tx">
      <div className="line-bot row">
        <div className="col-xs-7 col-md-8">
          <div className="ellipsis">
            <a
              className="btn-expand"
              title="Show/Hide items details"
              onClick={() => setExpanded(!expanded)}
              style={{cursor: 'pointer'}}
            >
              <span className={'glyphicon ' + (expanded ? 'glyphicon-minus-sign' : 'glyphicon-plus-sign')} />
            </a>{' '}
            <Link to={'/tx/' + tx.txid}>{tx.txid}</Link>
            <CopyButton text={tx.txid} />
          </div>
        </div>
        <div className="col-xs-5 col-md-4 text-right text-muted">
          {tx.firstSeenTs && (
            <div>
              <span>{t('first seen at')}</span> <time>{new Date(tx.firstSeenTs * 1000).toLocaleString()}</time>
            </div>
          )}
          {tx.blocktime && !tx.firstSeenTs && (
            <div>
              <span>{t('mined')}</span> <time>{new Date(tx.time * 1000).toLocaleString()}</time>
            </div>
          )}
        </div>
      </div>

      <div className="row line-mid">
        <div className="col-md-12">
          {!hasShielded && (
            <div className="row">
              <div className="col-md-12 transaction-vin-vout">
                <div className="ellipsis">
                  <span>
                    No Shielded Spends and Outputs{' '}
                    <a
                      href="https://pirate.black/files/whitepaper/The_Pirate_Code_V1.0.pdf"
                      title="Pirate chain only allows shielded transactions apart from mining rewards and notarizations."
                      target="_blank"
                      rel="noreferrer"
                    >
                      <i>(Read WP section dPOW why this is transparent)</i>
                    </a>
                  </span>
                </div>
              </div>
            </div>
          )}
          {hasShielded && (poolSources.length > 0 || poolDestinations.length > 0 || poolNeutral.length > 0) && (
            <div className="row">
              <div className="panel panel-default">
                <div className="panel-body transaction-vin-vout">
                  <div className="row">
                    <div className="col-md-5 col-xs-12">
                      {poolSources.length === 0 && (
                        <div className="ellipsis text-muted text-center">{t('No net pool outflow')}</div>
                      )}
                      {poolSources.map((pool) => (
                        <div className="ellipsis" key={pool.key}>
                          <span className="pull-right btc-value">{getConvertion(pool.amount)}</span>
                          <strong>{t(POOL_LABELS[pool.key])}</strong>{' '}
                          <span className="text-muted small">{poolCountLabel(t, pool)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="col-md-2 col-xs-12 text-center">
                      <span className="lead glyphicon glyphicon-chevron-right text-muted" />
                    </div>
                    <div className="col-md-5 col-xs-12">
                      {poolDestinations.length === 0 && (
                        <div className="ellipsis text-muted text-center">{t('No net pool inflow')}</div>
                      )}
                      {poolDestinations.map((pool) => (
                        <div className="ellipsis" key={pool.key}>
                          <span className="pull-right btc-value">{getConvertion(pool.amount)}</span>
                          <strong>{t(POOL_LABELS[pool.key])}</strong>{' '}
                          <span className="text-muted small">{poolCountLabel(t, pool)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {poolNeutral.length > 0 && (
                    <div className="row" style={{marginTop: '0.5em'}}>
                      <div className="col-md-12 text-muted small">
                        {poolNeutral.map((pool) => (
                          <div className="ellipsis" key={pool.key}>
                            {t(POOL_LABELS[pool.key])}: {poolCountLabel(t, pool)} ({t('no net flow')})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="row line-mid">
        <div className="col-md-5">
          {tx.vin.length === 0 && (
            <div className="transaction-vin-vout ellipsis">
              <span>{t('No Inputs')}</span>
            </div>
          )}
          {tx.vin.length !== 0 && tx.isCoinBase && (
            <div className="transaction-vin-vout ellipsis">
              <span>{t('No Inputs (Newly Generated Coins)')}</span>
            </div>
          )}
          {tx.vin.length !== 0 &&
            !tx.isCoinBase &&
            (expanded ? tx.vin : vinSimple).map((vin, i) => (
              <div className="panel panel-default" key={vin.addr + i}>
                <div className="panel-body transaction-vin-vout">
                  <div className={'pull-right btc-value' + (currentAddr === vin.addr ? ' text-danger' : '')}>
                    {getConvertion(vin.value)}
                  </div>
                  <div className="ellipsis">
                    {vin.notAddr && <span>{vin.addr}</span>}
                    {!vin.notAddr && vin.addr === currentAddr && (
                      <span className="text-muted" title="Current Address">
                        {vin.addr}
                      </span>
                    )}
                    {!vin.notAddr && vin.addr !== currentAddr && <Link to={'/address/' + vin.addr}>{vin.addr}</Link>}
                  </div>
                  {vin.unconfirmedInput && (
                    <div className="text-danger">
                      <span className="glyphicon glyphicon-warning-sign" /> {t('(Input unconfirmed)')}
                    </div>
                  )}
                  {vin.dbError && (
                    <div className="text-danger">
                      <span className="glyphicon glyphicon-warning-sign" /> {t('Incoherence in levelDB detected:')}{' '}
                      {vin.dbError}
                    </div>
                  )}
                  {vin.doubleSpentTxID && (
                    <div className="text-danger">
                      <span className="glyphicon glyphicon-warning-sign" /> {t('Double spent attempt detected. From tx:')}{' '}
                      <Link to={'/tx/' + vin.doubleSpentTxID}>
                        {vin.doubleSpentTxID},{vin.doubleSpentIndex}
                      </Link>
                    </div>
                  )}
                  {expanded && vin.scriptSig && (
                    <div className="small" style={{marginLeft: '0.7em', wordWrap: 'break-word'}}>
                      <p>
                        <strong>Confirmations:</strong> {vin.confirmations}
                      </p>
                      <p>
                        <strong>scriptSig</strong>
                      </p>
                      {vin.scriptSig.asm.split(' ').map((item, j) => (
                        <div key={j}>
                          <p className="col-md-11 ellipsis text-muted">{item}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
        <div className="col-md-1">
          <div className="hidden-xs hidden-sm text-center">
            <span className="lead glyphicon glyphicon-chevron-right text-muted" />
          </div>
        </div>
        <div className="col-md-6">
          {tx.vout.length === 0 && (
            <div className="transaction-vin-vout ellipsis">
              <span>{t('No Outputs')}</span>
            </div>
          )}
          {tx.vout.length !== 0 &&
            (expanded ? tx.vout : voutSimple).map((vout, i) => {
              const addrs = vout.addr ? vout.addr.split(',') : vout.scriptPubKey?.addresses || [];
              return (
                <div className="transaction-vin-vout panel panel-default" key={(vout.addr || i) + i}>
                  <div className="panel-body">
                    <div className="pull-right btc-value">
                      {getConvertion(vout.value)}{' '}
                      {vout.isSpent || vout.spentTxId ? (
                        <span className="text-danger" title="Output is spent">
                          (S)
                        </span>
                      ) : (
                        <span className="text-success" title="Output is unspent">
                          (U)
                        </span>
                      )}
                    </div>
                    <div className="ellipsis">
                      {vout.notAddr && <span>{vout.addr}</span>}
                      {!vout.notAddr &&
                        addrs.map((address) =>
                          address === currentAddr ? (
                            <span className="text-muted" title="Current Address" key={address}>
                              {address}
                            </span>
                          ) : (
                            <Link to={'/address/' + address} key={address}>
                              {address}
                            </Link>
                          )
                        )}
                    </div>
                    {expanded && vout.scriptPubKey && (
                      <div style={{paddingLeft: '0.7em', paddingBottom: '2em', wordWrap: 'break-word'}}>
                        <p className="small">
                          <strong>{t('Type')}</strong> <span className="text-muted">{vout.scriptPubKey.type}</span>
                        </p>
                        <div className="small">
                          <p>
                            <strong>scriptPubKey</strong>
                          </p>
                          <span className="col-md-11 text-muted ellipsis">{vout.scriptPubKey.asm}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {tx.blockhash && (
        <div className="well well-sm bgwhite ellipsis">
          <strong>{t('Included in Block')}</strong> <Link className="text-muted" to={'/block/' + tx.blockhash}>{tx.blockhash}</Link>
          <CopyButton text={tx.blockhash} />
        </div>
      )}

      <div className="line-top row">
        <div className="col-xs-6 col-sm-4 col-md-4">
          {!tx.isCoinBase && !isNaN(parseFloat(tx.fees)) && (
            <span className="txvalues txvalues-default">
              <span>{t('Fee')}</span>: {getConvertion(tx.fees)}
            </span>
          )}
        </div>
        <div className="col-xs-6 col-sm-8 col-md-8 text-right">
          {tx.confirmations ? (
            <span className="txvalues txvalues-success">
              {tx.confirmations} <span>{t('Confirmations')}</span>
            </span>
          ) : (
            <span className="txvalues txvalues-danger">{t('Unconfirmed Transaction!')}</span>
          )}
          <span className="txvalues txvalues-primary">{getConvertion(tx.valueOut)}</span>
        </div>
      </div>
    </div>
  );
}
