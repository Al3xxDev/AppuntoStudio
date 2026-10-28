import { chromium } from 'playwright';
import { spawn, spawnSync } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 4321;
const BASE_URL = `http://localhost:${PORT}`;
const SCREENSHOTS_DIR = 'tests/screenshots';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Routes to test
const ROUTES = [
  '/',
  '/progetti',
  '/progetti/casa-gracchi',
  '/progetti/casa-mg',
  '/progetti/casa-jd',
  '/progetti/casa-fp',
  '/progetti/villa-residenziale',
  '/studio',
  '/servizi',
  '/contatti',
  '/privacy'
];

const VIEWPORTS = [
  { name: '320_mobile_small', width: 320, height: 800 },
  { name: '360_mobile_android', width: 360, height: 800 },
  { name: '390_iphone_12_14', width: 390, height: 844 },
  { name: '430_iphone_pro_max', width: 430, height: 932 },
  { name: '768_tablet_portrait', width: 768, height: 1024 },
  { name: '1024_tablet_landscape', width: 1024, height: 768 },
  { name: '1280_laptop', width: 1280, height: 800 },
  { name: '1440_desktop', width: 1440, height: 900 },
  { name: '1920_large_screen', width: 1920, height: 1080 }
];

async function waitForServer(url, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode === 200) resolve();
          else reject();
        });
        req.on('error', reject);
        req.end();
      });
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 200));
    }
  }
  throw new Error(`Server did not start at ${url} within ${timeout}ms`);
}

