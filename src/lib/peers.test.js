import {describe, it, expect} from 'vitest';
import {groupPeers} from './peers';

describe('groupPeers', () => {
  it('buckets peers by network and direction', () => {
    const peers = [
      {addr: '203.0.113.5:45452', network: 'ipv4', inbound: false},
      {addr: '198.51.100.9:45452', network: 'ipv4', inbound: true},
      {addr: '[2001:db8::1]:45452', network: 'ipv6', inbound: false},
      {addr: 'abc.onion:45452', network: 'onion', inbound: true},
      {addr: 'xyz.b32.i2p:45452', network: 'i2p', inbound: false}
    ];

    const groups = groupPeers(peers);

    expect(groups.ipv4.outbound).toHaveLength(1);
    expect(groups.ipv4.inbound).toHaveLength(1);
    expect(groups.ipv4.outbound[0].addr).toBe('203.0.113.5:45452');
    expect(groups.ipv6.outbound).toHaveLength(1);
    expect(groups.onion.inbound).toHaveLength(1);
    expect(groups.i2p.outbound).toHaveLength(1);
  });

  it('drops peers on networks outside ipv4/ipv6/onion/i2p', () => {
    const peers = [
      {addr: 'fc00::1:45452', network: 'cjdns', inbound: false},
      {addr: '10.0.0.1:45452', network: 'not_publicly_routable', inbound: true}
    ];

    const groups = groupPeers(peers);

    expect(groups.ipv4.inbound).toHaveLength(0);
    expect(groups.ipv4.outbound).toHaveLength(0);
    expect(groups.ipv6.inbound).toHaveLength(0);
    expect(groups.ipv6.outbound).toHaveLength(0);
    expect(groups.onion.inbound).toHaveLength(0);
    expect(groups.i2p.inbound).toHaveLength(0);
  });

  it('returns empty buckets for an empty/missing peer list', () => {
    expect(groupPeers([])).toEqual({
      ipv4: {inbound: [], outbound: []},
      ipv6: {inbound: [], outbound: []},
      onion: {inbound: [], outbound: []},
      i2p: {inbound: [], outbound: []}
    });
    expect(groupPeers(undefined)).toEqual(groupPeers([]));
  });
});
