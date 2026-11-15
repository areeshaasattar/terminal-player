import { HlsJsVideo } from '@videojs/react/media/hlsjs-video';
import { VideoPlayer } from '@videojs/react/video';
import { useState } from 'react';

import { VideoSkin } from '@/video/skin';

import type { PlaybackProps } from '../shell/params';

const HLS_SRC = 'https://stream.mux.com/3WlnN6B3hgls00ipUewyUahOBVxiyS4PeBxE4gm00h33Y.m3u8';
const FALLBACK_SRC = 'https://stream.mux.com/3WlnN6B3hgls00ipUewyUahOBVxiyS4PeBxE4gm00h33Y/medium.mp4';
const POSTER = 'https://image.mux.com/3WlnN6B3hgls00ipUewyUahOBVxiyS4PeBxE4gm00h33Y/thumbnail.webp?time=2';
/** Chapters for the time slider, served from `apps/preview/public`. */
const CHAPTERS = './cosmic-dawn-chapters.vtt';

/** `media` carries the workbench's playback options: autoplay, muted, loop, and preload. */
export function Player({ media }: { media?: PlaybackProps }) {
  const [src, setSrc] = useState(HLS_SRC);
  return (
    <VideoPlayer poster={POSTER}>
      <VideoSkin>
        <HlsJsVideo
          {...media}
          src={src}
          playsInline
          preload="auto"
          crossOrigin=""
          onError={() => setSrc(FALLBACK_SRC)}
        >
          <track kind="chapters" label="English" srcLang="en" src={CHAPTERS} default />
        </HlsJsVideo>
      </VideoSkin>
    </VideoPlayer>
  );
}
