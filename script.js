const root = document.documentElement;
root.classList.add('js');

const themeButton = document.querySelector('.theme-button');
const themePreference = window.matchMedia('(prefers-color-scheme: dark)');
let savedTheme;

try {
  savedTheme = localStorage.getItem('portfolio-theme');
} catch {
  // Theme switching still works when storage is unavailable.
}

function applyTheme(theme) {
  const isDark = theme === 'dark';
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#151e18' : '#f7f8f2';
  themeButton.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
}

if (savedTheme !== 'dark' && savedTheme !== 'light') savedTheme = null;
applyTheme(savedTheme ?? (themePreference.matches ? 'dark' : 'light'));
themeButton.hidden = false;
themeButton.addEventListener('click', () => {
  savedTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(savedTheme);
  try {
    localStorage.setItem('portfolio-theme', savedTheme);
  } catch {
    // Keep the current theme for this page.
  }
});
themePreference.addEventListener('change', event => {
  if (!savedTheme) applyTheme(event.matches ? 'dark' : 'light');
});

const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
const mobileLayout = window.matchMedia('(max-width: 760px)');

function setMenu(open) {
  navigation.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

menuButton.hidden = false;
menuButton.addEventListener('click', () => setMenu(!navigation.classList.contains('is-open')));
mobileLayout.addEventListener('change', () => setMenu(false));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    setMenu(false);
    menuButton.focus();
  }
});
navigation.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (link && mobileLayout.matches) {
    setMenu(false);
    const section = document.querySelector(link.hash);
    section.setAttribute('tabindex', '-1');
    section.focus({ preventScroll: true });
  }
});

const navLinks = [...document.querySelectorAll('.nav a, .nav-connect')];
const navSections = [...new Set(navLinks.map(link => link.hash))]
  .map(hash => document.querySelector(hash)).reverse();
const header = document.querySelector('.header');
let navigationFrame = 0;

function updateNavigation() {
  navigationFrame = 0;
  const marker = header.offsetHeight + 68;
  const current = navSections.find(section => section.getBoundingClientRect().top <= marker);
  navLinks.forEach(link => {
    if (current && link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function queueNavigationUpdate() {
  if (!navigationFrame) navigationFrame = requestAnimationFrame(updateNavigation);
}

window.addEventListener('scroll', queueNavigationUpdate, { passive: true });
window.addEventListener('resize', queueNavigationUpdate);
window.addEventListener('load', queueNavigationUpdate, { once: true });
queueNavigationUpdate();

const filters = document.querySelector('.filters');
const filterButtons = [...filters.querySelectorAll('button')];
const cards = [...document.querySelectorAll('.project-card')];
const projectStatus = document.querySelector('#project-status');

function filterProjects(category) {
  filterButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  });

  let shown = 0;
  cards.forEach(card => {
    card.hidden = category !== 'all' && category !== card.dataset.category;
    if (!card.hidden) shown++;
  });
  projectStatus.textContent = shown === 1 ? 'Showing 1 project.' : 'Showing ' + shown + ' projects.';
  queueNavigationUpdate();
}

filters.hidden = false;
filters.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (button) filterProjects(button.dataset.filter);
});

function revealLinkedProject(hash) {
  const card = cards.find(project => '#' + project.id === hash);
  if (!card) return;
  if (card.hidden) filterProjects('all');
  card.querySelector('details').open = true;
}

document.querySelectorAll('a[href="#crop-yield"], a[href="#industrial-inspection"]').forEach(link => {
  link.addEventListener('click', () => revealLinkedProject(link.hash));
});
window.addEventListener('hashchange', () => revealLinkedProject(window.location.hash));
revealLinkedProject(window.location.hash);

const tabList = document.querySelector('.skill-tabs');
const tabs = [...tabList.querySelectorAll('button')];
const compactTabs = window.matchMedia('(max-width: 560px)');

function setTabOrientation() {
  tabList.setAttribute('aria-orientation', compactTabs.matches ? 'horizontal' : 'vertical');
}

function activateSkill(activeTab, moveFocus = false) {
  tabs.forEach(tab => {
    const selected = tab === activeTab;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.dataset.panel).hidden = !selected;
  });
  if (moveFocus) activeTab.focus();
}

tabList.setAttribute('role', 'tablist');
setTabOrientation();
compactTabs.addEventListener('change', setTabOrientation);

tabs.forEach(tab => {
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', tab.dataset.panel);
  const panel = document.getElementById(tab.dataset.panel);
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', tab.id);
  panel.tabIndex = 0;
  tab.addEventListener('click', () => activateSkill(tab));
});

tabList.addEventListener('keydown', event => {
  const index = tabs.indexOf(event.target);
  if (index === -1) return;
  const nextKey = compactTabs.matches ? 'ArrowRight' : 'ArrowDown';
  const previousKey = compactTabs.matches ? 'ArrowLeft' : 'ArrowUp';
  let next = index;

  if (event.key === nextKey) next = (index + 1) % tabs.length;
  else if (event.key === previousKey) next = (index - 1 + tabs.length) % tabs.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = tabs.length - 1;
  else return;

  event.preventDefault();
  activateSkill(tabs[next], true);
});

activateSkill(tabs[0]);
tabList.hidden = false;
document.querySelector('#year').textContent = new Date().getFullYear();
