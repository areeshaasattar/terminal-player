import { FullscreenButton as FullscreenButtonPrimitive } from '@videojs/react';

export function TerminalFullscreenButton() {
  return (
    <FullscreenButtonPrimitive
      className="terminal-control-btn terminal-fullscreen-btn"
      render={(props, state) => (
        <button
          {...props}
          type="button"
          className="terminal-control-btn terminal-fullscreen-btn"
          aria-label={state.fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          <span className="terminal-btn-label">
            {state.fullscreen ? '[X]' : '[ ]'}
          </span>
          <span className="terminal-btn-secondary-label">
            &nbsp;fullscreen
          </span>
        </button>
      )}
    />
  );
}
