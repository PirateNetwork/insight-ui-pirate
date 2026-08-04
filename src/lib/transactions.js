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
