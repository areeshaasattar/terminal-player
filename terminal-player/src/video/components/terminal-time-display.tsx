import { Time, usePlayer } from '@videojs/react';

import { formatTerminalTime } from '../utils/format-time';

export function TerminalTimeDisplay() {
  const isPlaying = usePlayer((s: any) => !s.paused && s.started && !s.ended);

  return (
    <div className="terminal-time-wrapper">
      <Time.Group className="terminal-time-group">
        <Time.Value
          type="current"
          className="terminal-time-current"
          render={(props, state) => (
            <time {...props} className="terminal-time-num">
              {formatTerminalTime(state.seconds)}
            </time>
          )}
        />
        <Time.Separator className="terminal-time-sep"> / </Time.Separator>
        <Time.Value
          type="duration"
          className="terminal-time-duration"
          render={(props, state) => (
            <time {...props} className="terminal-time-num">
              {formatTerminalTime(state.seconds)}
            </time>
          )}
        />
      </Time.Group>
      <span
        className={`terminal-cursor ${isPlaying ? 'terminal-cursor-blinking' : 'terminal-cursor-idle'}`}
        aria-hidden="true"
      >
        _
      </span>
    </div>
  );
}
