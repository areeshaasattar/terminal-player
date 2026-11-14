import { TimeSlider as TimeSliderPrimitive } from '@videojs/react';

import { formatTerminalTime } from '../utils/format-time';

export function TerminalSeekBar() {
  return (
    <div className="terminal-seek-container">
      <TimeSliderPrimitive.Root
        className="terminal-seek-slider"
        thumbAlignment="center"
        aria-label="Seek timeline"
      >
        <span className="terminal-seek-bracket" aria-hidden="true">[</span>
        <TimeSliderPrimitive.Track className="terminal-seek-track">
          <div className="terminal-seek-bar-wrapper">
            {/* Unfilled charcoal background (#1a1d22) with dim block pattern */}
            <div className="terminal-seek-unfilled" aria-hidden="true" />
            {/* Buffered part with dimmer amber block pattern */}
            <div
              className="terminal-seek-buffered"
              style={{ width: 'var(--media-slider-buffer, 0%)' }}
              aria-hidden="true"
            />
            {/* Filled/elapsed part with bright amber (#ffb000) block pattern */}
            <div
              className="terminal-seek-filled"
              style={{ width: 'var(--media-slider-fill, 0%)' }}
              aria-hidden="true"
            />
          </div>
          {/* Cyan draggable thumb */}
          <TimeSliderPrimitive.Thumb className="terminal-seek-thumb" />
        </TimeSliderPrimitive.Track>
        <span className="terminal-seek-bracket" aria-hidden="true">]</span>

        <TimeSliderPrimitive.Preview className="terminal-seek-preview">
          <TimeSliderPrimitive.Value
            type="pointer"
            className="terminal-seek-preview-time"
            format={formatTerminalTime}
          />
        </TimeSliderPrimitive.Preview>
      </TimeSliderPrimitive.Root>
    </div>
  );
}
