import { PlayButton as PlayButtonPrimitive } from '@videojs/react';
import { usePlayer } from '@videojs/react';

export function TerminalPlayButton() {
  const api = usePlayer();
  const { currentTime, duration } = usePlayer((s: any) => ({
    currentTime: Number(s.currentTime ?? 0),
    duration: Number(s.duration ?? 0),
  }));
  const isEnded = (duration > 0 && currentTime >= duration - 0.1);
  return (
    <PlayButtonPrimitive
      className="terminal-control-btn terminal-play-btn"
      render={(props, state) => (
        <button
          {...props}
          type="button"
          className="terminal-control-btn terminal-play-btn"
          aria-label={state.ended || isEnded ? 'Replay' : state.paused ? 'Play' : 'Pause'}
          onClick={(e) => {
            if (state.ended || isEnded) {
              e.preventDefault();
              (api as any).seek?.(0);
              (api as any).play?.();
            }
            props.onClick?.(e);
          }}
        >
          <span className="terminal-btn-label">
            {state.ended || isEnded ? '> replay' : state.paused ? '>' : '||'}
            <span className="terminal-btn-text">
              {state.ended || isEnded ? ' replay' : state.paused ? ' play' : ' pause'}
            </span>
          </span>
        </button>
      )}
    />
  );
}
