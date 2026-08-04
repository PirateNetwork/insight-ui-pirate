import {apiGet} from './base';

export function getStatus(q) {
  return apiGet('/status?q=' + encodeURIComponent(q));
}

export function getSync() {
  return apiGet('/sync');
}

export function getPeerSync() {
  return apiGet('/peer');
}

export function getVersion() {
  return apiGet('/version');
}
