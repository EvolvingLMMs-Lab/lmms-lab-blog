function copyCode(button) {
  const container = button.closest('.lov15-code-demo, .code-demo, .code-panel, .citation-block');
  const code = container?.querySelector('pre, code');
  if (!code) return;
  void navigator.clipboard.writeText(code.textContent || '').then(() => {
    const previous = button.textContent;
    button.textContent = 'Copied';
    window.setTimeout(() => { button.textContent = previous; }, 1600);
  });
}

function setupCarousel(carousel, signal) {
  const track = carousel.querySelector('.demo-carousel-track');
  const slides = Array.from(track?.querySelectorAll(':scope > .demo-slide') || []);
  if (!track || slides.length < 2) return;
  const previous = carousel.querySelector('.demo-carousel-arrow-prev');
  const next = carousel.querySelector('.demo-carousel-arrow-next');
  const dots = Array.from(carousel.querySelectorAll('.demo-carousel-dot'));
  let index = 0;

  const render = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    if (previous) previous.disabled = index === 0;
    if (next) next.disabled = index === slides.length - 1;
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
      if (dotIndex === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  previous?.addEventListener('click', () => { index = Math.max(0, index - 1); render(); }, { signal });
  next?.addEventListener('click', () => { index = Math.min(slides.length - 1, index + 1); render(); }, { signal });
  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => { index = dotIndex; render(); }, { signal });
  });
  render();
}

function setupCodeTabs(panel, signal) {
  const tabs = Array.from(panel.querySelectorAll('[role="tab"]'));
  const tabPanels = Array.from(panel.querySelectorAll('[role="tabpanel"]'));
  if (tabs.length !== tabPanels.length || tabs.length < 2) return;
  const select = (index) => {
    tabs.forEach((tab, tabIndex) => {
      const active = tabIndex === index;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', String(active));
      tabPanels[tabIndex].classList.toggle('active', active);
      tabPanels[tabIndex].hidden = !active;
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index), { signal });
  });
}

function setupBenchmarkDetails(host, signal) {
  let openButton = null;
  const close = (button) => {
    if (!button) return;
    button.classList.remove('expanded');
    button.setAttribute('aria-expanded', 'false');
    const detail = button.closest('tr')?.nextElementSibling;
    if (detail?.classList.contains('benchmark-detail-row')) detail.hidden = true;
  };
  for (const button of host.querySelectorAll('.bench-expand')) {
    button.addEventListener('click', () => {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      if (openButton && openButton !== button) close(openButton);
      close(button);
      if (opening) {
        button.classList.add('expanded');
        button.setAttribute('aria-expanded', 'true');
        const detail = button.closest('tr')?.nextElementSibling;
        if (detail?.classList.contains('benchmark-detail-row')) detail.hidden = false;
        openButton = button;
      } else {
        openButton = null;
      }
    }, { signal });
  }
}

export function mount(host) {
  const abortController = new AbortController();
  const { signal } = abortController;
  for (const button of host.querySelectorAll('button')) {
    const label = (button.textContent || '').trim().toLowerCase();
    if (label.includes('copy') || String(button.className).toLowerCase().includes('copy')) {
      button.addEventListener('click', () => copyCode(button), { signal });
    }
  }

  for (const carousel of host.querySelectorAll('.demo-carousel')) {
    setupCarousel(carousel, signal);
  }

  for (const panel of host.querySelectorAll('.code-panel')) {
    setupCodeTabs(panel, signal);
  }
  setupBenchmarkDetails(host, signal);

  const languageButton = host.querySelector('.site-navbar > button.nav-item');
  try {
    if (window.localStorage.getItem('lov2-lang') === 'zh') {
      host.classList.add('lang-zh');
      if (languageButton) languageButton.textContent = 'EN';
    }
  } catch {}
  languageButton?.addEventListener('click', () => {
    const chinese = host.classList.toggle('lang-zh');
    languageButton.textContent = chinese ? 'EN' : '中文';
    languageButton.setAttribute('aria-pressed', String(chinese));
    try { window.localStorage.setItem('lov2-lang', chinese ? 'zh' : 'en'); } catch {}
  }, { signal });

  const stars = host.querySelector('.gh-stars');
  if (stars) {
    fetch('https://api.github.com/repos/EvolvingLMMs-Lab/LLaVA-OneVision-2', {
      signal,
      headers: { Accept: 'application/vnd.github+json' },
    })
      .then((response) => response.ok ? response.json() : Promise.reject(response.status))
      .then((data) => {
        if (typeof data?.stargazers_count !== 'number') return;
        const count = data.stargazers_count.toLocaleString('en-US');
        const textNode = Array.from(stars.childNodes).find((node) => node.nodeType === Node.TEXT_NODE);
        if (textNode) textNode.textContent = count;
        stars.setAttribute('aria-label', count + ' GitHub stars');
      })
      .catch(() => {});
  }

  return () => abortController.abort();
}
