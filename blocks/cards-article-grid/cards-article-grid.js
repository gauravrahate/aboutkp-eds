import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Article Grid
 * Static 3-up wrapping grid of article cards (source: /news listing).
 * Content model: one row per article, 2 cells:
 *   [image] | [date paragraph, H3 title wrapped in a link, excerpt paragraph]
 * Each card renders as: image on top, date eyebrow, title, excerpt; the whole
 * card is the link when a link is authored. Only authored rows are rendered:
 * no filters, no "Show more" / infinite scroll. Missing image, date or
 * excerpt are tolerated; decorative inline SVG icons in the title are dropped.
 */

/**
 * Returns an optimized picture for same-origin, non-SVG images; otherwise the
 * authored picture (absolute source URLs and SVGs are kept as authored).
 * @param {HTMLPictureElement} picture
 * @returns {Element}
 */
function buildPicture(picture) {
  const img = picture.querySelector('img');
  if (!img) return picture;
  let url;
  try {
    url = new URL(img.src, window.location.href);
  } catch {
    return picture;
  }
  if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return picture;
  return createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
}

/**
 * Builds one article card <li> from an authored row.
 * @param {Element} row
 * @returns {HTMLLIElement|null}
 */
function buildCard(row) {
  const picture = [...row.querySelectorAll('picture')]
    .find((p) => !/\.svg(\?|$)/i.test(p.querySelector('img')?.getAttribute('src') || ''));
  const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
  const link = row.querySelector('a[href]');

  // Title: heading text, else link text.
  let titleText = '';
  if (heading) titleText = heading.textContent.trim();
  else if (link) titleText = link.textContent.trim();

  // Text paragraphs that are not the title/link itself: first = date, rest = excerpt.
  const paragraphs = [...row.querySelectorAll('p')].filter((p) => {
    const text = p.textContent.trim();
    if (!text) return false;
    if (heading && (p.contains(heading) || heading.contains(p))) return false;
    if (link && p.contains(link) && link.textContent.trim() === text) return false;
    return text !== titleText;
  });

  // A lone paragraph is treated as the date only when it looks like one.
  let dateText = '';
  let excerptParas = paragraphs;
  if (paragraphs.length > 1 || (paragraphs.length === 1 && /\d{4}/.test(paragraphs[0].textContent)
    && paragraphs[0].textContent.trim().length < 40)) {
    dateText = paragraphs[0].textContent.trim();
    excerptParas = paragraphs.slice(1);
  }
  const excerptText = excerptParas.map((p) => p.textContent.trim()).join(' ');

  if (!picture && !titleText && !dateText && !excerptText) return null;

  const li = document.createElement('li');
  li.className = 'cards-article-grid-card';

  let card = li;
  if (link) {
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    if (link.title && link.title !== titleText) a.title = link.title;
    a.className = 'cards-article-grid-link';
    li.append(a);
    card = a;
  }

  if (picture) {
    const imageWrap = document.createElement('div');
    imageWrap.className = 'cards-article-grid-image';
    imageWrap.append(buildPicture(picture));
    card.append(imageWrap);
  } else {
    li.classList.add('cards-article-grid-no-image');
  }

  const body = document.createElement('div');
  body.className = 'cards-article-grid-body';

  if (dateText) {
    const date = document.createElement('p');
    date.className = 'cards-article-grid-date';
    date.textContent = dateText;
    body.append(date);
  }

  if (titleText) {
    const title = document.createElement(heading ? heading.tagName.toLowerCase() : 'h3');
    title.className = 'cards-article-grid-title';
    if (heading && heading.id) title.id = heading.id;
    title.textContent = titleText;
    body.append(title);
  }

  if (excerptText) {
    const excerpt = document.createElement('p');
    excerpt.className = 'cards-article-grid-excerpt';
    excerpt.textContent = excerptText;
    body.append(excerpt);
  }

  if (body.children.length) card.append(body);

  return li;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const card = buildCard(row);
    if (card) ul.append(card);
  });
  block.replaceChildren(ul);
}
