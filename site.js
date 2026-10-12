(() => {
  const button = document.querySelector('[data-language-toggle]');
  if (!button) return;
  const translatedElements = [...document.querySelectorAll('[data-zh]')];
  translatedElements.forEach((element) => { element.dataset.en = element.textContent; });

  function setLanguage(language) {
    const chinese = language === 'zh';
    document.documentElement.lang = chinese ? 'zh-CN' : 'en';
    translatedElements.forEach((element) => {
      element.textContent = chinese ? element.dataset.zh : element.dataset.en;
    });
    button.setAttribute('aria-label', chinese ? 'Switch to English' : '切换到中文');
    document.querySelectorAll('[data-site-nav]').forEach((navigation) => {
      navigation.setAttribute('aria-label', chinese ? '主导航' : 'Main navigation');
    });
    try { localStorage.setItem('homepage-language', language); } catch { /* The site also works without browser storage. */ }
  }

  button.addEventListener('click', () => setLanguage(document.documentElement.lang === 'en' ? 'zh' : 'en'));
  let initialLanguage = 'en';
  try {
    if (localStorage.getItem('homepage-language') === 'zh') initialLanguage = 'zh';
  } catch { /* Keep the default English page when storage is unavailable. */ }
  setLanguage(initialLanguage);
  button.hidden = false;
})();

(() => {
  // On narrow screens the header links scroll sideways; keep the current one in view.
  function revealActiveLinks() {
    document.querySelectorAll('[data-site-nav]').forEach((navigation) => {
      const active = navigation.querySelector('.is-active');
      if (!active || navigation.scrollWidth <= navigation.clientWidth) return;
      const overflow = active.getBoundingClientRect().right - navigation.getBoundingClientRect().right + 16;
      if (overflow > 0) navigation.scrollLeft += overflow;
    });
  }

  document.querySelector('[data-language-toggle]')?.addEventListener('click', revealActiveLinks);
  revealActiveLinks();
})();

(() => {
  // On the homepage, highlight the header link for the section being read.
  const sections = [...document.querySelectorAll('[data-site-nav] a[href^="#"]')]
    .map((link) => ({ link, target: document.getElementById(link.hash.slice(1)) }))
    .filter(({ target }) => target);
  if (!sections.length) return;

  let framePending = false;
  function update() {
    framePending = false;
    const offset = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + 8;
    let active = sections[0];
    sections.forEach((section) => {
      if (section.target.getBoundingClientRect().top <= offset) active = section;
    });
    sections.forEach(({ link }) => {
      const current = link === active.link;
      link.classList.toggle('is-active', current);
      if (current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  }

  function requestUpdate() {
    if (framePending) return;
    framePending = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  update();
})();

(() => {
  const viewer = document.querySelector('#figure-viewer');
  if (!viewer || typeof viewer.showModal !== 'function') return;

  const title = document.querySelector('#figure-viewer-title');
  const caption = document.querySelector('#figure-viewer-caption');
  const source = document.querySelector('#figure-viewer-source');
  const image = document.querySelector('#figure-viewer-image');
  const stage = document.querySelector('#figure-viewer-stage');
  const closeButton = document.querySelector('#figure-viewer-close');
  const zoomButton = document.querySelector('#figure-viewer-zoom');
  if (!title || !caption || !source || !image || !stage || !closeButton || !zoomButton) return;

  let opener = null;
  let zoomed = false;
  let pressedOutside = false;

  function updateLanguage() {
    const chinese = document.documentElement.lang.startsWith('zh');
    if (opener) caption.textContent = chinese ? opener.dataset.captionZh : opener.dataset.captionEn;
    zoomButton.textContent = chinese ? (zoomed ? '缩小' : '放大') : (zoomed ? 'Zoom out' : 'Zoom in');
  }

  function resetZoom() {
    zoomed = false;
    viewer.classList.remove('is-zoomed');
    image.style.removeProperty('width');
    image.style.removeProperty('height');
    stage.scrollLeft = 0;
    stage.scrollTop = 0;
    zoomButton.setAttribute('aria-pressed', 'false');
    updateLanguage();
  }

  document.querySelectorAll('.publication-figure').forEach((figure) => {
    figure.addEventListener('click', (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const thumbnail = figure.querySelector('img');
      if (!thumbnail) return;

      opener = figure;
      title.textContent = figure.dataset.viewerTitle;
      source.href = figure.href;
      source.target = '_blank';
      source.rel = 'noopener noreferrer';
      image.alt = thumbnail.alt;
      image.src = thumbnail.currentSrc || thumbnail.src;
      resetZoom();
      pressedOutside = false;
      viewer.showModal();
      document.body.classList.add('figure-viewer-open');
      closeButton.focus({ preventScroll: true });
      event.preventDefault();
    });
  });

  zoomButton.addEventListener('click', () => {
    if (zoomed) {
      resetZoom();
      return;
    }
    if (!image.complete || !image.naturalWidth) return;
    const bounds = image.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    image.style.width = `${bounds.width * 2}px`;
    image.style.height = `${bounds.height * 2}px`;
    zoomed = true;
    viewer.classList.add('is-zoomed');
    zoomButton.setAttribute('aria-pressed', 'true');
    updateLanguage();
  });

  function outsideViewer(event) {
    const bounds = viewer.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  }

  function cleanupViewer() {
    // Native close events are queued; an older event must not affect a reopened viewer.
    if (viewer.open || !opener) return;
    const previousOpener = opener;
    opener = null;
    document.body.classList.remove('figure-viewer-open');
    resetZoom();
    pressedOutside = false;
    if (previousOpener.isConnected) previousOpener.focus({ preventScroll: true });
  }

  function closeViewer() {
    viewer.close();
    cleanupViewer();
  }

  viewer.addEventListener('mousedown', (event) => {
    pressedOutside = event.button === 0 && outsideViewer(event);
  });
  viewer.addEventListener('mouseup', (event) => {
    const shouldClose = pressedOutside && event.button === 0 && outsideViewer(event);
    pressedOutside = false;
    if (shouldClose) closeViewer();
  });
  closeButton.addEventListener('click', closeViewer);
  viewer.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeViewer();
  });
  viewer.addEventListener('close', cleanupViewer);

  window.addEventListener('resize', () => {
    if (zoomed) resetZoom();
  });
  new MutationObserver(updateLanguage).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();
