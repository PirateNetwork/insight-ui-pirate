import {useEffect, useRef} from 'react';
import {useSocket} from './useSocket';

// Runs `refresh` on every new block (throttled, max once per `wait` ms,
// trailing-edge) AND on a plain `pollInterval` ms timer, guarded against
// out-of-order responses.
//
// The socket-driven side alone isn't enough: pirated's ZMQ hashblock
// notification (which drives the server's 'block' socket event) is
// explicitly skipped for every block connected while the node is still
// in initial block download (see TreasureChest's src/main.cpp,
// ActivateBestChainStep's `if (!fInitialDownload)` guard around
// GetMainSignals().UpdatedBlockTip()) - so during a resync, no 'block'
// event ever reaches the client no matter what this hook does. The
// polling fallback keeps Conn/Height/Notarized/sync info fresh
// regardless of that, and also covers the 'sync'/'status' socket event
// this app subscribes to elsewhere, which has no server-side publisher
// at all (Bus.prototype.subscribe silently no-ops for unknown event
// names) and so has never actually pushed anything, in or out of IBD.
//
// `refresh` is called with an `isCurrent()` function; wrap any setState
// call in `if (isCurrent()) ...` so a response that's no longer the
// latest in-flight request is dropped instead of applied.
export function useBlockRefresh(refresh, {wait = 1000, pollInterval = 5000} = {}) {
  const state = useRef({seq: 0, lastRun: 0, timer: null, refresh}).current;
  state.refresh = refresh;

  function run() {
    state.lastRun = Date.now();
    const mySeq = ++state.seq;
    state.refresh(() => mySeq === state.seq);
  }

  useSocket((socket) => {
    socket.emit('subscribe', 'inv');

    function onBlock() {
      const elapsed = Date.now() - state.lastRun;
      if (elapsed >= wait) {
        run();
      } else {
        clearTimeout(state.timer);
        state.timer = setTimeout(run, wait - elapsed);
      }
    }
    socket.on('block', onBlock);

    return () => {
      socket.off('block', onBlock);
      clearTimeout(state.timer);
    };
  });

  useEffect(() => {
    const interval = setInterval(run, pollInterval);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollInterval]);
}
