import { Video, VideoPlayer } from '@videojs/react/video';

import { VideoSkin } from '@/video/skin';

import type { PlaybackProps } from '../shell/params';

// Demo video that loads and plays reliably in all browsers
const SRC = 'https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4';
const POSTER = 'https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp?time=2';
/** Chapters for the time slider, served from `apps/preview/public`. */
const CHAPTERS = './cosmic-dawn-chapters.vtt';

/** `media` carries the workbench's playback options: autoplay, muted, loop, and preload. */
export function Player({ media }: { media?: PlaybackProps }) {
  return (
    <VideoPlayer poster={POSTER}>
      <VideoSkin>
        <Video {...media} src={SRC} playsInline preload="auto" crossOrigin="">
          <track kind="chapters" label="English" srcLang="en" src={CHAPTERS} default />
        </Video>
      </VideoSkin>
    </VideoPlayer>
  );
}
