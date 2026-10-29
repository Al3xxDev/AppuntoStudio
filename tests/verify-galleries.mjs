import { chromium } from 'playwright';
import { preview } from 'astro';
import path from 'path';
import fs from 'fs';

const PROJECT_SLUGS = [
  { slug: 'casa-gracchi', expectedCount: 7 },
  { slug: 'casa-mg', expectedCount: 6 },
  { slug: 'casa-jd', expectedCount: 4 },
  { slug: 'casa-fp', expectedCount: 6 },
  { slug: 'villa-residenziale', expectedCount: 8 },
];

const VIEWPORTS = [
  { width: 320, height: 640 },
  { width: 360, height: 740 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
];

const SCREENSHOT_DIR = path.resolve('tests/screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function verifyGalleries() {
  console.log('Starting Astro preview server for gallery verification...');
  const server = await preview({ root: path.resolve('.') });
  const port = server.port || 4321;
  const baseUrl = `http://localhost:${port}`;

  const browser = await chromium.launch({ headless: true });
  const errors = [];

  try {
    for (const { slug, expectedCount } of PROJECT_SLUGS) {
      const route = `/progetti/${slug}`;
      for (const vp of VIEWPORTS) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
        });
        const page = await context.newPage();
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });

        // Force lazy-loaded images to load so we can verify every asset exists and decodes cleanly
        await page.evaluate(async () => {
          const imgs = Array.from(document.querySelectorAll('[data-editorial-masonry] img'));
          imgs.forEach((img) => {
            img.loading = 'eager';
          });
          await Promise.all(
            imgs.map((img) =>
              img.complete
                ? Promise.resolve()
                : new Promise((res) => {
                    img.addEventListener('load', res, { once: true });
                    img.addEventListener('error', res, { once: true });
                  })
            )
          );
        });
        await page.waitForTimeout(150);

        const metrics = await page.evaluate(() => {
          const doc = document.documentElement;
          const hasHorizontalOverflow = doc.scrollWidth > doc.clientWidth;

          const grid = document.querySelector('[data-editorial-masonry]');
          if (!grid) return { error: 'Missing [data-editorial-masonry]' };

          const cards = Array.from(grid.querySelectorAll('.masonry-card'));
          const cardMetrics = cards.map((card) => {
            const rect = card.getBoundingClientRect();
            const img = card.querySelector('img');
            const imgRect = img ? img.getBoundingClientRect() : null;
            const btn = card.querySelector('[data-lightbox-index]');
            const idxAttr =
              card.getAttribute('data-photo-index') ??
              (btn ? btn.getAttribute('data-lightbox-index') : '0');
            return {
              index: Number(idxAttr),
              top: Math.round(rect.top),
              bottom: Math.round(rect.bottom),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              imgWidth: imgRect ? Math.round(imgRect.width) : 0,
              imgHeight: imgRect ? Math.round(imgRect.height) : 0,
              complete: img ? img.complete && img.naturalWidth > 0 : false,
            };
          });

          const leftTrack = grid.querySelector('.masonry-track-left');
          const rightTrack = grid.querySelector('.masonry-track-right');
          const leftRect = leftTrack ? leftTrack.getBoundingClientRect() : null;
          const rightRect = rightTrack ? rightTrack.getBoundingClientRect() : null;

          return {
            hasHorizontalOverflow,
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            cardCount: cards.length,
            cardMetrics,
            leftHeight: leftRect ? Math.round(leftRect.height) : null,
            rightHeight: rightRect ? Math.round(rightRect.height) : null,
            leftBottom: leftRect ? Math.round(leftRect.bottom) : null,
            rightBottom: rightRect ? Math.round(rightRect.bottom) : null,
          };
        });

        if (metrics.error) {
          errors.push(`${route} @ ${vp.width}px: ${metrics.error}`);
        } else {
          if (metrics.hasHorizontalOverflow) {
            errors.push(
              `${route} @ ${vp.width}px: Horizontal overflow (${metrics.scrollWidth} > ${metrics.clientWidth})`
            );
          }
          if (metrics.cardCount !== expectedCount) {
            errors.push(
              `${route} @ ${vp.width}px: Expected ${expectedCount} photos, found ${metrics.cardCount}`
            );
          }
          for (const c of metrics.cardMetrics) {
            if (!c.complete || c.imgWidth < 100 || c.imgHeight < 100) {
              errors.push(
                `${route} @ ${vp.width}px: Broken or tiny image at index ${c.index} (${c.imgWidth}x${c.imgHeight}, complete=${c.complete})`
              );
            }
          }

          if (vp.width >= 640) {
            const diff = Math.abs(metrics.leftBottom - metrics.rightBottom);
            if (diff > 3) {
              errors.push(
                `${route} @ ${vp.width}px: Track bottom mismatch of ${diff}px (left=${metrics.leftBottom}, right=${metrics.rightBottom})`
              );
            }
          } else {
            // Mobile: verify chronological top-to-bottom order
            const sortedByIndex = [...metrics.cardMetrics].sort((a, b) => a.index - b.index);
            for (let i = 1; i < sortedByIndex.length; i++) {
              if (sortedByIndex[i].top <= sortedByIndex[i - 1].top) {
                errors.push(
                  `${route} @ ${vp.width}px: Mobile order broken between index ${i - 1} (top=${sortedByIndex[i - 1].top}) and ${i} (top=${sortedByIndex[i].top})`
                );
              }
            }
          }
        }

        if (vp.width === 768) {
          await page.evaluate(async () => {
            const totalH = document.body.scrollHeight;
            for (let y = 0; y <= totalH; y += 450) {
              window.scrollTo(0, y);
              await new Promise((r) => setTimeout(r, 80));
            }
            window.scrollTo(0, 0);
            document.documentElement.classList.remove('js-motion');
          });
          await page.waitForTimeout(350);
          await page.screenshot({
            path: path.join(SCREENSHOT_DIR, `tablet__progetti_${slug}.png`),
            fullPage: true,
          });
        }

        console.log(
          `  [OK] ${route} @ ${vp.width}x${vp.height} | cards=${metrics.cardCount} | overflow=${metrics.hasHorizontalOverflow} | trackDiff=${
            vp.width >= 640 ? Math.abs(metrics.leftBottom - metrics.rightBottom) + 'px' : '1-col'
          }`
        );

        await context.close();
      }
    }
  } finally {
    await browser.close();
    await server.stop();
  }

  if (errors.length > 0) {
    console.error('\nFAILED GALLERY CHECKS:');
    errors.forEach((e) => console.error(' - ' + e));
    process.exit(1);
  } else {
    console.log('\nALL 5 GALLERIES ACROSS ALL 8 VIEWPORTS (40 COMBINATIONS) PASSED PERFECTLY!');
  }
}

verifyGalleries();
