import {useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {getBlock, getBlockByHeight} from '../api/blocks';
import {getTransaction} from '../api/transactions';
import {getAddress} from '../api/address';

// Mirrors legacy/src/js/controllers/search.js - tries, in order: block
// hash, txid, address, block height. Exported so the QR scanner (once
// wired up) can reuse the same resolution logic against a scanned string.
export async function resolveSearch(q) {
  try {
    await getBlock(q);
    return '/block/' + q;
  } catch {
    // not a block hash, fall through
  }
  try {
    await getTransaction(q);
    return '/tx/' + q;
  } catch {
    // not a txid, fall through
  }
  try {
    await getAddress(q);
    return '/address/' + q;
  } catch {
    // not an address, fall through
  }
  if (isFinite(q)) {
    const hash = await getBlockByHeight(q);
    return '/block/' + hash.blockHash;
  }
  throw new Error('not found');
}

export default function SearchBox({inputId = 'search'}) {
  const {t} = useTranslation();
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [badQuery, setBadQuery] = useState(false);
  const badQueryTimer = useRef(null);
  const navigate = useNavigate();

  function flashBadQuery() {
    setBadQuery(true);
    if (badQueryTimer.current) clearTimeout(badQueryTimer.current);
    badQueryTimer.current = setTimeout(() => setBadQuery(false), 2000);
  }

  async function search(e) {
    if (e) e.preventDefault();
    if (!q) return;
    setBadQuery(false);
    setLoading(true);
    try {
      const path = await resolveSearch(q);
      setQ('');
      setLoading(false);
      navigate(path);
    } catch {
      setLoading(false);
      flashBadQuery();
    }
  }

  return (
    <form id="search-form" role="search" onSubmit={search}>
      <div className={'form-group' + (badQuery ? ' has-error' : '')}>
        <input
          id={inputId}
          type="text"
          className={'form-control' + (loading ? ' loading' : '')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('Search for block, transaction or address')}
        />
      </div>
      {badQuery && <div className="no_matching text-danger">{t('No matching records found!')}</div>}
    </form>
  );
}
