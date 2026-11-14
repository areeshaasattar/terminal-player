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

export function TerminalChapterMenu() {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const { currentTime } = usePlayer((s: any) => ({
    currentTime: Number(s.currentTime ?? 0),
  }));
  const api = usePlayer();

  // Determine active chapter
  const activeChapter = [...CHAPTERS]
    .reverse()
    .find((c) => currentTime >= c.time) ?? CHAPTERS[0];

  const openMenu = () => {
    setOpen(true);
    setFocusIdx(activeChapter ? CHAPTERS.indexOf(activeChapter) : 0);
  };

  const closeMenu = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  // Focus correct item when menu opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        itemRefs.current[focusIdx]?.focus();
      });
    }
  }, [open, focusIdx]);

  // Close on outside click / escape handled in item keydown
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, closeMenu]);

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
      closeMenu();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      seekToChapter(CHAPTERS[idx].time);
    }
  };

  const seekToChapter = (time: number) => {
    (api as any).seek?.(time);
    closeMenu();
  };

  return (
    <div className="terminal-chapter-container">
      <button
        ref={buttonRef}
        type="button"
        className="terminal-control-btn terminal-chapters-btn"
        aria-label="Chapters (ls)"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => (open ? closeMenu() : openMenu())}
      >
        <span className="terminal-btn-label">ls</span>
        <span className="terminal-btn-secondary-label">&nbsp;chapters</span>
      </button>

      {open && (
        <div
          ref={menuRef}
          className="terminal-chapter-menu"
          role="listbox"
          aria-label="Chapters"
        >
          <div className="terminal-chapter-menu-header" aria-hidden="true">
            ~/showreel $ ls
          </div>
          {CHAPTERS.map((ch, idx) => {
            const isActive = ch === activeChapter;
            return (
              <button
                key={ch.index}
                ref={(el) => { itemRefs.current[idx] = el; }}
                type="button"
                role="option"
                aria-selected={isActive}
                className={`terminal-chapter-item${isActive ? ' terminal-chapter-item--active' : ''}`}
                onClick={() => seekToChapter(ch.time)}
                onKeyDown={(e) => handleItemKeyDown(e, idx)}
              >
                <span className="terminal-chapter-file">{ch.file}</span>
                <span className="terminal-chapter-time">{secondsToMMSS(ch.time)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
