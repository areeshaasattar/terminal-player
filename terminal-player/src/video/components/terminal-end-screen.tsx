/** @jsxImportSource react */

import { usePlayer } from '@videojs/react';
import { useRef } from 'react';

export function TerminalEndScreen() {
  const { ended, currentTime, duration } = usePlayer((s: any) => ({
    ended: Boolean(s.ended),
    currentTime: Number(s.currentTime ?? 0),
    duration: Number(s.duration ?? 0),
  }));
  const api = usePlayer();
  const btnRef = useRef<HTMLButtonElement>(null);

  const isEnded = ended || (duration > 0 && currentTime >= duration - 0.1);
  if (!isEnded) return null;

  const replay = () => {
    (api as any).seek?.(0);
    (api as any).play?.();
    btnRef.current?.blur();
  };

  return (
    <div className="terminal-end-screen" role="dialog" aria-label="Playback ended">
      <div className="terminal-end-message">process exited with code 0</div>
      <button
        ref={btnRef}
        type="button"
        className="terminal-end-replay"
        onClick={replay}
      >
        &gt; replay
      </button>
    </div>
  );
}
