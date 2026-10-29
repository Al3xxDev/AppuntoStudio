import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

declare global {
  interface Window {
    __appuntoFallbackTimer?: number;
  }
}

interface ScrollBlock {
  element: HTMLElement;
  timeline: gsap.core.Timeline;
  photos: HTMLElement[];
  triggered: boolean;
}

const photoTimelines = new WeakMap<HTMLElement, gsap.core.Timeline>();
let activeCleanup: (() => void) | null = null;

function markPhotoRevealed(photoWrapper: HTMLElement) {
  photoWrapper.classList.add('is-revealed');
  gsap.set(photoWrapper, { clearProps: '--clip-x,--clip-y,clipPath,opacity,visibility' });
  const img = photoWrapper.querySelector<HTMLImageElement>(
    '[data-hero-photo-image], .scroll-photo-img, img'
  );
  if (img) {
    img.classList.add('is-revealed');
    gsap.set(img, { clearProps: 'transform' });
  }
}

function preparePhotoReveal(
  photoWrapper: HTMLElement,
  activeTimelines: gsap.core.Timeline[]
): gsap.core.Timeline {
  const existing = photoTimelines.get(photoWrapper);
  if (existing) return existing;

  const isPortrait = photoWrapper.dataset.scrollVariant === 'portrait';
  const img = photoWrapper.querySelector<HTMLImageElement>(
    '[data-hero-photo-image], .scroll-photo-img, img'
  );

  gsap.set(photoWrapper, {
    '--clip-x': isPortrait ? '0%' : '34%',
    '--clip-y': isPortrait ? '34%' : '0%',
    autoAlpha: 0,
  });

  if (img) {
    gsap.set(img, {
      scale: 1.055,
      transformOrigin: 'center center',
    });
  }

  const photoTl = gsap.timeline({
    paused: true,
    onComplete: () => {
      markPhotoRevealed(photoWrapper);
    },
  });

  photoTl.to(
    photoWrapper,
    {
      autoAlpha: 1,
      duration: 0.32,
      ease: 'power2.out',
    },
    0
  );

  photoTl.to(
    photoWrapper,
    {
      '--clip-x': '0%',
      '--clip-y': '0%',
      duration: 0.92,
      ease: 'power3.out',
    },
    0
  );

  if (img) {
    photoTl.to(
      img,
      {
        scale: 1,
        duration: 1.12,
        ease: 'power3.out',
      },
      0
    );
  }

  photoTimelines.set(photoWrapper, photoTl);
  activeTimelines.push(photoTl);
  return photoTl;
}

function triggerPhotoTimeline(photoWrapper: HTMLElement, instant = false) {
  const photoTl = photoTimelines.get(photoWrapper);
  if (!photoTl) {
    markPhotoRevealed(photoWrapper);
    return;
  }

  if (instant) {
    photoWrapper.dataset.photoTriggered = 'true';
    photoTl.progress(1);
    markPhotoRevealed(photoWrapper);
    return;
  }

  if (photoWrapper.dataset.photoTriggered === 'true') return;

  const img = photoWrapper.querySelector<HTMLImageElement>(
    '[data-hero-photo-image], .scroll-photo-img, img'
  );

  if (img) {
    if (img.loading === 'lazy') {
      img.loading = 'eager';
    }
    img.decode?.().catch(() => undefined);
  }

  const startReveal = () => {
    if (photoWrapper.dataset.photoTriggered === 'true') return;
    photoWrapper.dataset.photoTriggered = 'true';
    photoTl.play(0);
  };

  if (!img || (img.complete && img.naturalWidth > 0)) {
    startReveal();
  } else {
    const maxWait = window.setTimeout(startReveal, 420);
    const onReady = () => {
      window.clearTimeout(maxWait);
      startReveal();
    };
    img.addEventListener('load', onReady, { once: true });
    img.addEventListener('error', onReady, { once: true });
  }
}

function schedulePhotoReveal(
  tl: gsap.core.Timeline,
  photoWrapper: HTMLElement,
  startTime: number
) {
  tl.call(
    () => {
      triggerPhotoTimeline(photoWrapper, false);
    },
    [],
    startTime
  );
}

function animateSplitHeading(
  tl: gsap.core.Timeline,
  heading: HTMLElement,
  startTime: number
) {
  try {
    gsap.set(heading, { autoAlpha: 0 });
    const anchorChild = heading.querySelector<HTMLElement>('a');
    const splitTarget = anchorChild ?? heading;
    if (anchorChild) {
      anchorChild.style.display = 'block';
    }
    const split = SplitText.create(splitTarget, {
      type: 'lines',
      mask: 'lines',
      aria: 'auto',
    });
    if (split.lines && split.lines.length > 0) {
      gsap.set(split.lines, { yPercent: 108, autoAlpha: 0 });
      gsap.set(heading, { autoAlpha: 1 });
      tl.to(
        split.lines,
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.7,
          stagger: 0.095,
          ease: 'power4.out',
        },
        startTime
      );
      return;
    }
  } catch {
    // Fallback if SplitText cannot split
  }

  gsap.set(heading, { y: 14, autoAlpha: 0 });
  tl.to(
    heading,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.56,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility',
    },
    startTime
  );
}

