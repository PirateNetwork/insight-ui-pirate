import {apiGet} from './base';

export function getAddress(addrStr) {
  return apiGet('/addr/' + encodeURIComponent(addrStr) + '/?noTxList=1');
}
