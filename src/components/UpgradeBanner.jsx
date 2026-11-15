import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {getNetworkUpgrades} from '../api/status';
import {upgradeBanners} from '../lib/upgrades';
import {useBlockRefresh} from '../hooks/useBlockRefresh';

function BannerText({banner}) {
  const {t} = useTranslation();
  const {name} = banner;

  if (banner.kind === 'active') {
    return (
      <>
        <strong>{t('{{name}} is live', {name})}</strong>
        <span>{t('Activated at block {{height}}', {height: banner.activationHeight})}</span>
      </>
    );
  }

  return (
    <>
      <strong>{t('{{name}} network upgrade', {name})}</strong>
      <span>
        {banner.blocksRemaining === 1
          ? t('1 block remaining')
          : t('{{count}} blocks remaining', {count: banner.blocksRemaining})}
      </span>
      <span className="upgrade-banner-muted">
        {t('activates at block {{height}}', {height: banner.activationHeight})}
      </span>
    </>
  );
}

export function UpgradeBannerView({banners}) {
  if (!banners.length) return null;
  return (
    <div className="upgrade-banners">
      {banners.map((banner) => (
        <div className="upgrade-banner" role="status" key={banner.branchId}>
          <span className="upgrade-banner-dot" aria-hidden="true" />
          <BannerText banner={banner} />
        </div>
      ))}
    </div>
  );
}

// Network-upgrade notice for the home page. Each upgrade the node reports
// gets a banner from 5000 blocks before its activation height until 5000
// blocks after (see lib/upgrades.js), so nothing here is upgrade-specific.
export default function UpgradeBanner() {
  const [data, setData] = useState(null);

  const refresh = (isCurrent) => {
    getNetworkUpgrades()
      .then((res) => {
        if (isCurrent()) setData(res);
      })
      .catch(() => {
        // Fail soft - a notice banner should never break the home page.
      });
  };

  // useBlockRefresh only fires on the first block event or poll tick, so
  // fetch once on mount too rather than leave the banner blank meanwhile.
  useEffect(() => {
    refresh(() => true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useBlockRefresh(refresh);

  return <UpgradeBannerView banners={upgradeBanners(data)} />;
}
