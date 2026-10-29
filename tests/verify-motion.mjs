import { chromium } from 'playwright';
import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;
const FRAMES_DIR = path.resolve('./tests/screenshots/motion_frames');

if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

async function waitForServer(url, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function runMotionVerification() {
  console.log('--- AVVIO VERIFICA END-TO-END DEL MOTION DESIGN (FASE 8) ---');
  spawnSync('npx', ['astro', 'preview', 'stop'], { stdio: 'ignore' });

  const server = spawn('npm', ['run', 'preview', '--', '--port', String(PORT)], {
    stdio: 'pipe',
    detached: false,
  });

  let browser;
  try {
    await waitForServer(BASE_URL);
    console.log('✓ Preview server attivo su', BASE_URL);

    browser = await chromium.launch({ headless: true });

    // =========================================================================
    // TEST A & B: COLD CACHE & WARM CACHE INITIAL LOAD + HERO SEQUENCE
    // =========================================================================
    console.log('\n[Test A & B] Caricamento iniziale (Cold & Warm Cache) + Sequenza temporale Hero');
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));

    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });

    // Inject observer before navigation to detect any first-paint flash of unmasked image
    await page.addInitScript(() => {
      window.__flashDetected = false;
      window.__initialSamples = [];
      const sample = (label) => {
        const mask = document.querySelector('[data-hero-photo-mask]') || document.querySelector('[data-scroll-photo]');
        const frame = document.querySelector('[data-hero-photo-link]');
        if (!mask) return;
        const style = window.getComputedStyle(mask);
        const frameRect = frame ? frame.getBoundingClientRect() : null;
        const isRevealed = mask.classList.contains('is-revealed');
        const triggered = mask.dataset.photoTriggered === 'true';
        // A flash means before the photo reveal is triggered, opacity is 1 and clipPath is none
        if (!triggered && !isRevealed && parseFloat(style.opacity) > 0.5 && (style.clipPath === 'none' || style.clipPath === 'inset(0% 0% 0% 0%)' || style.clipPath === 'inset(0px)')) {
          window.__flashDetected = true;
        }
        window.__initialSamples.push({
          label,
          time: performance.now(),
          opacity: style.opacity,
          clipPath: style.clipPath,
          triggered,
          isRevealed,
          frameWidth: frameRect ? Math.round(frameRect.width) : null,
          frameHeight: frameRect ? Math.round(frameRect.height) : null,
        });
      };
      document.addEventListener('DOMContentLoaded', () => sample('DOMContentLoaded'));
      requestAnimationFrame(() => sample('rAF-1'));
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    // Capture temporal sequence of the Hero reveal: 0ms, 180ms, 400ms, 700ms, 1300ms
    const heroTimestamps = [0, 180, 400, 700, 1300];
    let elapsed = 0;
    const frameDimensions = [];
    for (const targetMs of heroTimestamps) {
      const wait = targetMs - elapsed;
      if (wait > 0) await page.waitForTimeout(wait);
      elapsed = targetMs;
      await page.screenshot({
        path: path.join(FRAMES_DIR, `hero_cold_${String(targetMs).padStart(4, '0')}ms.png`),
        fullPage: false,
      });
      const dim = await page.evaluate(() => {
        const frame = document.querySelector('[data-hero-photo-link]');
        const mask = document.querySelector('[data-hero-photo-mask]');
        const rect = frame.getBoundingClientRect();
        const cs = window.getComputedStyle(mask);
        return {
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          opacity: cs.opacity,
          clipPath: cs.clipPath,
          isRevealed: mask.classList.contains('is-revealed'),
        };
      });
      frameDimensions.push({ targetMs, ...dim });
    }

    const coldFlash = await page.evaluate(() => ({
      flash: window.__flashDetected,
      samples: window.__initialSamples,
    }));

    if (coldFlash.flash) {
      throw new Error(`Flash rilevato al primo paint (cold cache): ${JSON.stringify(coldFlash.samples)}`);
    }

    // Verify container dimensions stayed 100% constant across all frames
    const firstDim = frameDimensions[0];
    for (const d of frameDimensions) {
      if (d.width !== firstDim.width || d.height !== firstDim.height) {
        throw new Error(
          `Instabilità geometrica sul contenitore Hero: ${firstDim.width}x${firstDim.height} vs ${d.width}x${d.height} a ${d.targetMs}ms`
        );
      }
    }
    const finalHeroState = frameDimensions[frameDimensions.length - 1];
    if (!finalHeroState.isRevealed || finalHeroState.opacity !== '1') {
      throw new Error(`Hero photo non ha raggiunto lo stato finale stabile: ${JSON.stringify(finalHeroState)}`);
    }
    console.log('  ✓ Cold cache: zero flash al primo paint, geometria Hero stabile', `${firstDim.width}x${firstDim.height}px`, 'e stato finale .is-revealed raggiunto');

    // Warm Cache Reload test
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1400);
    const warmResult = await page.evaluate(() => {
      const mask = document.querySelector('[data-hero-photo-mask]');
      return {
        flash: window.__flashDetected,
        isRevealed: mask?.classList.contains('is-revealed'),
        opacity: mask ? window.getComputedStyle(mask).opacity : null,
      };
    });
    if (warmResult.flash || !warmResult.isRevealed || warmResult.opacity !== '1') {
      throw new Error(`Errore nel test con cache calda: ${JSON.stringify(warmResult)}`);
    }
    console.log('  ✓ Warm cache: zero flash al reload e Hero rivelata correttamente');

    // =========================================================================
    // TEST C: ALL SITE IMAGES (BELOW THE FOLD, PORTFOLIO, PROJECT GALLERIES)
    // =========================================================================
    console.log('\n[Test C] Verifica stato pre-scroll e reveal durante lo scroll su tutte le pagine');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Before scrolling on homepage, check that below-the-fold [data-scroll-photo] are still hidden (opacity: 0)
    const belowFoldBeforeScroll = await page.evaluate(() => {
      const photos = Array.from(document.querySelectorAll('[data-scroll-photo]'));
      return photos.map((p) => {
        const rect = p.getBoundingClientRect();
        const cs = window.getComputedStyle(p);
        return {
          top: Math.round(rect.top),
          opacity: cs.opacity,
          clipPath: cs.clipPath,
          isRevealed: p.classList.contains('is-revealed'),
        };
      });
    });

    const unrevealedBelowFold = belowFoldBeforeScroll.filter((p) => p.top > 900);
    if (unrevealedBelowFold.length === 0) {
      throw new Error('Nessuna foto sotto la piega trovata sulla homepage');
    }
    for (const p of unrevealedBelowFold) {
      if (parseFloat(p.opacity) > 0.05 || p.isRevealed) {
        throw new Error(`Foto sotto la piega già visibile prima dello scroll: ${JSON.stringify(p)}`);
      }
    }
    console.log(`  ✓ ${unrevealedBelowFold.length} fotografie sotto la piega sono correttamente in stato pre-reveal (opacity: 0, clip-path attivo) prima dello scroll`);

    // Progressive smooth scroll through all photographic pages
    const photoRoutes = [
      '/',
      '/progetti',
      '/progetti/casa-gracchi',
      '/progetti/casa-mg',
      '/progetti/casa-jd',
      '/progetti/casa-fp',
      '/progetti/villa-residenziale',
    ];

    for (const route of photoRoutes) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      // Scroll step by step to trigger viewport reveals naturally
      await page.evaluate(async () => {
        const step = Math.floor(window.innerHeight * 0.65);
        for (let y = 0; y <= document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, document.body.scrollHeight);
      });
      await page.waitForTimeout(1300);

      const status = await page.evaluate(() => {
        const masks = Array.from(
          document.querySelectorAll('[data-hero-photo-mask], [data-scroll-photo]')
        );
        return masks.map((m) => {
          const cs = window.getComputedStyle(m);
          const img = m.querySelector('img');
          return {
            isRevealed: m.classList.contains('is-revealed'),
            opacity: cs.opacity,
            clipPath: cs.clipPath,
            imgComplete: img ? img.complete && img.naturalWidth > 0 : false,
          };
        });
      });

      const failed = status.filter(
        (s) => !s.isRevealed || s.opacity !== '1' || !s.imgComplete
      );
      if (failed.length > 0) {
        throw new Error(`Immagini non rivelate correttamente su ${route}: ${JSON.stringify(failed)}`);
      }
      console.log(`  ✓ ${route.padEnd(28)} Tutte le ${status.length} fotografie rivelate con successo (.is-revealed, opacity: 1)`);
    }

    // Capture a mid-scroll frame on /progetti to verify visual quality
    await page.goto(`${BASE_URL}/progetti`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(FRAMES_DIR, 'progetti_entrance_250ms.png'),
      fullPage: false,
    });
    await page.waitForTimeout(1100);
    await page.screenshot({
      path: path.join(FRAMES_DIR, 'progetti_entrance_1350ms.png'),
      fullPage: false,
    });

    // =========================================================================
    // TEST D: NAVIGATION & REMOUNTING (/ -> /progetti -> /progetti/casa-gracchi -> back -> back)
    // =========================================================================
    console.log('\n[Test D] Navigazione multi-pagina e ritorno con cronologia browser');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.click('a[href="/progetti"]');
    await page.waitForURL(`${BASE_URL}/progetti`);
    await page.waitForTimeout(1200);

    await page.click('a[href="/progetti/casa-gracchi"]');
    await page.waitForURL(`${BASE_URL}/progetti/casa-gracchi`);
    await page.waitForTimeout(1200);

    await page.goBack({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const backProgettiOk = await page.evaluate(() => {
      const firstPhoto = document.querySelector('[data-scroll-photo]');
      return firstPhoto && window.getComputedStyle(firstPhoto).opacity === '1';
    });
    if (!backProgettiOk) {
      throw new Error('Immagine principale su /progetti non visibile dopo goBack()');
    }

    await page.goBack({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1300);
    const backHomeOk = await page.evaluate(() => {
      const heroMask = document.querySelector('[data-hero-photo-mask]');
      return heroMask && window.getComputedStyle(heroMask).opacity === '1';
    });
    if (!backHomeOk) {
      throw new Error('Hero photo su / non visibile dopo goBack()');
    }
    console.log('  ✓ Navigazione / -> /progetti -> /progetti/casa-gracchi -> Back -> Back superata senza stati incoerenti');

    // =========================================================================
    // TEST E: MOBILE HERO SEQUENCE (390x844), REDUCED MOTION & NO-JS FALLBACK
    // =========================================================================
    console.log('\n[Test E] Mobile Hero (390x844), prefers-reduced-motion e fallback No-JS');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(250);
    await page.screenshot({
      path: path.join(FRAMES_DIR, 'mobile_hero_250ms.png'),
      fullPage: false,
    });
    await page.waitForTimeout(1150);
    await page.screenshot({
      path: path.join(FRAMES_DIR, 'mobile_hero_1400ms.png'),
      fullPage: false,
    });

    const mobileHeroOk = await page.evaluate(() => {
      const mask = document.querySelector('[data-hero-photo-mask]');
      return mask && mask.classList.contains('is-revealed') && window.getComputedStyle(mask).opacity === '1';
    });
    if (!mobileHeroOk) {
      throw new Error('Mobile Hero non rivelata correttamente a 390x844');
    }
    console.log('  ✓ Mobile Hero (390x844) rivelata in modo fluido e stabile');

    // Reduced motion context
    const rmContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      reducedMotion: 'reduce',
    });
    const rmPage = await rmContext.newPage();
    await rmPage.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const rmState = await rmPage.evaluate(() => {
      const masks = Array.from(
        document.querySelectorAll('[data-hero-photo-mask], [data-scroll-photo]')
      );
      return masks.every((m) => window.getComputedStyle(m).opacity === '1');
    });
    if (!rmState) {
      throw new Error('Con prefers-reduced-motion: reduce alcune immagini non sono immediatamente visibili');
    }
    await rmContext.close();
    console.log('  ✓ prefers-reduced-motion: reduce mostra immediatamente tutte le immagini in stato stabile');

    // No-JS context
    const noJsContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      javaScriptEnabled: false,
    });
    const noJsPage = await noJsContext.newPage();
    await noJsPage.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const noJsState = await noJsPage.evaluate(() => {
      const masks = Array.from(
        document.querySelectorAll('[data-hero-photo-mask], [data-scroll-photo]')
      );
      const title = document.querySelector('[data-hero-title]');
      return (
        masks.every((m) => window.getComputedStyle(m).opacity === '1') &&
        title &&
        window.getComputedStyle(title).opacity === '1'
      );
    });
    if (!noJsState) {
      throw new Error('Con JavaScript disabilitato alcuni contenuti rimangono nascosti');
    }
    await noJsContext.close();
    console.log('  ✓ Progressive Enhancement (No-JS): tutti i testi e le immagini sono immediatamente visibili');

    if (consoleErrors.length > 0) {
      throw new Error(`Errori console rilevati: ${consoleErrors.join('; ')}`);
    }
    console.log('  ✓ Zero errori in console durante tutti i test temporali e di navigazione');

    await context.close();
    console.log('\n✓ TUTTI I TEST DI MOTION DESIGN (A, B, C, D, E) SUPERATI CON SUCCESSO!');
  } finally {
    if (browser) await browser.close();
    spawnSync('npx', ['astro', 'preview', 'stop'], { stdio: 'ignore' });
    server.kill('SIGTERM');
  }
}

runMotionVerification().catch((err) => {
  console.error('\n✗ ERRORE NELLA VERIFICA MOTION:', err.message);
  process.exit(1);
});
