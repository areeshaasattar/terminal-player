import {
  MuteButton as MuteButtonPrimitive,
  VolumeSlider as VolumeSliderPrimitive,
} from '@videojs/react';

export function TerminalVolume() {
  return (
    <div className="terminal-volume-group">
      <MuteButtonPrimitive
        className="terminal-control-btn terminal-mute-btn"
        render={(props, state) => (
          <button
            {...props}
            type="button"
            className="terminal-control-btn terminal-mute-btn"
            aria-label={state.muted || state.volumeLevel === 'off' ? 'Unmute' : 'Mute'}
          >
            <span className="terminal-btn-label">
              {state.muted || state.volumeLevel === 'off' ? 'mute' : 'vol'}
            </span>
          </button>
        )}
      />
      <VolumeSliderPrimitive.Root
        className="terminal-volume-slider"
        orientation="horizontal"
        aria-label="Volume level"
      >
        <VolumeSliderPrimitive.Track className="terminal-volume-track">
          <div className="terminal-volume-bar-wrapper">
            {/* Unfilled track background: dark charcoal (#1a1d22) with dim block pattern */}
            <div className="terminal-volume-unfilled" aria-hidden="true" />
            {/* Filled volume level: amber (#ffb000) with repeating block pattern */}
            <div
              className="terminal-volume-fill"
              style={{ width: 'var(--media-slider-fill, 100%)' }}
              aria-hidden="true"
            />
          </div>
          {/* Cyan draggable thumb */}
          <VolumeSliderPrimitive.Thumb className="terminal-volume-thumb" />
        </VolumeSliderPrimitive.Track>
      </VolumeSliderPrimitive.Root>
    </div>
  );
}
