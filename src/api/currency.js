import {apiGet} from './base';

export function getCurrency() {
  return apiGet('/currency');
}
