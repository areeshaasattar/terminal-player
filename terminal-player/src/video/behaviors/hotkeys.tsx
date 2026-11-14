/** @jsxImportSource react */

import { Hotkey } from '@videojs/react';

import { useCmdFocus } from '../shared/cmd-focus-context';
import { PlaybackHotkeys } from './playback-hotkeys';

export interface VideoHotkeysProps {
  disabled?: boolean | undefined;
}

export function VideoHotkeys({ disabled = false }: VideoHotkeysProps = {}) {
  const { cmdFocused } = useCmdFocus();
  // Disable all hotkeys while the command input is focused
  const off = disabled || cmdFocused;
  return (
    <>
      <PlaybackHotkeys disabled={off} />
      <Hotkey disabled={off} keys="f" action="toggleFullscreen" />
      <Hotkey disabled={off} keys="c" action="toggleSubtitles" />
      <Hotkey disabled={off} keys="i" action="togglePictureInPicture" />
    </>
  );
}
