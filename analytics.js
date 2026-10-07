(() => {
  const storageKey = 'homepage-analytics-excluded';
  const excludedByLink = new URLSearchParams(window.location.search).getAll('analytics').includes('off');

  // Process the bookmark before any decision to load the analytics beacon.
  if (excludedByLink) {
    try { localStorage.setItem(storageKey, '1'); } catch { /* This visit still remains excluded. */ }
  }

  function exclusionState() {
    try { return localStorage.getItem(storageKey) === '1'; } catch { return null; }
  }

  if (document.body.hasAttribute('data-analytics-settings')) {
    const status = document.querySelector('#analytics-status');
    const home = document.querySelector('#analytics-home');
    const exclude = document.querySelector('#analytics-exclude');
    const restore = document.querySelector('#analytics-restore');

    function showState(message) {
      const excluded = exclusionState();
      status.dataset.state = excluded === null ? 'unavailable' : excluded ? 'excluded' : 'included';
      status.textContent = message || (excluded === null
        ? '无法读取此浏览器的网站存储。为避免误计，本次不会加载统计；建议使用下方带排除参数的首页链接。'
        : excluded
          ? '已排除此浏览器的访问。以后访问首页时会跳过统计。'
          : '此浏览器尚未设置排除。访问首页时会按照网站配置参与统计。');
      home.href = excluded === false ? './' : './?analytics=off';
    }

    exclude.addEventListener('click', () => {
      try {
        localStorage.setItem(storageKey, '1');
        if (localStorage.getItem(storageKey) !== '1') throw new Error('Exclusion was not saved.');
        showState('已保存并确认：此浏览器的访问已排除。请关闭已打开的首页标签，再用下方链接打开首页。');
      } catch {
        showState('未能确认排除设置已保存。请使用带 ?analytics=off 的首页链接，每次通过该链接访问都会跳过统计。');
        home.href = './?analytics=off';
      }
    });

    restore.addEventListener('click', () => {
      try {
        localStorage.removeItem(storageKey);
        if (localStorage.getItem(storageKey) !== null) throw new Error('Exclusion was not removed.');
        showState('已清除并确认：此浏览器已恢复参与统计。请关闭旧的首页标签，并使用不带 ?analytics=off 的首页链接；旧的排除书签会再次开启排除。');
      } catch {
        showState('未能确认排除设置已清除，恢复统计未成功。请允许此网站使用浏览器存储后重试。');
      }
    });

    window.addEventListener('storage', (event) => {
      if (event.key === storageKey || event.key === null) showState();
    });
    exclude.disabled = false;
    restore.disabled = false;
    showState();
    return; // The settings page never loads analytics.
  }

  if (excludedByLink || exclusionState() !== false) return;
  if (window.location.protocol !== 'https:' || window.location.hostname !== 'zuodong-zhong.github.io') return;

  const token = document.querySelector('meta[name="cloudflare-web-analytics-token"]')?.content.trim();
  if (!/^[a-f0-9]{32}$/i.test(token || '')) return;

  const beacon = document.createElement('script');
  beacon.type = 'module';
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.setAttribute('data-cf-beacon', JSON.stringify({ token }));
  document.head.appendChild(beacon);
})();
