// Ported verbatim from legacy/src/js/controllers/transactions.js's
// _aggregateItems - groups a tx's vin or vout array by address, so the UI
// can show one row per address instead of one row per input/output.

const COIN = 100000000;

export function aggregateItems(items) {
  if (!items) return [];

  const ret = [];
  const tmp = {};
  let u = 0;

  for (let i = 0; i < items.length; i++) {
    let notAddr = false;

    // non standard input
    if (items[i].scriptSig && !items[i].addr) {
      items[i].addr = 'Unparsed address [' + u++ + ']';
      items[i].notAddr = true;
      notAddr = true;
    }

    // non standard output
    if (items[i].scriptPubKey && !items[i].scriptPubKey.addresses) {
      items[i].scriptPubKey.addresses = ['Unparsed address [' + u++ + ']'];
      items[i].notAddr = true;
      notAddr = true;
    }

    // multiple addr at output
    if (items[i].scriptPubKey && items[i].scriptPubKey.addresses.length > 1) {
      items[i].addr = items[i].scriptPubKey.addresses.join(',');
      ret.push(items[i]);
      continue;
    }

    const addr = items[i].addr || (items[i].scriptPubKey && items[i].scriptPubKey.addresses[0]);

    if (!tmp[addr]) {
      tmp[addr] = {};
      tmp[addr].valueSat = 0;
      tmp[addr].count = 0;
      tmp[addr].addr = addr;
      tmp[addr].items = [];
    }
    tmp[addr].isSpent = items[i].spentTxId;

    tmp[addr].doubleSpentTxID = tmp[addr].doubleSpentTxID || items[i].doubleSpentTxID;
    tmp[addr].doubleSpentIndex = tmp[addr].doubleSpentIndex || items[i].doubleSpentIndex;
    tmp[addr].dbError = tmp[addr].dbError || items[i].dbError;
    tmp[addr].valueSat += Math.round(items[i].value * COIN);
    tmp[addr].items.push(items[i]);
    tmp[addr].notAddr = notAddr;

    if (items[i].unconfirmedInput) {
      tmp[addr].unconfirmedInput = true;
    }

    tmp[addr].count++;
  }

  Object.keys(tmp).forEach((key) => {
    const v = tmp[key];
    v.value = v.value || parseInt(v.valueSat, 10) / COIN;
    ret.push(v);
  });

  return ret;
}

// A zatoshi is 1e-8 PIRATE - deltas smaller than this are float noise from
// summing already-divided decimal values, not a real net flow.
const EPS = 1e-8;

// Computes each shielded/transparent pool's net balance-sheet delta for a
// tx (positive = pool gained value, negative = pool lost it), then buckets
// pools into sources/destinations/neutral so the UI can render an explicit
// flow diagram instead of assuming any non-zero Sapling valueBalance means
// "Public input/output" - that stopped being true once Ironwood let value
// move directly between shielded pools without ever touching a transparent
// output. Sign conventions (valueBalance positive = value leaving the
// pool) are the consensus ones from TreasureChest's CheckTransaction and
// are identical for Sapling and Ironwood (see src/main.cpp's
// valueBalanceSapling/valueBalanceIronwood handling).
export function computePoolFlows(tx) {
  const pools = [];

  if (tx.isCoinBase) {
    const vout = tx.vout || [];
    if (vout.length > 0) {
      const outTotal = vout.reduce((sum, v) => sum + Number(v.value || 0), 0);
      pools.push({key: 'transparent', delta: outTotal, counts: {in: 0, out: vout.length}});
    }
  } else {
    const vin = tx.vin || [];
    const vout = tx.vout || [];
    if (vin.length > 0 || vout.length > 0) {
      const inTotal = vin.reduce((sum, v) => sum + Number(v.value || 0), 0);
      const outTotal = vout.reduce((sum, v) => sum + Number(v.value || 0), 0);
      pools.push({key: 'transparent', delta: outTotal - inTotal, counts: {in: vin.length, out: vout.length}});
    }
  }

  const joinsplits = tx.vjoinsplit || [];
  if (joinsplits.length > 0) {
    // vpub_old enters the joinsplit from the public pool (pool gains),
    // vpub_new leaves it back to the public pool (pool loses).
    const delta = joinsplits.reduce((sum, j) => sum + (Number(j.vpub_old) - Number(j.vpub_new)), 0);
    pools.push({key: 'sprout', delta, counts: {joinsplits: joinsplits.length}});
  }

  const spendDescs = tx.spendDescs || [];
  const outputDescs = tx.outputDescs || [];
  const saplingValueBalance = Number(tx.valueBalance) || 0;
  if (spendDescs.length > 0 || outputDescs.length > 0 || Math.abs(saplingValueBalance) > EPS) {
    pools.push({
      key: 'sapling',
      delta: -saplingValueBalance,
      counts: {spends: spendDescs.length, outputs: outputDescs.length}
    });
  }

  const ironwoodActions = (tx.ironwood && tx.ironwood.actions) || [];
  const ironwoodValueBalance = (tx.ironwood && Number(tx.ironwood.valueBalance)) || 0;
  if (ironwoodActions.length > 0 || Math.abs(ironwoodValueBalance) > EPS) {
    pools.push({key: 'ironwood', delta: -ironwoodValueBalance, counts: {actions: ironwoodActions.length}});
  }

  const sources = [];
  const destinations = [];
  const neutral = [];
  pools.forEach((pool) => {
    if (pool.delta > EPS) {
      destinations.push({...pool, amount: pool.delta});
    } else if (pool.delta < -EPS) {
      sources.push({...pool, amount: -pool.delta});
    } else {
      neutral.push(pool);
    }
  });

  return {sources, destinations, neutral};
}