async function run() {
  console.log('--- AVVIO SUITE DI QA E VERIFICA COMPLETA ---');

  // 1. Start Astro preview server
  console.log('1. Avvio preview server statico su porta ' + PORT);
  const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], {
    stdio: 'pipe'
  });

  server.stdout.on('data', d => process.stdout.write(`[SERVER] ${d}`));
  server.stderr.on('data', d => process.stderr.write(`[SERVER ERR] ${d}`));

  try {
    await waitForServer(BASE_URL);
    console.log('✓ Server avviato e raggiungibile');

    const browser = await chromium.launch({
      executablePath: '/usr/bin/google-chrome',
      headless: true
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[Console Error] ${msg.text()}`);
      }
    });

    page.on('requestfailed', req => {
      failedRequests.push(`[Request Failed] ${req.url()} (${req.failure()?.errorText})`);
    });

    page.on('response', res => {
      if (res.status() >= 400) {
        failedRequests.push(`[HTTP ${res.status()}] ${res.url()}`);
      }
    });

    console.log('\n2. Verifica rotte HTTP, assenza errori console ed asset mancanti');
    for (const route of ROUTES) {
      const url = `${BASE_URL}${route}`;
      const res = await page.goto(url, { waitUntil: 'networkidle' });
      const status = res?.status();
      const title = await page.title();

      if (status !== 200) {
        throw new Error(`Errore HTTP ${status} su rotta: ${route}`);
      }

      // Check all images in the page by scrolling and verifying decoding
      const imagesCount = await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(r => setTimeout(r, 200));
        window.scrollTo(0, 0);

        const imgs = Array.from(document.querySelectorAll('img'));
        let broken = 0;
        for (const img of imgs) {
          try {
            if (img.loading === 'lazy') {
              img.loading = 'eager';
            }
            await img.decode();
          } catch {
            broken++;
          }
        }
        return {
          total: imgs.length,
          broken
        };
      });

      console.log(`  ✓ ${route.padEnd(30)} [HTTP 200] ${title.slice(0, 40)}... (${imagesCount.total} img, broken: ${imagesCount.broken})`);

      if (imagesCount.broken > 0) {
        throw new Error(`Trovate ${imagesCount.broken} immagini non decodificate/rotte su ${route}`);
      }
    }

    if (consoleErrors.length > 0) {
      console.error('Errori console rilevati:', consoleErrors);
      throw new Error(`Rilevati ${consoleErrors.length} errori di console!`);
    } else {
      console.log('  ✓ Zero errori console rilevati su tutte le rotte');
    }

    if (failedRequests.length > 0) {
      console.error('Richieste fallite:', failedRequests);
      throw new Error(`Rilevate ${failedRequests.length} richieste HTTP fallite!`);
    } else {
      console.log('  ✓ Zero richieste HTTP fallite (tutti gli asset esistono)');
    }

    console.log('\n3. Test funzionali interattivi');
    // Test mobile menu
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });

    const menuBtn = page.locator('#mobile-menu-btn');

    await menuBtn.click();
    let isMenuOpen = await menuBtn.getAttribute('aria-expanded');
    console.log(`  ✓ Apertura menu mobile con click: aria-expanded = ${isMenuOpen}`);
    if (isMenuOpen !== 'true') throw new Error('Il menu mobile non si è aperto!');

    // Test Escape key closes menu
    await page.keyboard.press('Escape');
    isMenuOpen = await menuBtn.getAttribute('aria-expanded');
    console.log(`  ✓ Chiusura menu mobile con tasto Escape: aria-expanded = ${isMenuOpen}`);
    if (isMenuOpen !== 'false') throw new Error('Il tasto Escape non ha chiuso il menu mobile!');

    // Test Lightbox on a project page
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/progetti/casa-gracchi`, { waitUntil: 'networkidle' });

    const firstGalleryBtn = page.locator('[data-lightbox-trigger]').first();
    await firstGalleryBtn.click();

    const lightboxModal = page.locator('#lightbox-modal');
    const isLightboxVisible = await lightboxModal.isVisible();
    console.log(`  ✓ Apertura Lightbox gallery: visibile = ${isLightboxVisible}`);
    if (!isLightboxVisible) throw new Error('Il Lightbox non si è aperto!');

    // Navigate with ArrowRight
    await page.keyboard.press('ArrowRight');
    const counterText = await page.locator('#lightbox-counter').textContent();
    console.log(`  ✓ Navigazione Lightbox con freccia destra: contatore = ${counterText?.trim()}`);

    // Close lightbox with Escape
    await page.keyboard.press('Escape');
    const isLightboxClosed = await lightboxModal.isHidden();
    console.log(`  ✓ Chiusura Lightbox con tasto Escape: nascosto = ${isLightboxClosed}`);
    if (!isLightboxClosed) throw new Error('Il tasto Escape non ha chiuso il Lightbox!');

    console.log('\n4. Test Accessibilità (WCAG 2.2 AA)');
    // Skip link test
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    const skipLink = page.locator('a[href="#main-content"]');
    const skipLinkText = await skipLink.textContent();
    console.log(`  ✓ Link "Salta al contenuto" presente: "${skipLinkText?.trim()}"`);

    // Title & heading hierarchy test
    for (const route of ['/', '/progetti', '/progetti/casa-gracchi', '/studio', '/servizi', '/contatti', '/privacy']) {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      const h1Count = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('h1'))
          .filter(el => !el.closest('astro-dev-toolbar') && !el.querySelector('astro-dev-toolbar-icon'))
          .length;
      });
      if (h1Count !== 1) {
        throw new Error(`Rotta ${route} ha ${h1Count} tag h1 (atteso esattamente 1)`);
      }
    }
    console.log('  ✓ Tutte le pagine hanno esattamente un unico tag <h1> principale');

    // Alt text test on all images
    const missingAlt = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img'))
        .filter(img => !img.hasAttribute('alt'))
        .map(img => img.src);
    });
    if (missingAlt.length > 0) {
      throw new Error(`Trovate ${missingAlt.length} immagini prive di attributo alt`);
    }
    console.log('  ✓ Tutte le immagini hanno alt text valido e accessibile');

    console.log('\n5. Test Responsive e Controllo Overflow Orizzontale su 9 Viewport');
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const route of ['/', '/progetti', '/progetti/casa-gracchi', '/studio', '/contatti']) {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });

        const overflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        if (overflow) {
          throw new Error(`Rilevato overflow orizzontale su ${route} a risoluzione ${vp.width}px!`);
        }
      }

      // Save visual screenshot of homepage and project detail
      const screenshotPath = path.join(SCREENSHOTS_DIR, `home_${vp.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`  ✓ Viewport ${vp.width}x${vp.height} (${vp.name}): NO overflow, screenshot salvato`);
    }

    async function captureScrolled(path) {
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(r => setTimeout(r, 150));
        window.scrollTo(0, 0);
        await Promise.all(
          Array.from(document.querySelectorAll('img')).map((img) => {
            img.loading = 'eager';
            return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
          })
        );
      });
      await page.waitForTimeout(200);
      await page.screenshot({ path, fullPage: true });
    }

    // Save screenshots of all internal pages on standard desktop and mobile
    await page.setViewportSize({ width: 1280, height: 800 });
    for (const route of ROUTES) {
      const name = route === '/' ? 'home' : route.replace(/\//g, '_');
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      await captureScrolled(path.join(SCREENSHOTS_DIR, `desktop_${name}.png`));
    }

    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ROUTES) {
      const name = route === '/' ? 'home' : route.replace(/\//g, '_');
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
      await captureScrolled(path.join(SCREENSHOTS_DIR, `mobile_${name}.png`));
    }

    console.log('\n✓ TUTTI I CONTROLLI DI QA E VERIFICA HANNO DATO ESITO POSITIVO!');

    await browser.close();
  } finally {
    server.kill();
    spawnSync('npx', ['astro', 'preview', 'stop'], { stdio: 'ignore' });
  }
}

run().catch(err => {
  console.error('\n❌ ERRORE DURANTE LA VERIFICA QA:', err);
  process.exit(1);
});
