/** @jsxImportSource react */

import { usePlayer } from '@videojs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CHAPTERS } from './terminal-command-line';

function secondsToMMSS(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

interface TerminalChapterMenuProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function TerminalChapterMenu({ open, onToggle, onClose }: TerminalChapterMenuProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const { currentTime } = usePlayer((s: any) => ({
    currentTime: Number(s.currentTime ?? 0),
  }));
  const api = usePlayer();

  const activeChapter = [...CHAPTERS]
    .reverse()
    .find((c) => currentTime >= c.time) ?? CHAPTERS[0];

  useEffect(() => {
    if (open) {
      const idx = activeChapter ? CHAPTERS.indexOf(activeChapter) : 0;
      requestAnimationFrame(() => {
        itemRefs.current[idx]?.focus();
      });
    }
  }, [open, activeChapter]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  const handleItemKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (idx + 1) % CHAPTERS.length;
      itemRefs.current[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (idx - 1 + CHAPTERS.length) % CHAPTERS.length;
      itemRefs.current[prev]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      seekToChapter(CHAPTERS[idx].time);
    }
  };

  const seekToChapter = (time: number) => {
    const v = document.querySelector('video'); if (v) v.currentTime = time;
    (api as any).seek?.(time);
    onClose();
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
        onClick={() => (open ? onClose() : onToggle())}
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
