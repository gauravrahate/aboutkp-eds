/**
 * Fetches the footer fragment: /content first (local preview), then root (DA/EDS).
 * @returns {Promise<HTMLElement|null>} container holding the footer sections
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
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
 * Moves link text next to an image into a screen-reader-only label.
 * @param {Element} section footer section
 */
function hideImageLinkText(section) {
  section.querySelectorAll('a:has(img)').forEach((link) => {
    [...link.childNodes].forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
      const label = document.createElement('span');
      label.className = 'footer-visually-hidden';
      label.textContent = node.textContent.trim();
      node.replaceWith(label);
    });
  });
}

/**
 * Groups each heading with the list that follows it into a column.
 * @param {Element} section footer link section
 */
function buildColumns(section) {
  [...section.querySelectorAll(':scope > h2, :scope > h3, :scope > h4')].forEach((heading) => {
    const column = document.createElement('div');
    column.className = 'footer-column';
    heading.before(column);
    column.append(heading);
    const list = column.nextElementSibling;
    if (list && list.tagName === 'UL') column.append(list);
  });
}

/**
 * Opens links to other sites in a new tab.
 * @param {Element} footer footer element
 */
function decorateExternalLinks(footer) {
  footer.querySelectorAll('a[href]').forEach((link) => {
    const url = new URL(link.href, window.location);
    if (url.protocol.startsWith('http') && url.origin !== window.location.origin) {
      link.target = '_blank';
      link.rel = 'noopener';
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  if (!fragment) return;

  const [brand, links, social, legal] = [...fragment.querySelectorAll(':scope > div')];
  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';

  const main = document.createElement('div');
  main.className = 'footer-main';
  if (brand) {
    brand.className = 'footer-brand';
    hideImageLinkText(brand);
    main.append(brand);
  }

  const nav = document.createElement('nav');
  nav.className = 'footer-nav';
  nav.setAttribute('aria-label', 'Footer');
  if (links) {
    links.className = 'footer-links';
    buildColumns(links);
    nav.append(links);
  }
  if (social) {
    social.className = 'footer-social';
    nav.append(social);
  }
  main.append(nav);
  footer.append(main);

  if (legal) {
    legal.className = 'footer-legal';
    footer.append(legal);
  }

  decorateExternalLinks(footer);
  block.append(footer);
}
