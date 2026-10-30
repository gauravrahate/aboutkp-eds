/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-news-list. Base: cards (no images).
 * Source: https://about.kaiserpermanente.org/
 * Generated: 2026-10-28
 *
 * Content model (blocks/cards-news-list, Cards (no images)): 1 column, one row per item:
 *   [date paragraph + H3 title wrapped in a link to the article href]
 *
 * Source structure (validated against source.html):
 *   .c17-link-list__container-lists
 *     .c17-link-list__list
 *       a.c17-link-list__link[href]
 *         span.border                      (decorative, ignored)
 *         span.c17-link-list__eyebrow      (date)
 *         h3.c17-link-list__title          (title; may contain a decorative video-play svg/img)
 * The hidden h5.c17-link-list__headline and the "View all news" link
 * (.c17-link-list__link-wrapper) live outside the instance; any h5 headline
 * found inside is ignored defensively.
 */
export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('a.c17-link-list__link[href]')];

  const cells = [];
  items.forEach((item) => {
    const dateEl = item.querySelector('.c17-link-list__eyebrow');
    const dateText = dateEl ? dateEl.textContent.replace(/\s+/g, ' ').trim() : '';

    const titleEl = item.querySelector('.c17-link-list__title')
      || item.querySelector('h1, h2, h3, h4, h6');
    let titleText = '';
    if (titleEl) {
      // Drop decorative inline media (video-play svg/img) before reading text
      const clone = titleEl.cloneNode(true);
      clone.querySelectorAll('svg, img, picture').forEach((n) => n.remove());
      titleText = clone.textContent.replace(/\s+/g, ' ').trim();
    }

    const contentCell = [];
    if (dateText) {
      const p = document.createElement('p');
      p.textContent = dateText;
      contentCell.push(p);
    }
    if (titleText) {
      const h3 = document.createElement('h3');
      const a = document.createElement('a');
      a.href = item.getAttribute('href');
      a.textContent = titleText;
      h3.append(a);
      contentCell.push(h3);
    }

    if (!contentCell.length) return;
    cells.push([contentCell]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-news-list', cells });
  element.replaceWith(block);
}
