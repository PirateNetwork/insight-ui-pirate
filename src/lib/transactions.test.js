import {describe, it, expect} from 'vitest';
import {aggregateItems} from './transactions';

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
