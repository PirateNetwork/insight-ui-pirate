// Decides which network-upgrade banners the home page shows, from the
// /network-upgrades response ({height, network, upgrades: [{branchId,
// name, activationHeight, status}]}).
//
// An upgrade's banner appears UPGRADE_BANNER_WINDOW blocks before its
// activation height and drops off UPGRADE_BANNER_WINDOW blocks after it,
// so a future hardfork gets a banner with no code change here as soon as
// pirated knows its activation height.

export const UPGRADE_BANNER_WINDOW = 5000;

// Branch IDs pirated may report that aren't real network upgrades.
const HIDDEN_BRANCH_IDS = new Set([
  '74736554' // "Test dummy", a regtest-only upgrade used by node tests
]);

// Returns the banners to show, in the order pirated reports them. Each
// banner is one of:
//   {kind: 'active', branchId, name, activationHeight}
//   {kind: 'pending', branchId, name, activationHeight, blocksRemaining}
export function upgradeBanners(data) {
  if (!data || typeof data.height !== 'number') return [];

  const banners = [];
  for (const upgrade of data.upgrades || []) {
    if (HIDDEN_BRANCH_IDS.has(upgrade.branchId)) continue;
    if (typeof upgrade.activationHeight !== 'number') continue;

    const blocksSinceActivation = data.height - upgrade.activationHeight;
    if (blocksSinceActivation < -UPGRADE_BANNER_WINDOW) continue;
    if (blocksSinceActivation >= UPGRADE_BANNER_WINDOW) continue;

    const base = {
      branchId: upgrade.branchId,
      name: upgrade.name,
      activationHeight: upgrade.activationHeight
    };
    if (blocksSinceActivation >= 0) {
      banners.push({kind: 'active', ...base});
    } else {
      banners.push({kind: 'pending', ...base, blocksRemaining: -blocksSinceActivation});
    }
  }
  return banners;
}
