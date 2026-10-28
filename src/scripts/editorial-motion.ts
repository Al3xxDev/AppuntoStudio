import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

interface ScrollBlock {
  element: HTMLElement;
  timeline: gsap.core.Timeline;
  triggered: boolean;
}

function getInitialClipPath(variant: string | undefined): string {
  switch (variant) {
    case 'hero':
      return 'inset(0% 48% 0% 48%)';
    case 'panorama':
      return 'inset(0% 44% 0% 44%)';
    case 'portrait':
      return 'inset(22% 0% 22% 0%)';
    case 'landscape':
      return 'inset(0% 34% 0% 34%)';
    default:
      return 'inset(0% 42% 0% 42%)';
  }
}

function animatePhotoReveal(
  tl: gsap.core.Timeline,
  photoWrapper: HTMLElement,
  startTime: number
) {
  const variant = photoWrapper.dataset.scrollVariant;
  const initialClip = getInitialClipPath(variant);
  const img = photoWrapper.querySelector<HTMLImageElement>('.scroll-photo-img, img');

  if (img) {
    if (img.loading === 'lazy') {
      img.loading = 'eager';
    }
    img.decode?.().catch(() => undefined);
  }

  tl.fromTo(
    photoWrapper,
    {
      clipPath: initialClip,
    },
    {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: 0.92,
      ease: 'power3.inOut',
      clearProps: 'clipPath',
      immediateRender: false,
    },
    startTime
  );

  if (img) {
    tl.fromTo(
      img,
      {
        scale: 1.06,
        transformOrigin: 'center center',
      },
      {
        scale: 1,
        duration: 1.14,
        ease: 'power3.out',
        clearProps: 'transform',
        immediateRender: false,
      },
      startTime
    );
  }
}

