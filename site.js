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
    button.textContent = chinese ? '[English]' : '[中文]';
    button.setAttribute('aria-label', chinese ? 'Switch to English' : '切换到中文');
    document.title = chinese ? '钟祚栋 | 北京大学' : 'Zuodong Zhong | Peking University';
    try { localStorage.setItem('homepage-language', language); } catch { /* The site also works without browser storage. */ }
  }

  button.hidden = false;
  button.addEventListener('click', () => setLanguage(document.documentElement.lang === 'en' ? 'zh' : 'en'));
  try {
    if (localStorage.getItem('homepage-language') === 'zh') setLanguage('zh');
  } catch { /* Keep the default English page when storage is unavailable. */ }
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
