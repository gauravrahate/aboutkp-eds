// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 1024px)');

const REGION_STORAGE_KEY = 'header-region';

/**
 * Fetches the nav fragment: /content first (local preview), then root (DA/EDS).
 * @returns {Promise<HTMLElement|null>} container holding the nav sections
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  const container = document.createElement('div');
  container.innerHTML = await resp.text();
  // resolve relative media against the fragment, not the current page
  const resolve = (value) => (/^(https?:|data:|\/)/.test(value) ? value : new URL(value, resp.url).href);
  container.querySelectorAll('img[src]').forEach((img) => {
    img.setAttribute('src', resolve(img.getAttribute('src')));
  });
  container.querySelectorAll('source[srcset]').forEach((source) => {
    const srcset = source.getAttribute('srcset').split(',').map((entry) => {
      const [url, ...descriptor] = entry.trim().split(/\s+/);
      return [resolve(url), ...descriptor].join(' ');
    });
    source.setAttribute('srcset', srcset.join(', '));
  });
  return container;
}

/**
 * Closes every open dropdown inside a container.
 * @param {Element} container element holding dropdown items
 * @param {Element} [except] item to leave open
 */
function closeDropdowns(container, except = null) {
  container.querySelectorAll('.is-open').forEach((item) => {
    if (item === except) return;
    item.classList.remove('is-open', 'align-right');
    item.querySelector(':scope > [aria-expanded]')?.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Opens a dropdown item and keeps its panel inside the viewport.
 * @param {Element} item list item that owns the panel
 */
function openDropdown(item) {
  item.classList.add('is-open');
  item.querySelector(':scope > [aria-expanded]')?.setAttribute('aria-expanded', 'true');
  const panel = item.querySelector(':scope > ul');
  if (panel && isDesktop.matches) {
    item.classList.remove('align-right');
    if (panel.getBoundingClientRect().right > document.documentElement.clientWidth) {
      item.classList.add('align-right');
    }
  }
}

/**
 * Decorates the brand section: skip link and screen-reader-only logo label.
 * @param {Element} section nav brand section
 */
function decorateBrand(section) {
  section.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.closest('p')?.classList.add('nav-skip');
    link.addEventListener('click', (e) => {
      const main = document.querySelector('main');
      if (!main) return;
      e.preventDefault();
      main.setAttribute('tabindex', '-1');
      main.focus();
    });
  });
  section.querySelectorAll('a:has(img)').forEach((link) => {
    const images = link.querySelectorAll('img');
    if (images.length > 1) {
      images[0].classList.add('nav-logo-desktop');
      images[1].classList.add('nav-logo-mobile');
    }
    [...link.childNodes].forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
      const label = document.createElement('span');
      label.className = 'nav-visually-hidden';
      label.textContent = node.textContent.trim();
      node.replaceWith(label);
    });
  });
}

/**
 * Turns a list item holding a label and a nested list into a click-to-open selector.
 * The chosen entry becomes the trigger label and is remembered across pages.
 * @param {Element} item list item with a <p> label and a nested <ul>
 */
function buildSelector(item) {
  const label = item.querySelector(':scope > p');
  const list = item.querySelector(':scope > ul');
  item.classList.add('nav-selector');

  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-haspopup', 'true');
  button.setAttribute('aria-expanded', 'false');
  const text = document.createElement('span');
  text.textContent = localStorage.getItem(REGION_STORAGE_KEY) || label.textContent.trim();
  button.append(text);
  label.replaceWith(button);

  const markCurrent = () => {
    list.querySelectorAll('a').forEach((a) => {
      if (a.textContent.trim() === text.textContent) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };
  markCurrent();

  button.addEventListener('click', () => {
    const open = item.classList.contains('is-open');
    closeDropdowns(item.closest('nav'));
    if (!open) openDropdown(item);
  });

  list.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (a.getAttribute('href') !== '#') return;
      e.preventDefault();
      text.textContent = a.textContent.trim();
      localStorage.setItem(REGION_STORAGE_KEY, text.textContent);
      markCurrent();
      closeDropdowns(item.closest('nav'));
      button.focus();
    });
  });
}

/**
 * Replaces a search link with a search form that submits to the link's URL.
 * @param {Element} item list item holding the search link
 * @param {HTMLAnchorElement} link the search link
 */
function buildSearch(item, link) {
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.action = link.getAttribute('href');

  const id = 'nav-search-input';
  const label = document.createElement('label');
  label.htmlFor = id;
  label.className = 'nav-visually-hidden';
  label.textContent = link.textContent.trim();

  const input = document.createElement('input');
  input.type = 'search';
  input.id = id;
  input.name = 'q';
  input.placeholder = link.textContent.trim();
  input.required = true;
  input.autocomplete = 'off';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-visually-hidden';
  submit.textContent = `Submit ${link.textContent.trim()}`;

  form.append(label, input, submit);
  item.classList.add('nav-search-item');
  link.replaceWith(form);
}

/**
 * Decorates the utility list: selectors, search, plain links.
 * @param {Element} section nav tools section
 */
function decorateTools(section) {
  section.querySelectorAll(':scope > ul > li').forEach((item) => {
    if (item.querySelector(':scope > p') && item.querySelector(':scope > ul')) {
      buildSelector(item);
      return;
    }
    const link = item.querySelector(':scope > a');
    if (link && /\/search\/?$/.test(new URL(link.href, window.location).pathname)) {
      buildSearch(item, link);
    }
  });
}

