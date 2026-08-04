import {apiPost} from './base';

export function verifyMessage({address, signature, message}) {
  return apiPost('/messages/verify', {address, signature, message});
}