function animateSplitHeading(
  tl: gsap.core.Timeline,
  heading: HTMLElement,
  startTime: number
) {
  try {
    const split = SplitText.create(heading, {
      type: 'lines',
      mask: 'lines',
      aria: 'auto',
    });
    if (split.lines && split.lines.length > 0) {
      gsap.set(split.lines, { yPercent: 108, autoAlpha: 0 });
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
    gsap.set(cover, { scaleX: 1, transformOrigin: 'right center' });
    tl.to(
      cover,
      {
        scaleX: 0,
        duration: 0.5,
        ease: 'power2.inOut',
      },
      startTime
    );
  }

  if (content) {
    gsap.set(content, { y: 6, autoAlpha: 0 });
    tl.to(
      content,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.42,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      startTime + 0.12
    );
  }

  if (arrow) {
    gsap.set(arrow, { x: -4 });
    tl.to(
      arrow,
      {
        x: 0,
        duration: 0.36,
        ease: 'power3.out',
        clearProps: 'transform',
      },
      startTime + 0.24
    );
  }
}

function playPageEntrance(container: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline();

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
    gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' });
    tl.to(
      rules,
      {
        scaleX: 1,
        duration: 0.64,
        stagger: 0.1,
        ease: 'power2.inOut',
      },
      0.05
    );
  }

  if (breadcrumb) {
    gsap.set(breadcrumb, { y: -5, autoAlpha: 0 });
    tl.to(
      breadcrumb,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.42,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.1
    );
  }

  if (eyebrow) {
    gsap.set(eyebrow, { y: 6, autoAlpha: 0 });
    tl.to(
      eyebrow,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.44,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.16
    );
  }

  if (title) {
    animateSplitHeading(tl, title, 0.22);
  }

  if (copy) {
    gsap.set(copy, { y: 12, autoAlpha: 0 });
    tl.to(
      copy,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.54,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.42
    );
  }

  if (verticalRule) {
    gsap.set(verticalRule, { scaleY: 0, transformOrigin: 'top center' });
    tl.to(
      verticalRule,
      {
        scaleY: 1,
        duration: 0.62,
        ease: 'power2.inOut',
      },
      0.48
    );
  }

  if (specsCard) {
    gsap.set(specsCard, { y: 14, autoAlpha: 0 });
    tl.to(
      specsCard,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.52,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.36
    );
  }

  if (specRows.length) {
    gsap.set(specRows, { y: 6, autoAlpha: 0 });
    tl.to(
      specRows,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.38,
        stagger: 0.045,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.46
    );
  }

  if (entrancePhoto) {
    const photoWrapper = entrancePhoto.querySelector<HTMLElement>('[data-scroll-photo]');
    const caption = entrancePhoto.querySelector<HTMLElement>('[data-card-caption]');
    if (photoWrapper) {
      animatePhotoReveal(tl, photoWrapper, 0.34);
    }
    if (caption) {
      gsap.set(caption, { y: 8, autoAlpha: 0 });
      tl.to(
        caption,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.45,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
        },
        0.78
      );
    }
  }

  return tl;
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
    gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' });
    tl.to(
      rules,
      {
        scaleX: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power2.inOut',
      },
      0
    );
  }

  if (verticalRules.length) {
    gsap.set(verticalRules, { scaleY: 0, transformOrigin: 'top center' });
    tl.to(
      verticalRules,
      {
        scaleY: 1,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power2.inOut',
      },
      0.12
    );
  }

  if (eyebrows.length) {
    gsap.set(eyebrows, { y: 8, autoAlpha: 0 });
    tl.to(
      eyebrows,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.44,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.08
    );
  }

  headings.forEach((heading, idx) => {
    animateSplitHeading(tl, heading, 0.14 + idx * 0.08);
  });

  if (copies.length) {
    gsap.set(copies, { y: 14, autoAlpha: 0 });
    tl.to(
      copies,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.54,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.26
    );
  }

  if (items.length) {
    gsap.set(items, { y: 14, autoAlpha: 0 });
    tl.to(
      items,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.52,
        stagger: 0.075,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.28
    );
  }

  if (serviceItems.length) {
    gsap.set(serviceItems, { y: 8, autoAlpha: 0 });
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
      0.34
    );
  }

  curtainCtas.forEach((cta, idx) => {
    animateCurtainCta(tl, cta, 0.32 + idx * 0.1);
  });

  return tl;
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

  if (rules.length) {
    gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' });
    tl.to(
      rules,
      {
        scaleX: 1,
        duration: 0.68,
        stagger: 0.1,
        ease: 'power2.inOut',
      },
      0
    );
  }

  if (meta) {
    gsap.set(meta, { y: 8, autoAlpha: 0 });
    tl.to(
      meta,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.44,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.1
    );
  }

  if (heading) {
    animateSplitHeading(tl, heading, 0.16);
  }

  if (subtitle) {
    gsap.set(subtitle, { y: 12, autoAlpha: 0 });
    tl.to(
      subtitle,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.52,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.28
    );
  }

  if (specRows.length) {
    gsap.set(specRows, { y: 6, autoAlpha: 0 });
    tl.to(
      specRows,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.38,
        stagger: 0.055,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.34
    );
  }

  if (cta) {
    gsap.set(cta, { y: 8, autoAlpha: 0 });
    tl.to(
      cta,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.44,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.42
    );
  }

  if (arrow) {
    gsap.set(arrow, { x: -5 });
    tl.to(
      arrow,
      {
        x: 0,
        duration: 0.38,
        ease: 'power3.out',
        clearProps: 'transform',
      },
      0.48
    );
  }

  photos.forEach((photo, idx) => {
    animatePhotoReveal(tl, photo, 0.14 + idx * 0.14);
  });

  if (captions.length) {
    gsap.set(captions, { y: 8, autoAlpha: 0 });
    tl.to(
      captions,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.46,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      0.56
    );
  }

  return tl;
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
    animatePhotoReveal(tl, photo, offset);
  }

  const textParts = [meta, title, subtitle, cta, caption].filter(
    (el): el is HTMLElement => Boolean(el)
  );

  if (textParts.length) {
    gsap.set(textParts, { y: 10, autoAlpha: 0 });
    tl.to(
      textParts,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.46,
        stagger: 0.055,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      offset + 0.22
    );
  }

  if (arrow) {
    gsap.set(arrow, { x: -4 });
    tl.to(
      arrow,
      {
        x: 0,
        duration: 0.36,
        ease: 'power3.out',
        clearProps: 'transform',
      },
      offset + 0.42
    );
  }
}