function animateCurtainCta(
  tl: gsap.core.Timeline,
  cta: HTMLElement,
  startTime: number
) {
  const cover = cta.querySelector<HTMLElement>('[data-cta-cover]');
  const content = cta.querySelector<HTMLElement>('[data-cta-content]');
  const arrow = cta.querySelector<HTMLElement>('[data-cta-arrow]');

  if (cover) {
    gsap.set(cover, { scaleX: 0 });
  }

  gsap.set(cta, { y: 10, autoAlpha: 0 });
  tl.to(
    cta,
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.46,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility',
    },
    startTime
  );

  if (content) {
    gsap.set(content, { y: 0, autoAlpha: 1 });
  }

  if (arrow) {
    gsap.set(arrow, { x: -4 });
    tl.to(
      arrow,
      {
        x: 0,
        duration: 0.38,
        ease: 'power3.out',
        clearProps: 'transform',
      },
      startTime + 0.12
    );
  }
}

function lockHomeEntranceInitialState(home: HTMLElement, header: HTMLElement | null) {
  if (header && document.documentElement.classList.contains('motion-sequence-pending')) {
    const headerRule = header.querySelector<HTMLElement>('[data-header-rule]');
    const brand = header.querySelector<HTMLElement>('[data-header-brand]');
    const wordmarkPieces = header.querySelectorAll<HTMLElement>('[data-wordmark-piece]');
    const wordmarkDot = header.querySelector<HTMLElement>('[data-wordmark-dot]');
    const headerLinks = header.querySelectorAll<HTMLElement>('[data-header-link]');
    const navIndexes = header.querySelectorAll<HTMLElement>('[data-nav-index]');
    const navLabels = header.querySelectorAll<HTMLElement>('[data-nav-label]');
    const phone = header.querySelector<HTMLElement>('[data-header-phone]');
    const phoneCover = header.querySelector<HTMLElement>('[data-header-phone-cover]');
    const headerCta = header.querySelector<HTMLElement>('[data-header-cta]');
    const headerCtaCover = header.querySelector<HTMLElement>('[data-header-cta-cover]');
    const headerCtaArrow = header.querySelector<HTMLElement>('[data-header-cta-arrow]');
    const mobileControls = header.querySelectorAll<HTMLElement>('[data-header-mobile-control]');

    if (headerRule) gsap.set(headerRule, { scaleX: 0, transformOrigin: 'left center' });
    if (brand) gsap.set(brand, { autoAlpha: 1 });
    if (wordmarkPieces.length) gsap.set(wordmarkPieces, { yPercent: 112, autoAlpha: 0 });
    if (wordmarkDot) gsap.set(wordmarkDot, { scale: 0.55, autoAlpha: 0, transformOrigin: 'center' });
    if (headerLinks.length) gsap.set(headerLinks, { autoAlpha: 1 });
    if (navIndexes.length) gsap.set(navIndexes, { yPercent: 115, autoAlpha: 0 });
    if (navLabels.length) gsap.set(navLabels, { yPercent: 115, autoAlpha: 0 });
    if (phoneCover) gsap.set(phoneCover, { scaleX: 0 });
    if (phone) gsap.set(phone, { y: -4, autoAlpha: 0 });
    if (headerCtaCover) gsap.set(headerCtaCover, { scaleX: 0 });
    if (headerCta) gsap.set(headerCta, { y: -4, autoAlpha: 0 });
    if (headerCtaArrow) gsap.set(headerCtaArrow, { x: -3 });
    if (mobileControls.length) gsap.set(mobileControls, { y: -6, autoAlpha: 0 });
  }

  const coordinates = home.querySelectorAll<HTMLElement>('[data-hero-coordinate]');
  const coordinateRule = home.querySelector<HTMLElement>('[data-coordinate-rule]');
  const title = home.querySelector<HTMLElement>('[data-hero-title]');
  const copy = home.querySelector<HTMLElement>('[data-hero-copy]');
  const primary = home.querySelector<HTMLElement>('[data-hero-action="primary"]');
  const primaryCover = home.querySelector<HTMLElement>('[data-primary-cover]');
  const primaryArrow = home.querySelector<HTMLElement>('[data-primary-arrow]');
  const secondary = home.querySelector<HTMLElement>('[data-hero-action="secondary"]');
  const factLabels = home.querySelectorAll<HTMLElement>('[data-fact-label]');
  const factValues = home.querySelectorAll<HTMLElement>('[data-fact-value]');
  const factsRule = home.querySelector<HTMLElement>('[data-facts-rule]');
  const projectDetails = home.querySelectorAll<HTMLElement>('[data-project-detail]');
  const projectArrow = home.querySelector<HTMLElement>('[data-project-arrow]');

  if (coordinates.length) gsap.set(coordinates, { y: -5, autoAlpha: 0 });
  if (coordinateRule) gsap.set(coordinateRule, { scaleX: 0, transformOrigin: 'left center' });
  if (title) gsap.set(title, { autoAlpha: 0 });
  if (copy) gsap.set(copy, { y: 12, autoAlpha: 0 });
  if (primaryCover) gsap.set(primaryCover, { scaleX: 0 });
  if (primary) gsap.set(primary, { y: 10, autoAlpha: 0 });
  if (primaryArrow) gsap.set(primaryArrow, { y: -3 });
  if (secondary) gsap.set(secondary, { y: 10, autoAlpha: 0 });
  if (factLabels.length) gsap.set(factLabels, { y: 5, autoAlpha: 0 });
  if (factValues.length) gsap.set(factValues, { y: 5, autoAlpha: 0 });
  if (factsRule) gsap.set(factsRule, { scaleX: 0, transformOrigin: 'left center' });
  if (projectDetails.length) gsap.set(projectDetails, { y: 7, autoAlpha: 0 });
  if (projectArrow) gsap.set(projectArrow, { x: -4, autoAlpha: 0 });

  home.classList.add('is-motion-bound');
}

