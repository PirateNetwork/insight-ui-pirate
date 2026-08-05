// getpeerinfo's own `network` field (ipv4/ipv6/onion/i2p/not_publicly_routable/
// cjdns - see TreasureChest's src/netbase.cpp GetNetworkName) is a much more
// reliable way to classify a peer than parsing its `addr` string ourselves.
export const NETWORK_TABS = [
  {key: 'ipv4', label: 'IPv4'},
  {key: 'ipv6', label: 'IPv6'},
  {key: 'onion', label: 'Tor'},
  {key: 'i2p', label: 'I2P'}
];

// Buckets peers by network (ipv4/ipv6/onion/i2p only - anything else,
// e.g. not_publicly_routable/cjdns, is dropped), then by direction.
// Outbound peers are ones we successfully dialed out to, so their addr
// is known-reachable and worth suggesting as an addnode target;
// inbound peers merely connected to us, which proves nothing about
// whether their own addr accepts incoming connections.
export function groupPeers(peers) {
  const groups = {};
  NETWORK_TABS.forEach(({key}) => {
    groups[key] = {inbound: [], outbound: []};
  });

  (peers || []).forEach((peer) => {
    const bucket = groups[peer.network];
    if (!bucket) return;
    (peer.inbound ? bucket.inbound : bucket.outbound).push(peer);
  });

  return groups;
}
