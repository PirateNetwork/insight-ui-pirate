import {apiGet, apiPost} from './base';

export function getTransaction(txId) {
  return apiGet('/tx/' + encodeURIComponent(txId));
}

export function getTransactionsByBlock(blockHash, pageNum) {
  const params = new URLSearchParams({block: blockHash, pageNum});
  return apiGet('/txs?' + params.toString());
}

export function getTransactionsByAddress(address, pageNum) {
  const params = new URLSearchParams({address, pageNum});
  return apiGet('/txs?' + params.toString());
}

export function sendRawTransaction(rawtx) {
  return apiPost('/tx/send', {rawtx});
}