function buildHomeEntranceTimeline(
  home: HTMLElement,
  header: HTMLElement | null
): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });

  if (header && document.documentElement.classList.contains('motion-sequence-pending')) {
    const headerRule = header.querySelector<HTMLElement>('[data-header-rule]');
    const wordmarkPieces = header.querySelectorAll<HTMLElement>('[data-wordmark-piece]');
    const wordmarkDot = header.querySelector<HTMLElement>('[data-wordmark-dot]');
    const navIndexes = header.querySelectorAll<HTMLElement>('[data-nav-index]');
    const navLabels = header.querySelectorAll<HTMLElement>('[data-nav-label]');
    const phone = header.querySelector<HTMLElement>('[data-header-phone]');
    const headerCta = header.querySelector<HTMLElement>('[data-header-cta]');
    const headerCtaArrow = header.querySelector<HTMLElement>('[data-header-cta-arrow]');
    const mobileControls = header.querySelectorAll<HTMLElement>('[data-header-mobile-control]');

    if (headerRule) {
      tl.to(headerRule, { scaleX: 1, duration: 0.64, ease: 'power2.inOut' }, 0);
    }
    if (wordmarkPieces.length) {
      tl.to(
        wordmarkPieces,
        { yPercent: 0, autoAlpha: 1, duration: 0.64, stagger: 0.07, ease: 'power4.out' },
        0.08
      );
    }
    if (wordmarkDot) {
      tl.to(wordmarkDot, { scale: 1, autoAlpha: 1, duration: 0.34, ease: 'power3.out' }, 0.44);
    }
    if (navIndexes.length) {
      tl.to(
        navIndexes,
        { yPercent: 0, autoAlpha: 1, duration: 0.42, stagger: 0.075, ease: 'power3.out' },
        0.24
      );
    }
    if (navLabels.length) {
      tl.to(
        navLabels,
        { yPercent: 0, autoAlpha: 1, duration: 0.46, stagger: 0.075, ease: 'power3.out' },
        0.3
      );
    }
    if (phone) {
      tl.to(
        phone,
        { y: 0, autoAlpha: 1, duration: 0.42, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
        0.48
      );
    }
    if (headerCta) {
      tl.to(
        headerCta,
        { y: 0, autoAlpha: 1, duration: 0.44, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
        0.54
      );
    }
    if (headerCtaArrow) {
      tl.to(
        headerCtaArrow,
        { x: 0, duration: 0.36, ease: 'power3.out', clearProps: 'transform' },
        0.64
      );
    }
    if (mobileControls.length) {
      tl.to(
        mobileControls,
        { y: 0, autoAlpha: 1, duration: 0.44, stagger: 0.07, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
        0.34
      );
    }
  }

  const coordinates = home.querySelectorAll<HTMLElement>('[data-hero-coordinate]');
  const coordinateRule = home.querySelector<HTMLElement>('[data-coordinate-rule]');
  const title = home.querySelector<HTMLElement>('[data-hero-title]');
  const copy = home.querySelector<HTMLElement>('[data-hero-copy]');
  const primary = home.querySelector<HTMLElement>('[data-hero-action="primary"]');
  const primaryArrow = home.querySelector<HTMLElement>('[data-primary-arrow]');
  const secondary = home.querySelector<HTMLElement>('[data-hero-action="secondary"]');
  const factLabels = home.querySelectorAll<HTMLElement>('[data-fact-label]');
  const factValues = home.querySelectorAll<HTMLElement>('[data-fact-value]');
  const factsRule = home.querySelector<HTMLElement>('[data-facts-rule]');
  const photoMask = home.querySelector<HTMLElement>('[data-hero-photo-mask]');
  const projectDetails = home.querySelectorAll<HTMLElement>('[data-project-detail]');
  const projectArrow = home.querySelector<HTMLElement>('[data-project-arrow]');

  if (coordinateRule) {
    tl.to(coordinateRule, { scaleX: 1, duration: 0.6, ease: 'power2.inOut' }, 0.1);
  }
  if (coordinates.length) {
    tl.to(
      coordinates,
      { y: 0, autoAlpha: 1, duration: 0.42, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
      0.16
    );
  }
  if (title) {
    animateSplitHeading(tl, title, 0.18);
  }
  if (photoMask) {
    schedulePhotoReveal(tl, photoMask, 0.18);
  }
  if (copy) {
    tl.to(
      copy,
      { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
      0.42
    );
  }
  if (primary) {
    tl.to(
      primary,
      { y: 0, autoAlpha: 1, duration: 0.46, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
      0.54
    );
  }
  if (primaryArrow) {
    tl.to(
      primaryArrow,
      { y: 0, duration: 0.36, ease: 'power3.out', clearProps: 'transform' },
      0.66
    );
  }
  if (secondary) {
    tl.to(
      secondary,
      { y: 0, autoAlpha: 1, duration: 0.46, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
      0.62
    );
  }
  if (factsRule) {
    tl.to(factsRule, { scaleX: 1, duration: 0.52, ease: 'power2.inOut' }, 0.68);
  }
  if (factLabels.length) {
    tl.to(
      factLabels,
      { y: 0, autoAlpha: 1, duration: 0.36, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
      0.76
    );
  }
  if (factValues.length) {
    tl.to(
      factValues,
      { y: 0, autoAlpha: 1, duration: 0.38, stagger: 0.06, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
      0.82
    );
  }
  if (projectDetails.length) {
    tl.to(
      projectDetails,
      { y: 0, autoAlpha: 1, duration: 0.42, stagger: 0.055, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
      0.74
    );
  }
  if (projectArrow) {
    tl.to(
      projectArrow,
      { x: 0, autoAlpha: 1, duration: 0.36, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
      0.88
    );
  }

  return tl;
}

function lockPageEntranceInitialState(container: HTMLElement) {
  const rules = container.querySelectorAll<HTMLElement>('[data-rule-reveal]');
  const breadcrumb = container.querySelector<HTMLElement>('[data-entrance-breadcrumb]');
  const eyebrow = container.querySelector<HTMLElement>('[data-entrance-eyebrow]');
  const title = container.querySelector<HTMLElement>('[data-entrance-title]');
  const copy = container.querySelector<HTMLElement>('[data-entrance-copy]');
  const verticalRule = container.querySelector<HTMLElement>('[data-rule-vertical]');
  const specsCard = container.querySelector<HTMLElement>('[data-entrance-specs]');
  const specRows = container.querySelectorAll<HTMLElement>('[data-spec-row]');
  const entrancePhoto = container.querySelector<HTMLElement>('[data-entrance-photo]');
  const caption = entrancePhoto?.querySelector<HTMLElement>('[data-card-caption]');

  if (rules.length) gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' });
  if (breadcrumb) gsap.set(breadcrumb, { y: -5, autoAlpha: 0 });
  if (eyebrow) gsap.set(eyebrow, { y: 6, autoAlpha: 0 });
  if (title) gsap.set(title, { autoAlpha: 0 });
  if (copy) gsap.set(copy, { y: 12, autoAlpha: 0 });
  if (verticalRule) gsap.set(verticalRule, { scaleY: 0, transformOrigin: 'top center' });
  if (specsCard) gsap.set(specsCard, { y: 14, autoAlpha: 0 });
  if (specRows.length) gsap.set(specRows, { y: 6, autoAlpha: 0 });
  if (caption) gsap.set(caption, { y: 8, autoAlpha: 0 });

  container.classList.add('is-motion-bound');
}

function buildPageEntranceTimeline(container: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });

  const rules = container.querySelectorAll<HTMLElement>('[data-rule-reveal]');
  const breadcrumb = container.querySelector<HTMLElement>('[data-entrance-breadcrumb]');
  const eyebrow = container.querySelector<HTMLElement>('[data-entrance-eyebrow]');
  const title = container.querySelector<HTMLElement>('[data-entrance-title]');
  const copy = container.querySelector<HTMLElement>('[data-entrance-copy]');
  const verticalRule = container.querySelector<HTMLElement>('[data-rule-vertical]');
  const specsCard = container.querySelector<HTMLElement>('[data-entrance-specs]');
  const specRows = container.querySelectorAll<HTMLElement>('[data-spec-row]');
  const entrancePhoto = container.querySelector<HTMLElement>('[data-entrance-photo]');

  if (rules.length) {
    tl.to(
      rules,
      {
        scaleX: 1,
        duration: 0.62,
        stagger: 0.08,
        ease: 'power2.inOut',
      },
      0.02
    );
  }

  if (breadcrumb) {
    tl.to(
      breadcrumb,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.4,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.08
    );
  }

  if (eyebrow) {
    tl.to(
      eyebrow,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.42,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.12
    );
  }

  if (title) {
    animateSplitHeading(tl, title, 0.16);
  }

  if (copy) {
    tl.to(
      copy,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.5,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.32
    );
  }

  if (verticalRule) {
    tl.to(
      verticalRule,
      {
        scaleY: 1,
        duration: 0.58,
        ease: 'power2.inOut',
      },
      0.36
    );
  }

  if (specsCard) {
    tl.to(
      specsCard,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.48,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.26
    );
  }

  if (specRows.length) {
    tl.to(
      specRows,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.36,
        stagger: 0.04,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.34
    );
  }

  if (entrancePhoto) {
    const photoWrapper = entrancePhoto.querySelector<HTMLElement>('[data-scroll-photo]');
    const caption = entrancePhoto.querySelector<HTMLElement>('[data-card-caption]');
    if (photoWrapper) {
      schedulePhotoReveal(tl, photoWrapper, 0.18);
    }
    if (caption) {
      tl.to(
        caption,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.44,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
        },
        0.64
      );
    }
  }

  return tl;
}

function lockSectionInitialState(section: HTMLElement) {
  const rules = section.querySelectorAll<HTMLElement>('[data-rule-reveal]');
  const verticalRules = section.querySelectorAll<HTMLElement>('[data-rule-vertical]');
  const eyebrows = section.querySelectorAll<HTMLElement>('[data-reveal-eyebrow]');
  const headings = section.querySelectorAll<HTMLElement>('[data-split-heading]');
  const copies = section.querySelectorAll<HTMLElement>('[data-reveal-copy]');
  const items = section.querySelectorAll<HTMLElement>('[data-reveal-item]');
  const serviceItems = section.querySelectorAll<HTMLElement>('[data-service-item]');
  const curtainCtas = section.querySelectorAll<HTMLElement>('[data-curtain-cta]');

  if (rules.length) gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' });
  if (verticalRules.length) gsap.set(verticalRules, { scaleY: 0, transformOrigin: 'top center' });
  if (eyebrows.length) gsap.set(eyebrows, { y: 8, autoAlpha: 0 });
  if (headings.length) gsap.set(headings, { autoAlpha: 0 });
  if (copies.length) gsap.set(copies, { y: 12, autoAlpha: 0 });
  if (items.length) gsap.set(items, { y: 14, autoAlpha: 0 });
  if (serviceItems.length) gsap.set(serviceItems, { y: 8, autoAlpha: 0 });
  if (curtainCtas.length) gsap.set(curtainCtas, { y: 10, autoAlpha: 0 });

  section.classList.add('is-motion-bound');
}

function buildSectionTimeline(section: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });

  const rules = section.querySelectorAll<HTMLElement>('[data-rule-reveal]');
  const verticalRules = section.querySelectorAll<HTMLElement>('[data-rule-vertical]');
  const eyebrows = section.querySelectorAll<HTMLElement>('[data-reveal-eyebrow]');
  const headings = section.querySelectorAll<HTMLElement>('[data-split-heading]');
  const copies = section.querySelectorAll<HTMLElement>('[data-reveal-copy]');
  const items = section.querySelectorAll<HTMLElement>('[data-reveal-item]');
  const serviceItems = section.querySelectorAll<HTMLElement>('[data-service-item]');
  const curtainCtas = section.querySelectorAll<HTMLElement>('[data-curtain-cta]');

  if (rules.length) {
    tl.to(
      rules,
      {
        scaleX: 1,
        duration: 0.64,
        stagger: 0.1,
        ease: 'power2.inOut',
      },
      0
    );
  }

  if (verticalRules.length) {
    tl.to(
      verticalRules,
      {
        scaleY: 1,
        duration: 0.64,
        stagger: 0.1,
        ease: 'power2.inOut',
      },
      0.08
    );
  }

  if (eyebrows.length) {
    tl.to(
      eyebrows,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.42,
        stagger: 0.06,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.08
    );
  }

  headings.forEach((heading, idx) => {
    animateSplitHeading(tl, heading, 0.12 + idx * 0.12);
  });

  if (copies.length) {
    tl.to(
      copies,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.24
    );
  }

  if (items.length) {
    tl.to(
      items,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.48,
        stagger: 0.07,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.26
    );
  }

  if (serviceItems.length) {
    tl.to(
      serviceItems,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.38,
        stagger: 0.04,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.3
    );
  }

  curtainCtas.forEach((cta, idx) => {
    animateCurtainCta(tl, cta, 0.28 + idx * 0.1);
  });

  return tl;
}

function lockProjectSpreadInitialState(spread: HTMLElement) {
  const rules = spread.querySelectorAll<HTMLElement>('[data-rule-reveal]');
  const meta = spread.querySelector<HTMLElement>('[data-card-meta]');
  const heading = spread.querySelector<HTMLElement>('[data-split-heading]');
  const subtitle = spread.querySelector<HTMLElement>('[data-card-subtitle]');
  const specRows = spread.querySelectorAll<HTMLElement>('[data-spec-row]');
  const cta = spread.querySelector<HTMLElement>('[data-card-cta]');
  const arrow = spread.querySelector<HTMLElement>('[data-card-arrow]');
  const captions = spread.querySelectorAll<HTMLElement>('[data-card-caption]');

  if (rules.length) gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' });
  if (meta) gsap.set(meta, { y: 8, autoAlpha: 0 });
  if (heading) gsap.set(heading, { autoAlpha: 0 });
  if (subtitle) gsap.set(subtitle, { y: 12, autoAlpha: 0 });
  if (specRows.length) gsap.set(specRows, { y: 6, autoAlpha: 0 });
  if (cta) gsap.set(cta, { y: 8, autoAlpha: 0 });
  if (arrow) gsap.set(arrow, { x: -5 });
  if (captions.length) gsap.set(captions, { y: 8, autoAlpha: 0 });

  spread.classList.add('is-motion-bound');
}

function buildProjectSpreadTimeline(spread: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });

  const rules = spread.querySelectorAll<HTMLElement>('[data-rule-reveal]');
  const meta = spread.querySelector<HTMLElement>('[data-card-meta]');
  const heading = spread.querySelector<HTMLElement>('[data-split-heading]');
  const subtitle = spread.querySelector<HTMLElement>('[data-card-subtitle]');
  const specRows = spread.querySelectorAll<HTMLElement>('[data-spec-row]');
  const cta = spread.querySelector<HTMLElement>('[data-card-cta]');
  const arrow = spread.querySelector<HTMLElement>('[data-card-arrow]');
  const photos = spread.querySelectorAll<HTMLElement>('[data-scroll-photo]');
  const captions = spread.querySelectorAll<HTMLElement>('[data-card-caption]');

  photos.forEach((photo, idx) => {
    schedulePhotoReveal(tl, photo, 0.04 + idx * 0.12);
  });

  if (rules.length) {
    tl.to(
      rules,
      {
        scaleX: 1,
        duration: 0.64,
        stagger: 0.08,
        ease: 'power2.inOut',
      },
      0
    );
  }

  if (meta) {
    tl.to(
      meta,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.42,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.08
    );
  }

  if (heading) {
    animateSplitHeading(tl, heading, 0.12);
  }

  if (subtitle) {
    tl.to(
      subtitle,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.48,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.24
    );
  }

  if (specRows.length) {
    tl.to(
      specRows,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.36,
        stagger: 0.05,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.3
    );
  }

  if (cta) {
    tl.to(
      cta,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.42,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.36
    );
  }

  if (arrow) {
    tl.to(
      arrow,
      {
        x: 0,
        duration: 0.36,
        ease: 'power3.out',
        clearProps: 'transform',
      },
      0.42
    );
  }

  if (captions.length) {
    tl.to(
      captions,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.44,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.46
    );
  }

  return tl;
}

function lockCardInitialState(card: HTMLElement) {
  const meta = card.querySelector<HTMLElement>('[data-card-meta]');
  const title = card.querySelector<HTMLElement>('[data-card-title]');
  const subtitle = card.querySelector<HTMLElement>('[data-card-subtitle]');
  const cta = card.querySelector<HTMLElement>('[data-card-cta]');
  const arrow = card.querySelector<HTMLElement>('[data-card-arrow]');
  const caption = card.querySelector<HTMLElement>('[data-card-caption]');

  const textParts = [meta, title, subtitle, cta, caption].filter(
    (el): el is HTMLElement => Boolean(el)
  );
  if (textParts.length) {
    gsap.set(textParts, { y: 10, autoAlpha: 0 });
  }
  if (arrow) {
    gsap.set(arrow, { x: -4 });
  }
  card.classList.add('is-motion-bound');
}

function addCardToTimeline(
  tl: gsap.core.Timeline,
  card: HTMLElement,
  offset: number
) {
  const photo = card.querySelector<HTMLElement>('[data-scroll-photo]');
  const meta = card.querySelector<HTMLElement>('[data-card-meta]');
  const title = card.querySelector<HTMLElement>('[data-card-title]');
  const subtitle = card.querySelector<HTMLElement>('[data-card-subtitle]');
  const cta = card.querySelector<HTMLElement>('[data-card-cta]');
  const arrow = card.querySelector<HTMLElement>('[data-card-arrow]');
  const caption = card.querySelector<HTMLElement>('[data-card-caption]');

  if (photo) {
    schedulePhotoReveal(tl, photo, offset);
  }

  const textParts = [meta, title, subtitle, cta, caption].filter(
    (el): el is HTMLElement => Boolean(el)
  );

  if (textParts.length) {
    tl.to(
      textParts,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.44,
        stagger: 0.05,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      offset + 0.18
    );
  }

  if (arrow) {
    tl.to(
      arrow,
      {
        x: 0,
        duration: 0.36,
        ease: 'power3.out',
        clearProps: 'transform',
      },
      offset + 0.36
    );
  }
}

function buildDiptychTimeline(diptych: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });
  const cards = diptych.querySelectorAll<HTMLElement>('[data-project-card]');
  cards.forEach((card, index) => {
    addCardToTimeline(tl, card, index * 0.12);
  });
  return tl;
}

function buildSingleCardTimeline(card: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });
  addCardToTimeline(tl, card, 0);
  return tl;
}