function buildDiptychTimeline(diptych: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });
  const cards = diptych.querySelectorAll<HTMLElement>('[data-project-card]');
  cards.forEach((card, index) => {
    addCardToTimeline(tl, card, index * 0.15);
  });
  return tl;
}

function buildSingleCardTimeline(card: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });
  addCardToTimeline(tl, card, 0);
  return tl;
}

function buildServiceGridTimeline(grid: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });
  const cards = grid.querySelectorAll<HTMLElement>('[data-service-card]');

  cards.forEach((card, index) => {
    const start = index * 0.1;
    const rules = card.querySelectorAll<HTMLElement>('[data-rule-reveal]');
    const items = card.querySelectorAll<HTMLElement>('[data-service-item]');

    gsap.set(card, { y: 16, autoAlpha: 0 });
    tl.to(
      card,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.54,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      start
    );

    if (rules.length) {
      gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' });
      tl.to(
        rules,
        {
          scaleX: 1,
          duration: 0.56,
          ease: 'power2.inOut',
        },
        start + 0.14
      );
    }

    if (items.length) {
      gsap.set(items, { y: 6, autoAlpha: 0 });
      tl.to(
        items,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.36,
          stagger: 0.04,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
        },
        start + 0.2
      );
    }
  });

  return tl;
}

function buildReviewGridTimeline(grid: HTMLElement): gsap.core.Timeline {
  const tl = gsap.timeline({ paused: true });
  const cards = grid.querySelectorAll<HTMLElement>('[data-review-card]');

  cards.forEach((card, index) => {
    const start = index * 0.11;
    const rules = card.querySelectorAll<HTMLElement>('[data-rule-reveal]');
    const stars = card.querySelectorAll<HTMLElement>('[data-review-star]');
    const quote = card.querySelector<HTMLElement>('[data-review-quote]');
    const footer = card.querySelector<HTMLElement>('[data-review-footer]');

    gsap.set(card, { y: 16, autoAlpha: 0 });
    tl.to(
      card,
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.54,
        ease: 'power3.out',
        clearProps: 'transform,opacity,visibility',
      },
      start
    );

    if (rules.length) {
      gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' });
      tl.to(
        rules,
        {
          scaleX: 1,
          duration: 0.56,
          stagger: 0.08,
          ease: 'power2.inOut',
        },
        start + 0.12
      );
    }

    if (stars.length) {
      gsap.set(stars, { scale: 0.4, autoAlpha: 0, transformOrigin: 'center center' });
      tl.to(
        stars,
        {
          scale: 1,
          autoAlpha: 1,
          duration: 0.34,
          stagger: 0.035,
          ease: 'back.out(2)',
          clearProps: 'transform,opacity,visibility',
        },
        start + 0.16
      );
    }

    if (quote) {
      gsap.set(quote, { y: 8, autoAlpha: 0 });
      tl.to(
        quote,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.44,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
        },
        start + 0.24
      );
    }

    if (footer) {
      gsap.set(footer, { y: 6, autoAlpha: 0 });
      tl.to(
        footer,
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.4,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
        },
        start + 0.32
      );
    }
  });

  return tl;
}

