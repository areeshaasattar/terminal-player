import puppeteer from 'puppeteer-core';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const screenshotsDir = 'C:\\contra-challenge\\terminal-player\\screenshots';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 667 });

  const ratios = ['9:16', '16:9', '1:1'];

  for (const r of ratios) {
    const encodedRatio = encodeURIComponent(r);
    const url = `http://localhost:5173/preview.html#width=375&ratio=${encodedRatio}`;
    console.log(`\nTesting ${r} at ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    await new Promise(res => setTimeout(res, 1000));

    const data = await page.evaluate(() => {
      const skin = document.querySelector('.media-skin');
      const video = document.querySelector('video');
      const bar = document.querySelector('.terminal-controls-bar');
      const controlsPanel = document.querySelector('.terminal-controls-panel');
      const statusLine = document.querySelector('.terminal-status-line');
      const seekSlider = document.querySelector('.terminal-seek-slider');
      const seekTrack = document.querySelector('.terminal-seek-track');

      const sRect = skin?.getBoundingClientRect();
      const vRect = video?.getBoundingClientRect();
      const bRect = bar?.getBoundingClientRect();
      const cRect = controlsPanel?.getBoundingClientRect();
      const stRect = statusLine?.getBoundingClientRect();
      const tRect = seekTrack?.getBoundingClientRect();

      const vStyle = video ? window.getComputedStyle(video) : null;
      const sStyle = skin ? window.getComputedStyle(skin) : null;

      // Touch targets check
      const targets = [
        { name: 'Play', sel: '.terminal-play-btn' },
        { name: 'Seek', sel: '.terminal-seek-slider' },
        { name: 'Mute', sel: '.terminal-mute-btn' },
        { name: 'Fullscreen', sel: '.terminal-fullscreen-btn' },
      ].map(t => {
        const el = document.querySelector(t.sel);
        const rect = el?.getBoundingClientRect();
        return {
          name: t.name,
          w: rect ? Math.round(rect.width) : 0,
          h: rect ? Math.round(rect.height) : 0,
          pass: rect ? rect.width >= 44 && rect.height >= 44 : false
        };
      });

      return {
        skin: { w: sRect?.width, h: sRect?.height, top: sRect?.top, bottom: sRect?.bottom },
        skinAspectRatio: sStyle?.aspectRatio,
        video: { w: vRect?.width, h: vRect?.height, top: vRect?.top, bottom: vRect?.bottom },
        videoObjectFit: vStyle?.objectFit,
        videoObjectPosition: vStyle?.objectPosition,
        controls: { w: cRect?.width, h: cRect?.height, top: cRect?.top, bottom: cRect?.bottom },
        bar: { w: bRect?.width, h: bRect?.height, top: bRect?.top, bottom: bRect?.bottom },
        seekOverflows: tRect && bRect ? tRect.right > bRect.right : false,
        controlBarPinnedBottom: sRect && bRect ? Math.abs(sRect.bottom - bRect.bottom) < 2 : false,
        targets,
      };
    });

    console.log(`Results for ${r}:`, JSON.stringify(data, null, 2));
    const safeName = r.replace(':', 'x');
    await page.screenshot({ path: path.join(screenshotsDir, `ratio-${safeName}-375px.png`) });
  }

  await browser.close();
}

main().catch(console.error);
