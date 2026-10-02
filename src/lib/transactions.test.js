import {describe, it, expect} from 'vitest';
import {aggregateItems, computePoolFlows} from './transactions';

describe('aggregateItems', () => {
  it('returns an empty array for null/undefined input', () => {
    expect(aggregateItems(null)).toEqual([]);
    expect(aggregateItems(undefined)).toEqual([]);
  });

  it('groups vin entries by address and sums their satoshi values', () => {
    const vin = [
      {addr: 'addr1', value: 0.5},
      {addr: 'addr1', value: 0.25},
      {addr: 'addr2', value: 1}
    ];
    const result = aggregateItems(vin);
    const addr1 = result.find((r) => r.addr === 'addr1');
    const addr2 = result.find((r) => r.addr === 'addr2');
    expect(addr1.count).toBe(2);
    expect(addr1.valueSat).toBe(75000000);
    expect(addr2.count).toBe(1);
    expect(addr2.valueSat).toBe(100000000);
  });

  it('groups vout entries by their single scriptPubKey address', () => {
    const vout = [
      {scriptPubKey: {addresses: ['addrA']}, value: 1},
      {scriptPubKey: {addresses: ['addrA']}, value: 2}
    ];
    const result = aggregateItems(vout);
    expect(result).toHaveLength(1);
    expect(result[0].addr).toBe('addrA');
    expect(result[0].valueSat).toBe(300000000);
  });

  it('keeps multi-address outputs as their own separate, un-grouped entry', () => {
    const vout = [{scriptPubKey: {addresses: ['addrA', 'addrB']}, value: 1}];
    const result = aggregateItems(vout);
    expect(result).toHaveLength(1);
    expect(result[0].addr).toBe('addrA,addrB');
  });

  it('labels unparsed inputs (scriptSig with no addr) as "Unparsed address [n]"', () => {
    const vin = [{scriptSig: {}, value: 1}];
    const result = aggregateItems(vin);
    expect(result[0].addr).toBe('Unparsed address [0]');
    expect(result[0].notAddr).toBe(true);
  });

  it('labels unparsed outputs (scriptPubKey with no addresses) as "Unparsed address [n]"', () => {
    const vout = [{scriptPubKey: {}, value: 1}];
    const result = aggregateItems(vout);
    expect(result[0].addr).toBe('Unparsed address [0]');
    expect(result[0].notAddr).toBe(true);
  });

  it('marks a group unconfirmedInput if any of its items are', () => {
    const vin = [
      {addr: 'addr1', value: 1, unconfirmedInput: true},
      {addr: 'addr1', value: 1}
    ];
    const result = aggregateItems(vin);
    expect(result[0].unconfirmedInput).toBe(true);
  });
});

describe('computePoolFlows', () => {
  it('attributes a direct Sapling -> Ironwood migration to the Ironwood pool, not "Public"', () => {
    // No transparent vin/vout at all - a positive Sapling valueBalance here
    // can only be absorbed by the Ironwood pool's matching negative one,
    // never the transparent pool, since no transparent output exists.
    const tx = {
      isCoinBase: false,
      vin: [],
      vout: [],
      spendDescs: [{}],
      outputDescs: [{}, {}],
      valueBalance: 100,
      ironwood: {actions: [{}], valueBalance: -100}
    };
    const {sources, destinations, neutral} = computePoolFlows(tx);
    expect(sources).toEqual([
      {key: 'sapling', delta: -100, counts: {spends: 1, outputs: 2}, amount: 100}
    ]);
    expect(destinations).toEqual([
      {key: 'ironwood', delta: 100, counts: {actions: 1}, amount: 100}
    ]);
    expect(neutral).toEqual([]);
  });

  it('attributes an ordinary t -> z shield to the transparent and Sapling pools', () => {
    const tx = {
      isCoinBase: false,
      vin: [{value: 5}],
      vout: [],
      spendDescs: [],
      outputDescs: [{}],
      valueBalance: -4.9999
    };
    const {sources, destinations} = computePoolFlows(tx);
    expect(sources).toEqual([
      {key: 'transparent', delta: -5, counts: {in: 1, out: 0}, amount: 5}
    ]);
    expect(destinations).toEqual([
      {key: 'sapling', delta: 4.9999, counts: {spends: 0, outputs: 1}, amount: 4.9999}
    ]);
  });

  it('treats a net-zero internal Sapling shuffle as neutral, not a source or destination', () => {
    const tx = {
      isCoinBase: false,
      vin: [],
      vout: [],
      spendDescs: [{}],
      outputDescs: [{}],
      valueBalance: 0
    };
    const {sources, destinations, neutral} = computePoolFlows(tx);
    expect(sources).toEqual([]);
    expect(destinations).toEqual([]);
    expect(neutral).toEqual([
      {key: 'sapling', delta: -0, counts: {spends: 1, outputs: 1}}
    ]);
  });

  it('treats coinbase vin as newly generated coins, not a transparent-pool source', () => {
    const tx = {
      isCoinBase: true,
      vin: [{coinbase: 'script', sequence: 0, n: 0}],
      vout: [{value: '10.00000000'}]
    };
    const {sources, destinations} = computePoolFlows(tx);
    expect(sources).toEqual([]);
    expect(destinations).toEqual([
      {key: 'transparent', delta: 10, counts: {in: 0, out: 1}, amount: 10}
    ]);
  });

  it('includes an Ironwood-only transaction (no Sapling activity at all)', () => {
    const tx = {
      isCoinBase: false,
      vin: [],
      vout: [],
      ironwood: {actions: [{}, {}], valueBalance: 0}
    };
    const {neutral} = computePoolFlows(tx);
    expect(neutral).toEqual([
      {key: 'ironwood', delta: -0, counts: {actions: 2}}
    ]);
  });
});
