/** @jsxImportSource react */

import { Controls, Tooltip } from '@videojs/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { TerminalChapterMenu } from './components/terminal-chapter-menu';
import { TerminalEndScreen } from './components/terminal-end-screen';
import { TerminalCommandLine } from './components/terminal-command-line';
import { TerminalFullscreenButton } from './components/terminal-fullscreen-button';
import { TerminalPlayButton } from './components/terminal-play-button';
import { TerminalSeekBar } from './components/terminal-seek-bar';
import { TerminalStatusLine } from './components/terminal-status-line';
import { TerminalTimeDisplay } from './components/terminal-time-display';
import { TerminalVolume } from './components/terminal-volume';
import { useCmdFocus } from './shared/cmd-focus-context';

export function VideoControls(_props: { renderThumbnail?: any } = {}) {
  const { setCmdFocused } = useCmdFocus();
  const [cliOpen, setCliOpen] = useState(false);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  const closeCli = useCallback(() => {
    setCliOpen(false);
    setCmdFocused(false);
    toggleBtnRef.current?.focus();
  }, [setCmdFocused]);

  const openCli = useCallback(() => {
    setCliOpen(true);
  }, []);

  // Backtick toggles; Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';

      if (e.key === '`' && !inInput) {
        e.preventDefault();
        setCliOpen((prev) => !prev);
      } else if (e.key === 'Escape' && cliOpen) {
        // only if not handled by input
        if (!inInput) {
          e.preventDefault();
          closeCli();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cliOpen, closeCli]);

  return (
    <Controls.Root>
      <Controls.Backdrop className="video-controls-backdrop" />
      <Controls.Content className="terminal-controls-content">
        <Tooltip.Provider>
          <div className="terminal-controls-panel">
            <TerminalEndScreen />
            <TerminalCommandLine
              open={cliOpen}
              onClose={closeCli}
              onFocusChange={setCmdFocused}
            />
            <TerminalStatusLine />
            <div className="terminal-controls-bar">
              <div className="terminal-seek-row">
                <TerminalSeekBar />
              </div>
              <div className="terminal-actions-row">
                <div className="terminal-actions-start">
                  <TerminalPlayButton />
                  <TerminalTimeDisplay />
                </div>
                <div className="terminal-actions-end">
                  {/* Command line toggle */}
                  <button
                    ref={toggleBtnRef}
                    type="button"
                    className="terminal-control-btn terminal-cli-toggle-btn"
                    aria-label="Open command line"
                    title="Command line (press ` to open)"
                    aria-expanded={cliOpen}
                    onClick={() => (cliOpen ? closeCli() : openCli())}
                  >
                    <span className="terminal-btn-label">
                      &gt;_<span className="terminal-btn-text"> cmd</span>
                    </span>
                  </button>
                  {/* Phase 3: chapters button */}
                  <TerminalChapterMenu />
                  <TerminalVolume />
                  <TerminalFullscreenButton />
                </div>
              </div>
            </div>
          </div>
        </Tooltip.Provider>
      </Controls.Content>
    </Controls.Root>
  );
}