(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  const savedTheme = (() => { try { return localStorage.getItem('portfolio-theme'); } catch { return null; } })();
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : (prefersDark ? 'dark' : 'light');
  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    themeButton?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    try { localStorage.setItem('portfolio-theme', theme); } catch {}
  }
  setTheme(initialTheme);
  themeButton?.addEventListener('click', () => setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'));
  function closeMenu() {
    if (!mobileNav || !menuButton) return;
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  }
  menuButton?.addEventListener('click', () => {
    const willOpen = mobileNav.hidden;
    mobileNav.hidden = !willOpen;
    menuButton.setAttribute('aria-expanded', String(willOpen));
    menuButton.setAttribute('aria-label', willOpen ? 'Close navigation' : 'Open navigation');
  });
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.querySelector('#year').textContent = String(new Date().getFullYear());
})();