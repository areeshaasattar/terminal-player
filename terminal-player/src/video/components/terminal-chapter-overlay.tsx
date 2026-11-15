/** @jsxImportSource react */

import { usePlayer } from '@videojs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CHAPTERS } from './terminal-command-line';
import { formatTerminalTime } from '../utils/format-time';

function secondsToMMSS(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TerminalChapterOverlay({ open, onClose }: Props) {
  const [focusIdx, setFocusIdx] = useState(0);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);

  const { currentTime } = usePlayer((s: any) => ({ currentTime: Number(s.currentTime ?? 0) }));
  const api = usePlayer();

  const activeChapter = [...CHAPTERS].reverse().find((c) => currentTime >= c.time) ?? CHAPTERS[0];

  useEffect(() => {
    if (open) {
      const idx = activeChapter ? CHAPTERS.indexOf(activeChapter) : 0;
      setFocusIdx(idx);
      requestAnimationFrame(() => itemRefs.current[idx]?.focus());
    }
  }, [open, activeChapter]);

  const seekToChapter = useCallback((time: number) => {
    const v = document.querySelector('video'); if (v) v.currentTime = time;
    (api as any).seek?.(time);
    onClose();
  }, [api, onClose]);

  const handleItemKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (idx + 1) % CHAPTERS.length;
      setFocusIdx(next);
      itemRefs.current[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (idx - 1 + CHAPTERS.length) % CHAPTERS.length;
      setFocusIdx(prev);
      itemRefs.current[prev]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      seekToChapter(CHAPTERS[idx].time);
    }
  };

  if (!open) return null;

  return (
    <div className="terminal-chapter-overlay" role="dialog" aria-label="Chapters" onClick={(e) => e.stopPropagation()}>
      <button
        ref={closeRef}
        type="button"
        className="terminal-chapter-close"
        aria-label="Close chapters"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        ✕
      </button>
      <div className="terminal-chapter-list">
        {CHAPTERS.map((ch, idx) => {
          const isActive = ch === activeChapter;
          return (
            <button
              key={ch.index}
              ref={(el) => { itemRefs.current[idx] = el; }}
              type="button"
              role="option"
              aria-selected={isActive}
              className={`terminal-chapter-row${isActive ? ' terminal-chapter-row--active' : ''}`}
              onClick={() => seekToChapter(ch.time)}
              onKeyDown={(e) => handleItemKeyDown(e, idx)}
            >
              <span className="terminal-chapter-file">{ch.file}</span>
              <span className="terminal-chapter-time">{secondsToMMSS(ch.time)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
