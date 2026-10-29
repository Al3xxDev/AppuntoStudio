import { chromium } from 'playwright';
import { preview } from 'astro';
import path from 'path';
import fs from 'fs';

const VIEWPORTS = [
  { name: '320', width: 320, height: 640 },
  { name: '360', width: 360, height: 740 },
  { name: '390', width: 390, height: 844 },
  { name: '430', width: 430, height: 932 },
  { name: '768', width: 768, height: 1024 },
  { name: 'short_360x480', width: 360, height: 480 },
];

const EXPECTED_LINKS = [
  { label: 'Lo studio', href: '/studio' },
  { label: 'Progetti', href: '/progetti' },
  { label: 'Servizi', href: '/servizi' },
  { label: 'Contatti', href: '/contatti' },
];

const SCREENSHOT_DIR = path.resolve('tests/screenshots');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

function rectsOverlap(a, b) {
  return !(
    a.right <= b.left + 1 ||
    a.left >= b.right - 1 ||
    a.bottom <= b.top + 1 ||
    a.top >= b.bottom - 1
  );
}

async function verifyMobileMenu() {
  console.log('Starting Astro preview server for mobile menu verification...');
  const server = await preview({ root: path.resolve('.') });
  const port = server.port || 4321;
  const baseUrl = `http://localhost:${port}`;

  const browser = await chromium.launch({ headless: true });
  const errors = [];

  try {
    // 1. Test across all required viewports (320, 360, 390, 430, 768 + short 360x480)
    console.log('\n1. Testing Mobile Menu across viewports (320, 360, 390, 430, 768, 360x480)...');
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(200);

      // Click hamburger button to open menu
      await page.click('#mobile-menu-btn');
      await page.waitForTimeout(750); // Wait for 0.6s entrance choreography to settle

      // Capture visual screenshot
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `mobile_menu_${vp.name}.png`),
        fullPage: false,
      });

      const report = await page.evaluate((vpInfo) => {
        const doc = document.documentElement;
        const hasHorizontalOverflow = doc.scrollWidth > doc.clientWidth;

        const dialog = document.getElementById('mobile-nav-dialog');
        const btn = document.getElementById('mobile-menu-btn');
        const phoneBtn = document.querySelector('[data-header-mobile-phone]');
        const brand = document.querySelector('[data-header-brand]');

        if (!dialog || !btn || !phoneBtn || !brand) {
          return { error: 'Missing core header/menu DOM elements' };
        }

        const dialogRect = dialog.getBoundingClientRect();
        const dialogStyle = window.getComputedStyle(dialog);
        const brandRect = brand.getBoundingClientRect();
        const phoneRect = phoneBtn.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();

        // Check hit testing at 3 vertical points to prove underlying page is 100% covered
        const samplePoints = [
          { x: Math.round(vpInfo.width / 2), y: Math.round(vpInfo.height * 0.3) },
          { x: Math.round(vpInfo.width / 2), y: Math.round(vpInfo.height * 0.55) },
          { x: Math.round(vpInfo.width / 2), y: Math.round(vpInfo.height * 0.85) },
        ];
        const hitResults = samplePoints.map((pt) => {
          const hitEl = document.elementFromPoint(pt.x, pt.y);
          const insideMenuOrHeader =
            hitEl && (dialog.contains(hitEl) || document.getElementById('site-header')?.contains(hitEl));
          return { ...pt, insideMenuOrHeader: Boolean(insideMenuOrHeader), tag: hitEl?.tagName };
        });

        const navLinks = Array.from(dialog.querySelectorAll('[data-mobile-nav-link]')).map((el) => {
          const r = el.getBoundingClientRect();
          const labelEl = el.querySelector('[data-mobile-nav-label]');
          const labelStyle = labelEl ? window.getComputedStyle(labelEl) : null;
          return {
            text: labelEl ? labelEl.textContent?.trim() : el.textContent?.trim(),
            href: el.getAttribute('href'),
            top: Math.round(r.top),
            bottom: Math.round(r.bottom),
            left: Math.round(r.left),
            right: Math.round(r.right),
            width: Math.round(r.width),
            height: Math.round(r.height),
            opacity: labelStyle ? Number(labelStyle.opacity) : 0,
          };
        });

        const contactPhone = dialog.querySelector('[data-mobile-contact-phone]');
        const contactCta = dialog.querySelector('[data-mobile-contact-cta]');
        const phoneLinkRect = contactPhone?.getBoundingClientRect();
        const ctaRect = contactCta?.getBoundingClientRect();

        return {
          hasHorizontalOverflow,
          ariaExpanded: btn.getAttribute('aria-expanded'),
          menuState: dialog.dataset.menuState,
          dialogRect: {
            top: Math.round(dialogRect.top),
            left: Math.round(dialogRect.left),
            width: Math.round(dialogRect.width),
            height: Math.round(dialogRect.height),
          },
          dialogVisibility: dialogStyle.visibility,
          dialogOpacity: Number(dialogStyle.opacity),
          brandRect: {
            left: Math.round(brandRect.left),
            right: Math.round(brandRect.right),
            top: Math.round(brandRect.top),
            bottom: Math.round(brandRect.bottom),
            width: Math.round(brandRect.width),
          },
          phoneRect: {
            left: Math.round(phoneRect.left),
            right: Math.round(phoneRect.right),
            top: Math.round(phoneRect.top),
            bottom: Math.round(phoneRect.bottom),
          },
          btnRect: {
            left: Math.round(btnRect.left),
            right: Math.round(btnRect.right),
            top: Math.round(btnRect.top),
            bottom: Math.round(btnRect.bottom),
          },
          hitResults,
          navLinks,
          contactPhoneHref: contactPhone?.getAttribute('href'),
          contactPhoneWidth: phoneLinkRect ? Math.round(phoneLinkRect.width) : 0,
          contactCtaHref: contactCta?.getAttribute('href'),
          contactCtaText: contactCta?.textContent?.trim(),
          contactCtaRect: ctaRect
            ? {
                top: Math.round(ctaRect.top),
                bottom: Math.round(ctaRect.bottom),
                left: Math.round(ctaRect.left),
                right: Math.round(ctaRect.right),
                width: Math.round(ctaRect.width),
                height: Math.round(ctaRect.height),
              }
            : null,
        };
      }, vp);

      if (report.error) {
        errors.push(`Viewport ${vp.name}: ${report.error}`);
      } else {
        if (report.hasHorizontalOverflow) {
          errors.push(`Viewport ${vp.name}: Horizontal overflow detected`);
        }
        if (report.ariaExpanded !== 'true' || report.menuState !== 'open') {
          errors.push(
            `Viewport ${vp.name}: Menu did not open properly (aria-expanded=${report.ariaExpanded}, state=${report.menuState})`
          );
        }
        if (
          report.dialogRect.top !== 0 ||
          report.dialogRect.left !== 0 ||
          report.dialogRect.width !== vp.width ||
          report.dialogRect.height !== vp.height
        ) {
          errors.push(
            `Viewport ${vp.name}: Dialog rect mismatch ${JSON.stringify(report.dialogRect)} vs ${vp.width}x${vp.height}`
          );
        }
        for (const hit of report.hitResults) {
          if (!hit.insideMenuOrHeader) {
            errors.push(
              `Viewport ${vp.name}: Underlying page element (${hit.tag}) exposed at (${hit.x}, ${hit.y})`
            );
          }
        }
        if (
          rectsOverlap(report.brandRect, report.phoneRect) ||
          rectsOverlap(report.phoneRect, report.btnRect)
        ) {
          errors.push(`Viewport ${vp.name}: Header controls overlap!`);
        }
        if (report.navLinks.length !== EXPECTED_LINKS.length) {
          errors.push(
            `Viewport ${vp.name}: Expected ${EXPECTED_LINKS.length} nav links, found ${report.navLinks.length}`
          );
        }
        report.navLinks.forEach((lnk, idx) => {
          const exp = EXPECTED_LINKS[idx];
          if (lnk.text !== exp.label || lnk.href !== exp.href) {
            errors.push(
              `Viewport ${vp.name}: Link ${idx} mismatch (${lnk.text} -> ${lnk.href})`
            );
          }
          if (lnk.opacity < 0.99 || lnk.width < 150 || lnk.height < 40) {
            errors.push(
              `Viewport ${vp.name}: Link ${lnk.text} not properly visible (${lnk.width}x${lnk.height}, opacity=${lnk.opacity})`
            );
          }
          if (lnk.left < 0 || lnk.right > vp.width) {
            errors.push(`Viewport ${vp.name}: Link ${lnk.text} overflows viewport horizontally`);
          }
        });
        if (report.contactPhoneHref !== 'tel:+393498328323') {
          errors.push(`Viewport ${vp.name}: Invalid phone href ${report.contactPhoneHref}`);
        }
        if (
          report.contactCtaHref !== '/contatti' ||
          !report.contactCtaText?.toUpperCase().includes('PARLIAMONE')
        ) {
          errors.push(
            `Viewport ${vp.name}: Invalid CTA (${report.contactCtaText} -> ${report.contactCtaHref})`
          );
        }
        // On standard heights (>= 640px), verify CTA is visible without even scrolling
        if (vp.height >= 640 && report.contactCtaRect.bottom > vp.height) {
          errors.push(
            `Viewport ${vp.name}: CTA bottom (${report.contactCtaRect.bottom}) clipped below viewport (${vp.height})`
          );
        }
      }

      if (consoleErrors.length > 0) {
        errors.push(`Viewport ${vp.name}: Console errors: ${consoleErrors.join('; ')}`);
      }

      console.log(
        `  [OK] Viewport ${vp.width}x${vp.height} (${vp.name}) | dialog=${report.dialogRect.width}x${report.dialogRect.height} | links=${report.navLinks.length} | CTA bottom=${report.contactCtaRect?.bottom}px`
      );
      await context.close();
    }

    // 2. Test Scroll Lock, Rapid Open/Close, Keyboard Focus Trap, Escape, Reduced Motion & Link Navigation
    console.log('\n2. Testing Scroll Lock, Rapid Toggle, Keyboard Accessibility & Navigation...');
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });

    // Scroll down to 420px
    await page.evaluate(() => window.scrollTo(0, 420));
    await page.waitForTimeout(100);
    const beforeScrollY = await page.evaluate(() => Math.round(window.scrollY));

    // Open menu
    await page.click('#mobile-menu-btn');
    await page.waitForTimeout(700);

    const duringOpenState = await page.evaluate(() => ({
      scrollY: Math.round(window.scrollY),
      bodyOverflow: window.getComputedStyle(document.body).overflow,
      mainInert: document.getElementById('main-content')?.hasAttribute('inert'),
    }));

    if (duringOpenState.bodyOverflow !== 'hidden' || !duringOpenState.mainInert) {
      errors.push(
        `Scroll lock or inert failed when menu open: overflow=${duringOpenState.bodyOverflow}, inert=${duringOpenState.mainInert}`
      );
    }

    // Close menu with X button
    await page.click('#mobile-menu-btn');
    // Immediately check closing separation state
    const immediateCloseState = await page.evaluate(() => {
      const btn = document.getElementById('mobile-menu-btn');
      const dialog = document.getElementById('mobile-nav-dialog');
      return {
        ariaExpanded: btn?.getAttribute('aria-expanded'),
        pointerEvents: dialog ? window.getComputedStyle(dialog).pointerEvents : '',
      };
    });
    if (
      immediateCloseState.ariaExpanded !== 'false' ||
      immediateCloseState.pointerEvents !== 'none'
    ) {
      errors.push(
        `Immediate close state separation failed: ${JSON.stringify(immediateCloseState)}`
      );
    }

    await page.waitForTimeout(450);
    const afterCloseScrollY = await page.evaluate(() => Math.round(window.scrollY));
    if (Math.abs(afterCloseScrollY - beforeScrollY) > 2) {
      errors.push(
        `Scroll position not preserved after closing menu: before=${beforeScrollY}, after=${afterCloseScrollY}`
      );
    }
    console.log(
      `  [OK] Scroll lock & position preservation verified (scrollY=${beforeScrollY}px -> ${afterCloseScrollY}px)`
    );

    // Rapid repeated open/close stress test
    for (let i = 0; i < 6; i++) {
      await page.click('#mobile-menu-btn');
      await page.waitForTimeout(65);
    }
    await page.waitForTimeout(450);
    // Open cleanly after rapid toggling
    await page.click('#mobile-menu-btn');
    await page.waitForTimeout(700);
    const postStressState = await page.evaluate(() => {
      const dialog = document.getElementById('mobile-nav-dialog');
      const labels = Array.from(document.querySelectorAll('[data-mobile-nav-label]'));
      return {
        state: dialog?.dataset.menuState,
        allVisible: labels.every((l) => Number(window.getComputedStyle(l).opacity) > 0.99),
      };
    });
    if (postStressState.state !== 'open' || !postStressState.allVisible) {
      errors.push(`Rapid toggle stress test left inconsistent state: ${JSON.stringify(postStressState)}`);
    }
    console.log('  [OK] Rapid open/close interruptibility stress test passed');

    // Test keyboard Tab trap & Escape key
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const activeInsideModal = await page.evaluate(() => {
        const active = document.activeElement;
        const header = document.getElementById('site-header');
        const dialog = document.getElementById('mobile-nav-dialog');
        return Boolean(active && (header?.contains(active) || dialog?.contains(active)));
      });
      if (!activeInsideModal) {
        errors.push(`Keyboard Tab escaped modal on step ${i}`);
      }
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(450);
    const focusReturnedToBtn = await page.evaluate(
      () => document.activeElement?.id === 'mobile-menu-btn'
    );
    if (!focusReturnedToBtn) {
      errors.push('Escape key did not return focus to #mobile-menu-btn');
    }
    console.log('  [OK] Keyboard Tab focus trap & Escape focus restoration passed');

    // Test navigation click on a menu link
    await page.click('#mobile-menu-btn');
    await page.waitForTimeout(700);
    await page.click('[data-mobile-nav-link][href="/progetti"]');
    await page.waitForLoadState('networkidle');
    if (!page.url().endsWith('/progetti') && !page.url().endsWith('/progetti/')) {
      errors.push(`Navigation to /progetti failed, current URL=${page.url()}`);
    }
    console.log(`  [OK] Link navigation from mobile menu succeeded (${page.url()})`);
    await context.close();

    // 3. Test prefers-reduced-motion: reduce
    console.log('\n3. Testing prefers-reduced-motion: reduce...');
    const rmContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: 'reduce',
    });
    const rmPage = await rmContext.newPage();
    await rmPage.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
    await rmPage.click('#mobile-menu-btn');
    // Should be 100% open and visible immediately without waiting 600ms
    const rmOpen = await rmPage.evaluate(() => {
      const dialog = document.getElementById('mobile-nav-dialog');
      const firstLabel = document.querySelector('[data-mobile-nav-label]');
      return {
        state: dialog?.dataset.menuState,
        opacity: firstLabel ? Number(window.getComputedStyle(firstLabel).opacity) : 0,
      };
    });
    if (rmOpen.state !== 'open' || rmOpen.opacity < 0.99) {
      errors.push(`prefers-reduced-motion instant open failed: ${JSON.stringify(rmOpen)}`);
    }
    await rmPage.click('#mobile-menu-btn');
    const rmClosed = await rmPage.evaluate(() => {
      const dialog = document.getElementById('mobile-nav-dialog');
      return dialog?.dataset.menuState;
    });
    if (rmClosed !== 'closed') {
      errors.push(`prefers-reduced-motion instant close failed: state=${rmClosed}`);
    }
    console.log('  [OK] prefers-reduced-motion instant open & close verified');
    await rmContext.close();
  } finally {
    await browser.close();
    await server.stop();
  }

  if (errors.length > 0) {
    console.error('\nFAILED MOBILE MENU CHECKS:');
    errors.forEach((e) => console.error(' - ' + e));
    process.exit(1);
  } else {
    console.log('\nALL MOBILE MENU VERIFICATION CHECKS PASSED PERFECTLY!');
  }
}

verifyMobileMenu();
