# Design Spec: Terminal Player

## 1. Overview
A custom Video.js 10 skin designed for developer portfolio showreels, evoking a code editor or retro CRT terminal environment with precise typography, square corners, and monospace aesthetic.

## 2. Visual Palette & Surfaces
- **Background**: Near-black charcoal (`#0d0f12`).
- **Primary Text & Indicators**: Warm amber (`#ffb000`).
- **Secondary Accent**: Soft cyan (`#5ce1e6`) for focus outline, hover states, and active slider fills.
- **Muted Borders**: Thin 1px solid borders (`#262b33` / `#ffb00040`).
- **Corner Radius**: 0px throughout (strictly square corners, no rounded buttons or pills).
- **Scanline Texture**: Subtle horizontal scanline overlay on the control bar only (very low opacity ~0.08), never over video canvas.
- **Contrast Protection**: Solid / semi-opaque dark backing (`rgba(13, 15, 18, 0.95)`) behind controls to ensure WCAG AAA contrast over bright and dark video frames alike.

## 3. Typography
- **Font Stack**: `'JetBrains Mono', 'IBM Plex Mono', 'Cascadia Code', 'Fira Code', 'Courier New', monospace`.
- **Numbers**: `tabular-nums` throughout to prevent layout jitter as seconds elapse.
- **Font Sizes**: 12px-14px for terminal text labels, 11px for status line.

## 4. Controls & Structure
1. **Status Line (Top Bar / Header)**:
   - Displays terminal prompt: `~/showreel $ playing` or `~/showreel $ paused`.
   - Subtle top-left or top-bar positioning with monospace styling.
2. **Play / Pause Button**:
   - Monospace text toggle: `> play` when paused, `|| pause` when playing.
   - Distinct hover and focus states with cyan accent.
3. **Time Display**:
   - Format: `MM:SS / MM:SS` (e.g., `02:14 / 05:00`).
   - Accompanied by a blinking block cursor `_` while playing.
4. **Seek Bar (ASCII Block Progress)**:
   - Visual style: Text-style progress bar comprised of filled/unfilled terminal blocks `[████████░░░░░░░░]`.
   - Fully interactive, draggable slider (range input / slider primitive) maintaining complete keyboard and screen reader accessibility (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
5. **Volume Control**:
   - Mute toggle button labeled `vol` (unmuted) / `mute` (muted).
   - Draggable horizontal volume slider styled with block track.
6. **Fullscreen Button**:
   - Monospace labeled button: `[ ]` (or `[X]` when in fullscreen mode).

## 5. Accessibility & Responsiveness
- **Keyboard Navigation**: Standard Tab, Shift+Tab, Enter/Space for buttons, Arrow keys for sliders.
- **Focus Indicator**: High-contrast `2px solid #5ce1e6` outline with 2px offset.
- **Touch Targets**: Minimum 44x44px hit-test targets across buttons and slider thumbs/tracks on mobile/touch pointers.
- **Prefers-Reduced-Motion**: Under `prefers-reduced-motion: reduce`, cursor blink animation is disabled and any transitions are set to 0s.
- **Responsive / Mobile Container Query**:
   - At widths < 560px, status line simplifies, secondary spacing tightens, while core controls (play, seek, time, volume, fullscreen) remain prominent and accessible.