function lockServiceGridInitialState(grid: HTMLElement) {
  const cards = grid.querySelectorAll<HTMLElement>('[data-service-card]');
  cards.forEach((card) => {
    const rules = card.querySelectorAll<HTMLElement>('[data-rule-reveal]');
    const items = card.querySelectorAll<HTMLElement>('[data-service-item]');
    gsap.set(card, { y: 16, autoAlpha: 0 });
    if (rules.length) gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' });
    if (items.length) gsap.set(items, { y: 6, autoAlpha: 0 });
  });
  grid.classList.add('is-motion-bound');
}

function buildServiceGridTimeline(grid: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });
  const cards = grid.querySelectorAll<HTMLElement>('[data-service-card]');

  cards.forEach((card, index) => {
    const start = index * 0.09;
    const rules = card.querySelectorAll<HTMLElement>('[data-rule-reveal]');
    const items = card.querySelectorAll<HTMLElement>('[data-service-item]');

    tl.to(
      card,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.5,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      start
    );

    if (rules.length) {
      tl.to(
        rules,
        {
          scaleX: 1,
          duration: 0.54,
          stagger: 0.08,
          ease: 'power2.inOut',
        },
        start + 0.1
      );
    }

    if (items.length) {
      tl.to(
        items,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.34,
          stagger: 0.035,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
        },
        start + 0.18
      );
    }
  });

  return tl;
}