export async function initEditorialMotion() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  try {
    await document.fonts.ready;
  } catch {
    // Continue if fonts.ready is unsupported
  }

  if (reducedMotion.matches) return;

  const activeTimelines: gsap.core.Timeline[] = [];

  // 1. Inner-page opening choreography ([data-page-entrance])
  document.querySelectorAll<HTMLElement>('[data-page-entrance]').forEach((container) => {
    if (container.dataset.motionInitialized === 'true') return;
    container.dataset.motionInitialized = 'true';
    const tl = playPageEntrance(container);
    activeTimelines.push(tl);
  });

  // 2. Collect scroll-choreographed blocks
  const scrollBlocks: ScrollBlock[] = [];

  document.querySelectorAll<HTMLElement>('[data-scroll-section]').forEach((section) => {
    if (section.dataset.motionInitialized === 'true') return;
    section.dataset.motionInitialized = 'true';
    const tl = buildSectionTimeline(section);
    activeTimelines.push(tl);
    scrollBlocks.push({ element: section, timeline: tl, triggered: false });
  });

  document.querySelectorAll<HTMLElement>('[data-project-spread]').forEach((spread) => {
    if (spread.dataset.motionInitialized === 'true') return;
    spread.dataset.motionInitialized = 'true';
    const tl = buildProjectSpreadTimeline(spread);
    activeTimelines.push(tl);
    scrollBlocks.push({ element: spread, timeline: tl, triggered: false });
  });

  document.querySelectorAll<HTMLElement>('[data-project-diptych]').forEach((diptych) => {
    if (diptych.dataset.motionInitialized === 'true') return;
    diptych.dataset.motionInitialized = 'true';
    diptych.querySelectorAll<HTMLElement>('[data-project-card]').forEach((card) => {
      card.dataset.motionInitialized = 'true';
    });
    const tl = buildDiptychTimeline(diptych);
    activeTimelines.push(tl);
    scrollBlocks.push({ element: diptych, timeline: tl, triggered: false });
  });

  document.querySelectorAll<HTMLElement>('[data-project-card]').forEach((card) => {
    if (card.dataset.motionInitialized === 'true') return;
    card.dataset.motionInitialized = 'true';
    const tl = buildSingleCardTimeline(card);
    activeTimelines.push(tl);
    scrollBlocks.push({ element: card, timeline: tl, triggered: false });
  });

  document.querySelectorAll<HTMLElement>('[data-service-grid]').forEach((grid) => {
    if (grid.dataset.motionInitialized === 'true') return;
    grid.dataset.motionInitialized = 'true';
    const tl = buildServiceGridTimeline(grid);
    activeTimelines.push(tl);
    scrollBlocks.push({ element: grid, timeline: tl, triggered: false });
  });

  document.querySelectorAll<HTMLElement>('[data-review-grid]').forEach((grid) => {
    if (grid.dataset.motionInitialized === 'true') return;
    grid.dataset.motionInitialized = 'true';
    const tl = buildReviewGridTimeline(grid);
    activeTimelines.push(tl);
    scrollBlocks.push({ element: grid, timeline: tl, triggered: false });
  });

  if (!scrollBlocks.length) return;

  let lastScrollY = window.scrollY;
  let frame = 0;

  const evaluateScrollBlocks = () => {
    frame = 0;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const currentScrollY = window.scrollY;
    const isLargeJump = Math.abs(currentScrollY - lastScrollY) > 250;
    lastScrollY = currentScrollY;

    const threshold = vh * 0.92;

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
          block.timeline.progress(1);
        } else {
          block.timeline.play(0);
        }
      } else if (block.triggered && isLargeJump) {
        block.timeline.progress(1);
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

  reducedMotion.addEventListener(
    'change',
    (e) => {
      if (e.matches) {
        window.removeEventListener('scroll', onScrollOrResize);
        window.removeEventListener('resize', onScrollOrResize);
        if (frame) window.cancelAnimationFrame(frame);
        activeTimelines.forEach((tl) => tl.progress(1));
      }
    },
    { once: true }
  );
}
