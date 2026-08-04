import {apiGet} from './base';

export function getBlock(blockHash) {
  return apiGet('/block/' + encodeURIComponent(blockHash));
}

export function getBlocks({blockDate, startTimestamp, limit} = {}) {
  const params = new URLSearchParams();
  if (blockDate) params.set('blockDate', blockDate);
  if (startTimestamp) params.set('startTimestamp', startTimestamp);
  if (limit) params.set('limit', limit);
  const qs = params.toString();
  return apiGet('/blocks' + (qs ? '?' + qs : ''));
}

export function getBlockByHeight(blockHeight) {
  return apiGet('/block-index/' + encodeURIComponent(blockHeight));
}
