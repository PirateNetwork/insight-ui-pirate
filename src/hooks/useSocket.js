import {useEffect, useRef} from 'react';
import {io} from 'socket.io-client';

// A single shared socket for the whole app (mirrors the legacy
// getSocket() factory, which returned one connect()-ed socket per app
// instance, wrapped per-component only for listener bookkeeping).
let sharedSocket = null;
function getSharedSocket() {
  if (!sharedSocket) {
    sharedSocket = io({reconnection: true, reconnectionDelay: 500});
  }
  return sharedSocket;
}

// Runs `setup(socket)` once the socket is connected (and again on every
// reconnect, since the server-side subscription state doesn't survive a
// disconnect), and cleans up all of setup's listeners on unmount. This
// replaces the legacy ScopedSocket's per-scope listener tracking - React's
// useEffect cleanup does the same job without needing to wrap every
// callback for $rootScope.$apply().
export function useSocket(setup) {
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useEffect(() => {
    const socket = getSharedSocket();
    let cleanupSetup = null;

    function onConnect() {
      if (cleanupSetup) cleanupSetup();
      cleanupSetup = setupRef.current(socket) || null;
    }

    socket.on('connect', onConnect);
    if (socket.connected) onConnect();

    return () => {
      socket.off('connect', onConnect);
      if (cleanupSetup) cleanupSetup();
    };
  }, []);
}
