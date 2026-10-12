(() => {
  const article = document.querySelector('.article-content');
  const toc = document.querySelector('.article-toc');
  if (!article || !toc) return;

  const links = [...toc.querySelectorAll('a[href^="#"]')];
  const entries = links.map((link) => ({
    link,
    section: document.getElementById(decodeURIComponent(link.hash.slice(1))),
  })).filter((entry) => entry.section);
  const progress = document.querySelector('[data-reading-percent]');
  const compactLayout = window.matchMedia('(max-width: 840px)');
  let framePending = false;
  let currentLink = null;

  function updateReadingState() {
    framePending = false;
    const viewportHeight = window.innerHeight;
    const articleBounds = article.getBoundingClientRect();
    const threshold = Math.min(180, viewportHeight * .22);
    let activeLink = entries[0]?.link;
    entries.forEach(({ link, section }) => {
      if (section.getBoundingClientRect().top <= threshold) activeLink = link;
    });

    if (activeLink !== currentLink) {
      links.forEach((link) => {
        if (link === activeLink) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      currentLink = activeLink;
    }

    if (progress) {
      const readingDistance = articleBounds.height - viewportHeight;
      const fraction = readingDistance > 0
        ? Math.min(1, Math.max(0, -articleBounds.top / readingDistance))
        : articleBounds.bottom <= viewportHeight ? 1 : 0;
      progress.textContent = `${Math.round(fraction * 100)}%`;
    }
  }

  function scheduleUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updateReadingState);
  }

  function updateTocLayout() {
    toc.open = !compactLayout.matches;
    scheduleUpdate();
  }

  // Native anchors and details remain usable when JavaScript is unavailable.
  updateTocLayout();
  if (typeof compactLayout.addEventListener === 'function') {
    compactLayout.addEventListener('change', updateTocLayout);
  } else {
    compactLayout.addListener(updateTocLayout);
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  toc.addEventListener('toggle', scheduleUpdate);
  article.addEventListener('load', scheduleUpdate, true);
  if (typeof ResizeObserver === 'function') new ResizeObserver(scheduleUpdate).observe(article);
  if (document.fonts?.ready) document.fonts.ready.then(scheduleUpdate);
  scheduleUpdate();
})();
