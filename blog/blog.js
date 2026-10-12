(() => {
  const posts = [...document.querySelectorAll('[data-post]')];
  const search = document.querySelector('#blog-search');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const empty = document.querySelector('.blog-empty');
  const count = document.querySelector('[data-visible-count]');
  if (!search || !empty || !count) return;

  // Keep both languages searchable even after the shared language switch runs.
  const searchableText = posts.map((post) => [
    post.textContent, post.dataset.search,
    ...[...post.querySelectorAll('[data-zh]')].flatMap((element) => [element.dataset.zh, element.dataset.en]),
  ].join(' ').normalize('NFKC').toLowerCase());
  const params = new URLSearchParams(window.location.search);
  const requestedFilter = params.get('collection') || params.get('tag');
  let activeFilter = filters.some((button) => button.dataset.filter === requestedFilter) ? requestedFilter : 'all';

  function update() {
    const words = search.value.normalize('NFKC').trim().toLowerCase().split(/\s+/).filter(Boolean);
    let visible = 0;
    posts.forEach((post, index) => {
      const matchesFilter = activeFilter === 'all' || post.dataset.collection === activeFilter || (post.dataset.tags || '').split(/\s+/).includes(activeFilter);
      const matchesSearch = words.every((word) => searchableText[index].includes(word));
      post.hidden = !(matchesFilter && matchesSearch);
      if (!post.hidden) visible += 1;
    });
    count.textContent = visible;
    empty.hidden = visible !== 0;
    document.querySelector('.posts-end').hidden = visible === 0;
    filters.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter)));
  }

  filters.forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter === activeFilter ? 'all' : button.dataset.filter;
    update();
  }));
  search.addEventListener('input', update);
  document.querySelector('[data-reset]').addEventListener('click', () => {
    activeFilter = 'all';
    search.value = '';
    update();
    search.focus();
  });

  function updateLanguage() {
    const chinese = document.documentElement.lang.startsWith('zh');
    search.placeholder = chinese ? '搜索文章…' : 'Search posts…';
    document.querySelector('.blog-filters').setAttribute('aria-label', chinese ? '专栏筛选' : 'Collections');
    document.querySelector('.tag-filters').setAttribute('aria-label', chinese ? '标签筛选' : 'Tags');
    document.querySelectorAll('.post-tags').forEach((element) => element.setAttribute('aria-label', chinese ? '标签' : 'Tags'));
  }
  new MutationObserver(updateLanguage).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  document.querySelector('[data-total-count]').textContent = posts.length;
  document.querySelectorAll('[data-blog-controls]').forEach((element) => { element.hidden = false; });
  updateLanguage();
  update();
})();
