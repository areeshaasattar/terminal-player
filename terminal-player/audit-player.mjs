import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const screenshotsDir = 'C:\\contra-challenge\\terminal-player\\screenshots';

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runAudit() {
  console.log('--- STARTING TERMINAL PLAYER AUDIT ---');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Navigate to preview frame directly or workbench
    console.log('Navigating to http://localhost:5173/preview.html...');
    await page.goto('http://localhost:5173/preview.html', { waitUntil: 'domcontentloaded' });

    // Wait for player to mount
    await page.waitForSelector('.media-skin', { timeout: 10000 });
    console.log('✓ Player mounted successfully.');

    // 1. Audit Visual Styling & Colors
    console.log('\n[AUDIT 1: VISUAL STYLING & PALETTE]');
    const styles = await page.evaluate(() => {
      const bar = document.querySelector('.terminal-controls-bar');
      const btn = document.querySelector('.terminal-play-btn');
      const statusLine = document.querySelector('.terminal-status-line');
      const container = document.querySelector('.media-skin');

      const barStyle = bar ? window.getComputedStyle(bar) : null;
      const btnStyle = btn ? window.getComputedStyle(btn) : null;
      const statusStyle = statusLine ? window.getComputedStyle(statusLine) : null;
      const containerStyle = container ? window.getComputedStyle(container) : null;

      return {
        barBg: barStyle?.backgroundColor,
        btnColor: btnStyle?.color,
        btnBorderRadius: btnStyle?.borderRadius,
        containerBorderRadius: containerStyle?.borderRadius,
        fontFamily: btnStyle?.fontFamily,
        statusBg: statusStyle?.backgroundColor,
        statusColor: statusStyle?.color,
      };
    });
    console.log('Controls Bar BG:', styles.barBg);
    console.log('Button Text Color:', styles.btnColor);
    console.log('Button Border Radius:', styles.btnBorderRadius);
    console.log('Container Border Radius:', styles.containerBorderRadius);
    console.log('Font Family:', styles.fontFamily);

    // Screenshot initial state
    await page.screenshot({ path: path.join(screenshotsDir, '01-initial-paused.png') });
    console.log('✓ Saved screenshot: 01-initial-paused.png');

    // 2. Audit Controls & Playback
    console.log('\n[AUDIT 2: CONTROLS & PLAYBACK]');
    const initialStatus = await page.$eval('.terminal-status-line', (el) => el.textContent.trim());
    const initialPlayText = await page.$eval('.terminal-play-btn', (el) => el.textContent.trim());
    const initialTime = await page.$eval('.terminal-time-group', (el) => el.textContent.trim());
    const initialBlocks = await page.$eval('.terminal-block-bar', (el) => el.textContent.trim());
    const initialVolText = await page.$eval('.terminal-mute-btn', (el) => el.textContent.trim());
    const initialFsText = await page.$eval('.terminal-fullscreen-btn', (el) => el.textContent.trim());

    console.log('Initial Status line:', initialStatus);
    console.log('Initial Play button text:', initialPlayText);
    console.log('Initial Time display:', initialTime);
    console.log('Initial Seek blocks:', initialBlocks);
    console.log('Initial Volume button:', initialVolText);
    console.log('Initial Fullscreen button:', initialFsText);

    // Test Play Click
    console.log('Clicking play button...');
    await page.click('.terminal-play-btn');
    await new Promise((r) => setTimeout(r, 2000));

    const playingStatus = await page.$eval('.terminal-status-line', (el) => el.textContent.trim());
    const playingPlayText = await page.$eval('.terminal-play-btn', (el) => el.textContent.trim());
    const isCursorBlinking = await page.$eval('.terminal-cursor', (el) => el.classList.contains('terminal-cursor-blinking'));
    const playingTime = await page.$eval('.terminal-time-group', (el) => el.textContent.trim());
    const playingBlocks = await page.$eval('.terminal-block-bar', (el) => el.textContent.trim());

    console.log('Playing Status line:', playingStatus);
    console.log('Playing Play button text:', playingPlayText);
    console.log('Playing Time display:', playingTime);
    console.log('Playing Seek blocks:', playingBlocks);
    console.log('Cursor blinking while playing:', isCursorBlinking);

    await page.screenshot({ path: path.join(screenshotsDir, '02-playing-state.png') });
    console.log('✓ Saved screenshot: 02-playing-state.png');

    // Test Mute Click
    console.log('Testing volume mute toggle...');
    await page.click('.terminal-mute-btn');
    await new Promise((r) => setTimeout(r, 500));
    const mutedText = await page.$eval('.terminal-mute-btn', (el) => el.textContent.trim());
    console.log('Volume button text when muted:', mutedText);

    await page.click('.terminal-mute-btn'); // Unmute
    await new Promise((r) => setTimeout(r, 500));
    const unmutedText = await page.$eval('.terminal-mute-btn', (el) => el.textContent.trim());
    console.log('Volume button text when unmuted:', unmutedText);

    // 3. Audit Keyboard Access & Focus Outline
    console.log('\n[AUDIT 3: KEYBOARD ACCESSIBILITY & FOCUS OUTLINE]');
    // Reset focus to top
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
      }
    });

    const focusedElements = [];

    for (let i = 0; i < 7; i++) {
      await page.keyboard.press('Tab');
      await new Promise((r) => setTimeout(r, 200));

      const focusInfo = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const style = window.getComputedStyle(el);
        return {
          tagName: el.tagName,
          className: el.className,
          role: el.getAttribute('role'),
          text: el.textContent?.trim()?.slice(0, 30),
          outline: style.outline,
          outlineColor: style.outlineColor,
          outlineWidth: style.outlineWidth,
        };
      });

      if (focusInfo) {
        focusedElements.push(focusInfo);
        console.log(`Tab ${i + 1} focused: <${focusInfo.tagName} class="${focusInfo.className}"> Role: ${focusInfo.role} Outline: ${focusInfo.outlineColor} ${focusInfo.outlineWidth}`);
      }
    }

    await page.screenshot({ path: path.join(screenshotsDir, '03-keyboard-focus.png') });
    console.log('✓ Saved screenshot: 03-keyboard-focus.png');

    // 4. Audit Touch Target Sizes
    console.log('\n[AUDIT 4: TOUCH TARGET SIZES]');
    const targets = await page.evaluate(() => {
      const items = [
        { name: 'Play Button', sel: '.terminal-play-btn' },
        { name: 'Seek Slider', sel: '.terminal-seek-slider' },
        { name: 'Mute Button', sel: '.terminal-mute-btn' },
        { name: 'Volume Slider', sel: '.terminal-volume-slider' },
        { name: 'Fullscreen Button', sel: '.terminal-fullscreen-btn' },
      ];
      return items.map((item) => {
        const el = document.querySelector(item.sel);
        if (!el) return { name: item.name, found: false };
        const rect = el.getBoundingClientRect();
        return {
          name: item.name,
          found: true,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          meetsMin44px: rect.width >= 44 && rect.height >= 44,
        };
      });
    });

    for (const t of targets) {
      console.log(`Target [${t.name}]: ${t.width}x${t.height}px -> Meets 44x44px: ${t.meetsMin44px ? 'PASS' : 'FAIL'}`);
    }

    // 5. Audit Mobile Responsive Layout (375px width)
    console.log('\n[AUDIT 5: MOBILE RESPONSIVE LAYOUT (375px)]');
    await page.setViewport({ width: 375, height: 667 });
    await new Promise((r) => setTimeout(r, 1000));

    const mobileCheck = await page.evaluate(() => {
      const play = document.querySelector('.terminal-play-btn');
      const seek = document.querySelector('.terminal-seek-slider');
      const time = document.querySelector('.terminal-time-group');
      const vol = document.querySelector('.terminal-mute-btn');
      const fs = document.querySelector('.terminal-fullscreen-btn');
      const secondaryLabel = document.querySelector('.terminal-btn-secondary-label');

      const isVisible = (el) => {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      };

      return {
        playVisible: isVisible(play),
        seekVisible: isVisible(seek),
        timeVisible: isVisible(time),
        volumeVisible: isVisible(vol),
        fullscreenVisible: isVisible(fs),
        secondaryLabelHidden: secondaryLabel ? window.getComputedStyle(secondaryLabel).display === 'none' : true,
      };
    });

    console.log('Mobile Check:', mobileCheck);
    await page.screenshot({ path: path.join(screenshotsDir, '04-mobile-viewport.png') });
    console.log('✓ Saved screenshot: 04-mobile-viewport.png');

    // 6. Audit Reduced Motion
    console.log('\n[AUDIT 6: REDUCED MOTION]');
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await new Promise((r) => setTimeout(r, 500));

    const reducedMotionCheck = await page.evaluate(() => {
      const cursor = document.querySelector('.terminal-cursor');
      if (!cursor) return { cursorFound: false };
      const style = window.getComputedStyle(cursor);
      return {
        cursorFound: true,
        animationName: style.animationName,
      };
    });
    console.log('Reduced Motion Cursor Animation:', reducedMotionCheck);

    console.log('\n--- ALL AUDITS COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('Audit failed with error:', err);
  } finally {
    await browser.close();
  }
}

runAudit();
