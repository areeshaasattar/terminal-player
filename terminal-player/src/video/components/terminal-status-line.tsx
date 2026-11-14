/** @jsxImportSource react */

import { usePlayer } from '@videojs/react';

import { CHAPTERS } from './terminal-command-line';
import { formatTerminalTime } from '../utils/format-time';

function secondsToMMSS(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

/** Phase 2: boot sequence, then Phase 4: live status text. */
export function TerminalStatusLine() {
  const { paused, started, waiting, ended, seeking, currentTime, duration, volume, muted } =
    usePlayer((s: any) => ({
      paused: Boolean(s.paused),
      started: Boolean(s.started),
      waiting: Boolean(s.waiting),
      ended: Boolean(s.ended),
      seeking: Boolean(s.seeking),
      currentTime: Number(s.currentTime ?? 0),
      duration: Number(s.duration ?? 0),
      volume: Number(s.volume ?? 1),
      muted: Boolean(s.muted),
    }));

  // Determine playback state text
  let stateText = 'paused';
  if (waiting || (seeking && !paused)) {
    stateText = 'buffering';
  } else if (ended) {
    stateText = 'ended';
  } else if (!started || paused) {
    stateText = 'paused';
  } else {
    stateText = 'playing';
  }

  // Active chapter
  const activeChapter =
    [...CHAPTERS].reverse().find((c) => currentTime >= c.time) ?? CHAPTERS[0];

  // Phase 4: live status segments
  const timeStr = `${formatTerminalTime(currentTime)} / ${duration ? formatTerminalTime(duration) : '--:--'}`;
  const volStr = muted ? 'mute' : `vol:${Math.round(volume * 100)}`;
  const chapterStr = activeChapter ? activeChapter.slug : '';

  return (
    <div className="terminal-status-line" aria-live="polite">
      <span className="terminal-status-prompt">~/showreel $&nbsp;</span>
      <span className="terminal-status-state">{stateText}</span>
      <span className="terminal-status-sep" aria-hidden="true">&nbsp;|&nbsp;</span>
      <span className="terminal-status-time">{timeStr}</span>
      {chapterStr && (
        <>
          <span className="terminal-status-sep" aria-hidden="true">&nbsp;|&nbsp;</span>
          <span className="terminal-status-chapter">{chapterStr}</span>
        </>
      )}
      <span className="terminal-status-sep" aria-hidden="true">&nbsp;|&nbsp;</span>
      <span className="terminal-status-vol">{volStr}</span>
    </div>
  );
}
