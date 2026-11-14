/** @jsxImportSource react */

import { usePlayer } from '@videojs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { formatTerminalTime } from '../utils/format-time';

// Chapter data matching the VTT file
export const CHAPTERS = [
  { index: 1, slug: 'intro', label: 'A Never-Before-Seen Look', time: 0, file: '01_intro.mp4' },
  { index: 2, slug: 'voyage', label: 'The Voyage to Cosmic Dawn', time: 10, file: '02_voyage.mp4' },
  { index: 3, slug: 'building', label: 'Building and Launching Webb', time: 20, file: '03_building.mp4' },
  { index: 4, slug: 'challenges', label: 'The Challenges and Promise of Webb', time: 30, file: '04_challenges.mp4' },
];

function padTime(n: number) {
  return n.toString().padStart(2, '0');
}

function secondsToMMSS(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${padTime(m)}:${padTime(sec)}`;
}

function parseSeekTarget(arg: string): number | null {
  // mm:ss or hh:mm:ss
  if (/^\d+:\d{2}(:\d{2})?$/.test(arg)) {
    const parts = arg.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  // plain seconds
  if (/^\d+(\.\d+)?$/.test(arg)) return Number(arg);
  return null;
}

function findChapter(arg: string): (typeof CHAPTERS)[number] | null {
  const n = parseInt(arg, 10);
  if (!isNaN(n)) return CHAPTERS.find((c) => c.index === n) ?? null;
  const lower = arg.toLowerCase();
  return CHAPTERS.find((c) => c.slug.includes(lower) || c.label.toLowerCase().includes(lower)) ?? null;
}

const HELP_TEXT = 'play | pause | seek <mm:ss> | seek +10/-10 | vol <0-100> | mute | ls | cd <n> | fullscreen | clear';

interface CommandLineProps {
  /** Whether the overlay panel is open */
  open: boolean;
  /** Close the overlay panel */
  onClose: () => void;
  /** Set true while the command input is focused so hotkeys.tsx can disable shortcuts */
  onFocusChange: (focused: boolean) => void;
}

export function TerminalCommandLine({ open, onClose, onFocusChange }: CommandLineProps) {
  const player = usePlayer((s: any) => ({
    paused: Boolean(s.paused),
    currentTime: Number(s.currentTime ?? 0),
    duration: Number(s.duration ?? 0),
    volume: Number(s.volume ?? 1),
    muted: Boolean(s.muted),
    fullscreen: Boolean(s.fullscreen),
  }));
  const api = usePlayer();

  const [value, setValue] = useState('');
  const [output, setOutput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const liveRef = useRef<HTMLDivElement>(null);
  const welcomed = useRef(false);

  // Welcome message on first open
  useEffect(() => {
    if (open && !welcomed.current) {
      welcomed.current = true;
      setOutput('welcome to showreel. type help for commands.\ntry: seek 0:20 | vol 50 | ls');
    }
  }, [open]);

  const executeCommand = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;

      // Add to history
      setHistory((h) => [trimmed, ...h.slice(0, 49)]);
      setHistIdx(-1);

      const [cmd, ...args] = trimmed.split(/\s+/);
      const arg = args.join(' ');

      let result = '';

      switch (cmd.toLowerCase()) {
        case 'play':
          (api as any).play?.();
          result = 'playing';
          break;

        case 'pause':
          (api as any).pause?.();
          result = 'paused';
          break;

        case 'toggle':
          if (player.paused) {
            (api as any).play?.();
            result = 'playing';
          } else {
            (api as any).pause?.();
            result = 'paused';
          }
          break;

        case 'seek': {
          if (arg === '+10') {
            const t = Math.min(player.currentTime + 10, player.duration);
            (api as any).seek?.(t);
            result = `seeked to ${formatTerminalTime(t)}`;
          } else if (arg === '-10') {
            const t = Math.max(player.currentTime - 10, 0);
            (api as any).seek?.(t);
            result = `seeked to ${formatTerminalTime(t)}`;
          } else {
            const t = parseSeekTarget(arg);
            if (t === null) {
              result = `error: invalid time "${arg}". use mm:ss, hh:mm:ss, or seconds`;
            } else {
              const clamped = Math.max(0, Math.min(t, player.duration || Infinity));
              (api as any).seek?.(clamped);
              result = `seeked to ${formatTerminalTime(clamped)}`;
            }
          }
          break;
        }

        case 'vol': {
          const v = parseInt(arg, 10);
          if (isNaN(v) || v < 0 || v > 100) {
            result = `error: vol expects 0-100, got "${arg}"`;
          } else {
            (api as any).setVolume?.(v / 100);
            result = `vol set to ${v}`;
          }
          break;
        }

        case 'mute':
          (api as any).setMuted?.(true);
          result = 'muted';
          break;

        case 'unmute':
          (api as any).setMuted?.(false);
          result = 'unmuted';
          break;

        case 'fullscreen':
          (api as any).requestFullscreen?.();
          result = 'entering fullscreen';
          break;

        case 'ls': {
          const lines = CHAPTERS.map(
            (c) =>
              `${c.file.padEnd(22, ' ')}${secondsToMMSS(c.time)}`
          );
          result = lines.join('\n');
          break;
        }

        case 'cd': {
          if (!arg) {
            result = 'error: cd requires a chapter number or name';
          } else {
            const ch = findChapter(arg);
            if (!ch) {
              result = `error: no chapter matching "${arg}"`;
            } else {
              (api as any).seek?.(ch.time);
              result = `cd ${ch.file}  →  ${secondsToMMSS(ch.time)}`;
            }
          }
          break;
        }

        case 'help':
          result = HELP_TEXT;
          break;

        case 'clear':
          setOutput('');
          setValue('');
          return;

        default:
          result = `error: unknown command '${cmd}'. type help`;
      }

      setOutput(result);
      setValue('');
    },
    [api, player]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        executeCommand(value);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        inputRef.current?.blur();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHistIdx((i) => {
          const next = Math.min(i + 1, history.length - 1);
          setValue(history[next] ?? '');
          return next;
        });
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHistIdx((i) => {
          const next = Math.max(i - 1, -1);
          setValue(next === -1 ? '' : (history[next] ?? ''));
          return next;
        });
      }
    },
    [executeCommand, value, history]
  );

  const handleFocus = () => onFocusChange(true);
  const handleBlur = () => onFocusChange(false);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on Escape handled in keydown; also close if open and Escape pressed globally
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    onKeyDown(e);
  };

  if (!open) return null;

  return (
    <div
      className="terminal-cli-overlay"
      role="dialog"
      aria-label="Command line"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="terminal-cli-close"
        aria-label="Close command line"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
          onFocusChange(false);
        }}
      >
        ✕
      </button>
      {output && (
        <div
          ref={liveRef}
          className="terminal-cli-output"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {output.split('\\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
      <div className="terminal-cli-row">
        <span className="terminal-cli-prompt" aria-hidden="true">
          $&nbsp;
        </span>
        <input
          ref={inputRef}
          className="terminal-cli-input"
          type="text"
          value={value}
          placeholder='type "help" and press Enter'
          aria-label="Terminal command input"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
    </div>
  );
}