/**
 * On mobile the accordion repeats the trigger link as the first panel entry;
 * on desktop the trigger itself is the landing link, so the copy is removed.
 * @param {Element} item nav dropdown item
 */
function syncOverviewLink(item) {
  const panel = item.querySelector(':scope > ul');
  const link = item.querySelector(':scope > a');
  const overview = panel.querySelector(':scope > .nav-dropdown-overview');
  if (isDesktop.matches) {
    overview?.remove();
  } else if (!overview && link) {
    const li = document.createElement('li');
    li.className = 'nav-dropdown-overview';
    const copy = link.cloneNode(true);
    copy.removeAttribute('aria-haspopup');
    li.append(copy);
    panel.prepend(li);
  }
}

/**
 * Decorates the main nav: items with nested lists open on hover (desktop)
 * and expand as an accordion when tapped (mobile).
 * @param {Element} section nav sections section
 */
function decorateSections(section) {
  section.querySelectorAll(':scope > ul > li').forEach((item) => {
    const panel = item.querySelector(':scope > ul');
    if (!panel) return;
    item.classList.add('nav-drop');
    panel.classList.add('nav-dropdown');
    const link = item.querySelector(':scope > a');
    if (link) {
      link.setAttribute('aria-haspopup', 'true');
      link.addEventListener('click', (e) => {
        if (isDesktop.matches) return;
        e.preventDefault();
        item.querySelector(':scope > .nav-drop-toggle').click();
      });
    }
    syncOverviewLink(item);

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-drop-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', `Show ${link ? link.textContent.trim() : ''} links`);
    panel.before(toggle);
    toggle.addEventListener('click', () => {
      const open = item.classList.contains('is-open');
      closeDropdowns(section);
      if (!open) openDropdown(item);
    });

    item.addEventListener('mouseenter', () => {
      if (!isDesktop.matches) return;
      closeDropdowns(item.closest('nav'), item);
      openDropdown(item);
    });
    item.addEventListener('mouseleave', () => {
      if (isDesktop.matches) closeDropdowns(section);
    });
    item.addEventListener('focusin', () => {
      if (isDesktop.matches && !item.classList.contains('is-open')) {
        closeDropdowns(item.closest('nav'), item);
        openDropdown(item);
      }
    });
  });
}

/**
 * Keeps DOM order equal to visual order: on mobile the search form sits at the
 * top of the drawer, on desktop it returns to the end of the utility line.
 * @param {Element} nav the nav element
 */
function placeSearch(nav) {
  const form = nav.querySelector('.nav-search');
  const slot = nav.querySelector('.nav-search-slot');
  const item = nav.querySelector('.nav-search-item');
  if (!form || !slot || !item) return;
  if (isDesktop.matches) item.append(form);
  else slot.append(form);
}

/**
 * Opens or closes the mobile menu.
 * @param {Element} nav the nav element
 * @param {boolean} [force] explicit open state
 */
function toggleMenu(nav, force) {
  const open = force ?? nav.getAttribute('aria-expanded') !== 'true';
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  const button = nav.querySelector('.nav-hamburger button');
  button.setAttribute('aria-expanded', open ? 'true' : 'false');
  button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.style.overflowY = open && !isDesktop.matches ? 'hidden' : '';
  if (!open) closeDropdowns(nav);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  if (!fragment) return;

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  const sections = [...fragment.querySelectorAll(':scope > div')];
  ['brand', 'tools', 'sections'].forEach((name, i) => {
    if (sections[i]) {
      sections[i].className = `nav-${name}`;
      nav.append(sections[i]);
    }
  });

  const brand = nav.querySelector('.nav-brand');
  if (brand) decorateBrand(brand);
  const tools = nav.querySelector('.nav-tools');
  if (tools) decorateTools(tools);
  const navSections = nav.querySelector('.nav-sections');
  if (navSections) decorateSections(navSections);

  // mobile drawer holding the menu (search, main nav, utility); layout-neutral on desktop
  const drawer = document.createElement('div');
  drawer.className = 'nav-drawer';
  drawer.id = 'nav-drawer';
  const searchSlot = document.createElement('div');
  searchSlot.className = 'nav-search-slot';
  [searchSlot, navSections, tools].forEach((el) => { if (el) drawer.append(el); });
  nav.append(drawer);
  placeSearch(nav);

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav-drawer" aria-expanded="false" aria-label="Open navigation">
      <span class="nav-hamburger-icon"><span></span><span></span><span></span></span>
    </button>`;
  hamburger.querySelector('button').addEventListener('click', () => toggleMenu(nav));
  nav.querySelector('.nav-brand')?.after(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  // close dropdowns on outside click and Escape
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) closeDropdowns(nav);
  });
  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    const open = nav.querySelector('.is-open');
    if (open) {
      closeDropdowns(nav);
      open.querySelector(':scope > button, :scope > a')?.focus();
    } else if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      hamburger.querySelector('button').focus();
    }
  });
  nav.addEventListener('focusout', (e) => {
    if (!nav.contains(e.relatedTarget)) closeDropdowns(nav);
  });

  // reset state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    closeDropdowns(nav);
    toggleMenu(nav, false);
    nav.querySelectorAll('.nav-drop').forEach(syncOverviewLink);
    placeSearch(nav);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
