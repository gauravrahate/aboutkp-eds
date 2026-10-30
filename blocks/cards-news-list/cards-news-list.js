/**
 * Cards News List
 * Text-only vertical list of latest news items.
 * Content model: one row per item, one cell:
 *   [date paragraph + H3 title wrapped in a link]
 * Each item renders as: date eyebrow, title, right-arrow cue; the whole item
 * is the link when a link is authored. Decorative inline images/SVG icons
 * (e.g. a media-type marker) are dropped. Extra cells are tolerated.
 */

/**
 * Builds one news item <li> from an authored row.
 * @param {Element} row
 * @returns {HTMLLIElement|null}
 */
function buildItem(row) {
  const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
  const link = row.querySelector('a[href]');

  // Title: heading text, else link text.
  let titleText = '';
  if (heading) titleText = heading.textContent.trim();
  else if (link) titleText = link.textContent.trim();

  // Date: first paragraph with text that is not the title/link itself.
  const dateEl = [...row.querySelectorAll('p')].find((p) => {
    const text = p.textContent.trim();
    if (!text) return false;
    if (heading && (p.contains(heading) || heading.contains(p))) return false;
    if (link && p.contains(link) && link.textContent.trim() === text) return false;
    return text !== titleText;
  });
  const dateText = dateEl ? dateEl.textContent.trim() : '';

  if (!titleText && !dateText) return null;

  const li = document.createElement('li');
  li.className = 'cards-news-list-item';

  let item = li;
  if (link) {
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    if (link.title && link.title !== titleText) a.title = link.title;
    a.className = 'cards-news-list-link';
    li.append(a);
    item = a;
  }

  if (dateText) {
    const date = document.createElement('p');
    date.className = 'cards-news-list-date';
    date.textContent = dateText;
    item.append(date);
  }

  if (titleText) {
    const title = document.createElement(heading ? heading.tagName.toLowerCase() : 'h3');
    title.className = 'cards-news-list-title';
    if (heading && heading.id) title.id = heading.id;
    title.textContent = titleText;
    item.append(title);
  }

  if (link) {
    const arrow = document.createElement('span');
    arrow.className = 'cards-news-list-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    item.append(arrow);
  }

  return li;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const item = buildItem(row);
    if (item) ul.append(item);
  });
  block.replaceChildren(ul);
}