function lockReviewGridInitialState(grid: HTMLElement) {
  const cards = grid.querySelectorAll<HTMLElement>('[data-review-card]');
  cards.forEach((card) => {
    const rules = card.querySelectorAll<HTMLElement>('[data-rule-reveal]');
    const stars = card.querySelectorAll<HTMLElement>('[data-review-star]');
    const quote = card.querySelector<HTMLElement>('[data-review-quote]');
    const footer = card.querySelector<HTMLElement>('[data-review-footer]');

    gsap.set(card, { y: 16, autoAlpha: 0 });
    if (rules.length) gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' });
    if (stars.length) gsap.set(stars, { scale: 0.4, autoAlpha: 0, transformOrigin: 'center center' });
    if (quote) gsap.set(quote, { y: 8, autoAlpha: 0 });
    if (footer) gsap.set(footer, { y: 6, autoAlpha: 0 });
  });
  grid.classList.add('is-motion-bound');
}

function buildReviewGridTimeline(grid: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });
  const cards = grid.querySelectorAll<HTMLElement>('[data-review-card]');

  cards.forEach((card, index) => {
    const start = index * 0.08;
    const rules = card.querySelectorAll<HTMLElement>('[data-rule-reveal]');
    const stars = card.querySelectorAll<HTMLElement>('[data-review-star]');
    const quote = card.querySelector<HTMLElement>('[data-review-quote]');
    const footer = card.querySelector<HTMLElement>('[data-review-footer]');

    tl.to(
      card,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.48,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      start
    );

    if (rules.length) {
      tl.to(
        rules,
        {
          scaleX: 1,
          duration: 0.52,
          stagger: 0.08,
          ease: 'power2.inOut',
        },
        start + 0.1
      );
    }

    if (stars.length) {
      tl.to(
        stars,
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.32,
          stagger: 0.03,
          ease: 'back.out(2)',
          clearProps: 'transform,opacity,visibility',
        },
        start + 0.14
      );
    }

    if (quote) {
      tl.to(
        quote,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.42,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
        },
        start + 0.22
      );
    }

    if (footer) {
      tl.to(
        footer,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.38,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
        },
        start + 0.28
      );
    }
  });

  return tl;
}

