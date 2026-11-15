# Terminal Player: a Video.js v10 skin

A terminal-style skin for the Video.js v10 player, built for the
Video.js Skins Design Challenge.

Live demo: https://terminal-player-eight.vercel.app

## Design
- Palette: near-black charcoal, warm amber text, one cyan accent for
  focus and the playhead.
- Seek bar and volume drawn as text blocks, buttons labeled like
  commands, and a live status line.
- Press the ">_" button (or backtick) and type "help" to control the
  player from a command line: seek, vol, mute, ls, cd, fullscreen.
- Chapters are listed as files ("ls chapters").
- End screen prints "process exited with code 0" with a "> replay"
  prompt.

## Accessibility
Solid control bar for legibility over any footage, visible cyan focus
rings, 44px touch targets, responsive layout via container queries,
keyboard-operable menus (Escape closes), and prefers-reduced-motion
support.

## Run locally
```sh
cd terminal-player
pnpm install
pnpm dev
```
The workbench opens at http://localhost:5173.