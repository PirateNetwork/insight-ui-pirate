import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getIronwoodActivation} from '../api/status';
import {formatDuration} from '../lib/time';
import {useBlockRefresh} from '../hooks/useBlockRefresh';

// Mirrors TreasureChest's src/komodo_defs.h KOMODO_IRONWOOD_ACTIVATION -
// mainnet gates Ironwood activation by this Unix timestamp rather than a
// pre-set block height (see komodo_activate_ironwood in main.cpp), so it
// has to be duplicated here for the pre-gate countdown phase below. Keep
// this in sync with that constant if the target date ever changes.
const IRONWOOD_ACTIVATION_TIMESTAMP = 1791054000; // Sat Oct 3 2026 19:00 UTC

export default function IronwoodCountdown() {
  const {t} = useTranslation();
  const [info, setInfo] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const refresh = (isCurrent) => {
    getIronwoodActivation()
      .then((data) => {
        if (isCurrent()) setInfo(data);
      })
      .catch(() => {
        // Fail soft - a marketing banner should never break the home page.
      });
  };

  // Fire once immediately on mount (useBlockRefresh alone only runs on the
  // first block event or after its poll interval elapses, which would
  // otherwise leave the banner blank for up to several seconds) - mirrors
  // RecentActivityContext's refreshBlocks/useBlockRefresh pairing.
  useEffect(() => {
    refresh(() => true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useBlockRefresh(refresh);

  // Only the pre-gate (time-based) phase needs a ticking clock; the
  // post-gate phase counts down in blocks, which useBlockRefresh already
  // keeps current.
  const needsClock = info && !info.active && info.activationHeight == null;
  useEffect(() => {
    if (!needsClock) return undefined;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [needsClock]);

  if (!info) return null;

  if (info.active) {
    return (
      <div className="alert alert-success" id="ironwood-countdown">
        <strong>{t('Ironwood is live!')}</strong>{' '}
        {t('The Ironwood shielded pool activated at block')} {info.activationHeight}.
      </div>
    );
  }

  if (info.activationHeight != null) {
    const blocksRemaining = Math.max(0, info.activationHeight - info.height);
    return (
      <div className="alert alert-info" id="ironwood-countdown">
        <strong>{t('Ironwood activation countdown:')}</strong>{' '}
        {blocksRemaining > 0 ? (
          <span>
            {blocksRemaining} {t('blocks remaining')}
          </span>
        ) : (
          t('activating any block now')
        )}{' '}
        <span className="text-muted">
          ({t('activates at block')} {info.activationHeight})
        </span>
      </div>
    );
  }

  const secondsRemaining = Math.max(0, IRONWOOD_ACTIVATION_TIMESTAMP - now / 1000);
  return (
    <div className="alert alert-info" id="ironwood-countdown">
      <strong>{t('Ironwood activation countdown:')}</strong> {formatDuration(secondsRemaining)}
    </div>
  );
}
