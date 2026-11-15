import {UPGRADE_BANNER_WINDOW, upgradeBanners} from './upgrades';

const IRONWOOD = {branchId: '37a5165b', name: 'Ironwood', activationHeight: 4161185};

function data(height, upgrades, network = 'livenet') {
  return {height, network, upgrades};
}

describe('upgradeBanners', () => {
  it('shows nothing more than the window before activation', () => {
    const height = IRONWOOD.activationHeight - UPGRADE_BANNER_WINDOW - 1;
    expect(upgradeBanners(data(height, [{...IRONWOOD, status: 'pending'}]))).toEqual([]);
  });

  it('starts a pending banner exactly the window before activation', () => {
    const height = IRONWOOD.activationHeight - UPGRADE_BANNER_WINDOW;
    expect(upgradeBanners(data(height, [{...IRONWOOD, status: 'pending'}]))).toEqual([
      {
        kind: 'pending',
        branchId: '37a5165b',
        name: 'Ironwood',
        activationHeight: IRONWOOD.activationHeight,
        blocksRemaining: UPGRADE_BANNER_WINDOW
      }
    ]);
  });

  it('counts down to a single remaining block', () => {
    const [banner] = upgradeBanners(data(IRONWOOD.activationHeight - 1, [{...IRONWOOD, status: 'pending'}]));
    expect(banner.kind).toBe('pending');
    expect(banner.blocksRemaining).toBe(1);
  });

  it('switches to active at the activation height itself', () => {
    const [banner] = upgradeBanners(data(IRONWOOD.activationHeight, [{...IRONWOOD, status: 'active'}]));
    expect(banner).toEqual({
      kind: 'active',
      branchId: '37a5165b',
      name: 'Ironwood',
      activationHeight: IRONWOOD.activationHeight
    });
  });

  it('keeps the active banner through the last block of the window', () => {
    const height = IRONWOOD.activationHeight + UPGRADE_BANNER_WINDOW - 1;
    expect(upgradeBanners(data(height, [{...IRONWOOD, status: 'active'}]))).toHaveLength(1);
  });

  it('drops the banner the window after activation', () => {
    const height = IRONWOOD.activationHeight + UPGRADE_BANNER_WINDOW;
    expect(upgradeBanners(data(height, [{...IRONWOOD, status: 'active'}]))).toEqual([]);
  });

  it('hides Ironwood at the current mainnet height, long past its window', () => {
    expect(upgradeBanners(data(4208852, [{...IRONWOOD, status: 'active'}]))).toEqual([]);
  });

  it('ignores long-past upgrades and shows only the ones in the window', () => {
    const upgrades = [
      {branchId: '5ba81b19', name: 'Overwinter', activationHeight: 152855, status: 'active'},
      {branchId: '76b809bb', name: 'Sapling', activationHeight: 152855, status: 'active'},
      {...IRONWOOD, status: 'active'},
      {branchId: 'deadbeef', name: 'Nextfork', activationHeight: 4212000, status: 'pending'}
    ];
    const banners = upgradeBanners(data(4209000, upgrades));
    expect(banners.map((b) => [b.name, b.kind])).toEqual([['Nextfork', 'pending']]);
  });

  it('can show two upgrades at once when their windows overlap', () => {
    const upgrades = [
      {...IRONWOOD, status: 'active'},
      {branchId: 'deadbeef', name: 'Nextfork', activationHeight: IRONWOOD.activationHeight + 3000, status: 'pending'}
    ];
    const banners = upgradeBanners(data(IRONWOOD.activationHeight + 100, upgrades));
    expect(banners.map((b) => [b.name, b.kind])).toEqual([
      ['Ironwood', 'active'],
      ['Nextfork', 'pending']
    ]);
  });

  it('never shows the regtest test-dummy upgrade', () => {
    const upgrades = [{branchId: '74736554', name: 'Test dummy', activationHeight: 10, status: 'active'}];
    expect(upgradeBanners(data(20, upgrades, 'regtest'))).toEqual([]);
  });

  it('skips entries with no activation height', () => {
    const upgrades = [{branchId: 'deadbeef', name: 'Nextfork', activationHeight: null, status: 'pending'}];
    expect(upgradeBanners(data(100, upgrades))).toEqual([]);
  });

  it('returns nothing for a missing or malformed response', () => {
    expect(upgradeBanners(null)).toEqual([]);
    expect(upgradeBanners({upgrades: [IRONWOOD]})).toEqual([]);
    expect(upgradeBanners({height: 100})).toEqual([]);
  });
});