function waitForFontsWithTimeout(timeoutMs = 180): Promise<void> {
  if (!('fonts' in document) || !document.fonts?.ready) {
    return Promise.resolve();
  }
  return Promise.race([
    document.fonts.ready.then(() => undefined).catch(() => undefined),
    new Promise<void>((resolve) => window.setTimeout(resolve, timeoutMs)),
  ]);
}

function revealAllFallback() {
  const root = document.documentElement;
  if (window.__appuntoFallbackTimer) {
    window.clearTimeout(window.__appuntoFallbackTimer);
  }
  root.classList.remove('js-motion', 'motion-sequence-pending');
  document
    .querySelectorAll<HTMLElement>('[data-hero-photo-mask], [data-scroll-photo]')
    .forEach((el) => markPhotoRevealed(el));
}

export async function initEditorialMotion() {
  if (activeCleanup) {
    activeCleanup();
    activeCleanup = null;
  }

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) {
    revealAllFallback();
    return;
  }

  const activeTimelines: gsap.core.Timeline[] = [];
  let preloadObserver: IntersectionObserver | null = null;

  try {
    // =========================================================================
    // PHASE 1: SYNCHRONOUS PRE-PAINT / PRE-AWAIT STATE LOCKING
    // Lock all initial states immediately so there is zero gap between
    // <head> CSS rules and GSAP inline styles.
    // =========================================================================
    const allPhotos = Array.from(
      document.querySelectorAll<HTMLElement>('[data-hero-photo-mask], [data-scroll-photo]')
    );
    allPhotos.forEach((photoWrapper) => {
      preparePhotoReveal(photoWrapper, activeTimelines);
    });

    if ('IntersectionObserver' in window && allPhotos.length > 0) {
      preloadObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const wrapper = entry.target as HTMLElement;
            const img = wrapper.querySelector<HTMLImageElement>('img');
            if (img) {
              if (img.loading === 'lazy') img.loading = 'eager';
              img.decode?.().catch(() => undefined);
            }
            preloadObserver?.unobserve(wrapper);
          });
        },
        { rootMargin: '450px 0px 450px 0px' }
      );
      allPhotos.forEach((p) => preloadObserver?.observe(p));
    }

    const header = document.querySelector<HTMLElement>('header');
    const homeEntrance = document.querySelector<HTMLElement>('[data-home-entrance]');
    if (homeEntrance) {
      lockHomeEntranceInitialState(homeEntrance, header);
    }

    const pageEntrances = Array.from(
      document.querySelectorAll<HTMLElement>('[data-page-entrance]')
    );
    pageEntrances.forEach((container) => lockPageEntranceInitialState(container));

    const scrollSections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-scroll-section]')
    );
    scrollSections.forEach((section) => lockSectionInitialState(section));

    const projectSpreads = Array.from(
      document.querySelectorAll<HTMLElement>('[data-project-spread]')
    );
    projectSpreads.forEach((spread) => lockProjectSpreadInitialState(spread));

    const projectDiptychs = Array.from(
      document.querySelectorAll<HTMLElement>('[data-project-diptych]')
    );
    const diptychCardSet = new Set<HTMLElement>();
    projectDiptychs.forEach((diptych) => {
      diptych.classList.add('is-motion-bound');
      diptych.querySelectorAll<HTMLElement>('[data-project-card]').forEach((card) => {
        diptychCardSet.add(card);
        lockCardInitialState(card);
      });
    });

    const standaloneCards = Array.from(
      document.querySelectorAll<HTMLElement>('[data-project-card]')
    ).filter((card) => !diptychCardSet.has(card));
    standaloneCards.forEach((card) => lockCardInitialState(card));

    const serviceGrids = Array.from(
      document.querySelectorAll<HTMLElement>('[data-service-grid]')
    );
    serviceGrids.forEach((grid) => lockServiceGridInitialState(grid));

    const reviewGrids = Array.from(
      document.querySelectorAll<HTMLElement>('[data-review-grid]')
    );
    reviewGrids.forEach((grid) => lockReviewGridInitialState(grid));

    // =========================================================================
    // PHASE 2: WAIT FOR FONTS (BOUNDED TO 180MS MAX) & BUILD TIMELINES
    // =========================================================================
    await waitForFontsWithTimeout(180);

    if (reducedMotion.matches) {
      revealAllFallback();
      return;
    }

    if (window.__appuntoFallbackTimer) {
      window.clearTimeout(window.__appuntoFallbackTimer);
    }

    // 1. Homepage Hero + Header Entrance
    if (homeEntrance) {
      const homeTl = buildHomeEntranceTimeline(homeEntrance, header);
      activeTimelines.push(homeTl);
      root.classList.remove('motion-sequence-pending');
      homeTl.play(0);
    } else {
      root.classList.remove('motion-sequence-pending');
    }

    // 2. Inner-page Entrance ([data-page-entrance])
    pageEntrances.forEach((container) => {
      const tl = buildPageEntranceTimeline(container);
      activeTimelines.push(tl);
      tl.play(0);
    });

    // 3. Scroll-choreographed blocks
    const scrollBlocks: ScrollBlock[] = [];

    const registerBlock = (element: HTMLElement, timeline: gsap.core.Timeline) => {
      const photos = Array.from(
        element.querySelectorAll<HTMLElement>('[data-scroll-photo]')
      );
      activeTimelines.push(timeline);
      scrollBlocks.push({ element, timeline, photos, triggered: false });
    };

    scrollSections.forEach((section) => {
      registerBlock(section, buildSectionTimeline(section));
    });

    projectSpreads.forEach((spread) => {
      registerBlock(spread, buildProjectSpreadTimeline(spread));
    });

    projectDiptychs.forEach((diptych) => {
      registerBlock(diptych, buildDiptychTimeline(diptych));
    });

    standaloneCards.forEach((card) => {
      registerBlock(card, buildSingleCardTimeline(card));
    });

    serviceGrids.forEach((grid) => {
      registerBlock(grid, buildServiceGridTimeline(grid));
    });

    reviewGrids.forEach((grid) => {
      registerBlock(grid, buildReviewGridTimeline(grid));
    });

    let lastScrollY = window.scrollY;
    let frame = 0;

    const completeBlockInstantly = (block: ScrollBlock) => {
      block.triggered = true;
      block.timeline.progress(1);
      block.photos.forEach((p) => triggerPhotoTimeline(p, true));
    };

    const evaluateScrollBlocks = () => {
      frame = 0;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const currentScrollY = window.scrollY;
      const isLargeJump = Math.abs(currentScrollY - lastScrollY) > 250;
      lastScrollY = currentScrollY;

      const threshold = vh * 0.88;

      if (isLargeJump) {
        activeTimelines.forEach((tl) => {
          if (tl.isActive()) tl.progress(1);
        });
      }

      scrollBlocks.forEach((block) => {
        const rect = block.element.getBoundingClientRect();

        if (!block.triggered && rect.top <= threshold) {
          block.triggered = true;
          if (isLargeJump || rect.bottom < 0) {
            completeBlockInstantly(block);
          } else {
            block.timeline.play(0);
          }
        } else if (block.triggered && isLargeJump) {
          completeBlockInstantly(block);
        }
      });

      if (scrollBlocks.every((b) => b.triggered && !b.timeline.isActive())) {
        window.removeEventListener('scroll', onScrollOrResize);
        window.removeEventListener('resize', onScrollOrResize);
      }
    };

    const onScrollOrResize = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(evaluateScrollBlocks);
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize, { passive: true });
    evaluateScrollBlocks();

    const onReducedMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        activeTimelines.forEach((tl) => tl.progress(1));
        allPhotos.forEach((p) => triggerPhotoTimeline(p, true));
        revealAllFallback();
      }
    };
    reducedMotion.addEventListener('change', onReducedMotionChange, { once: true });

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        evaluateScrollBlocks();
      }
    };
    window.addEventListener('pageshow', onPageShow);

    activeCleanup = () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('pageshow', onPageShow);
      reducedMotion.removeEventListener('change', onReducedMotionChange);
      if (frame) window.cancelAnimationFrame(frame);
      preloadObserver?.disconnect();
      activeTimelines.forEach((tl) => tl.kill());
    };
  } catch {
    revealAllFallback();
  }
}
