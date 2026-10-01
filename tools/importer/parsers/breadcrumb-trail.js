/* eslint-disable */
/* global WebImporter */
/**
 * Parser for breadcrumb-trail. Base: breadcrumb (custom, no library convention).
 * Source: https://about.kaiserpermanente.org/expertise-and-impact
 * Generated: 2026-10-01
 *
 * Content model: 1 column, one row per crumb. Ancestor crumbs are links;
 * the last row (current page) is plain text.
 *
 * Source structure (validated against source.html):
 *   .c03-breadcrumb.breadcrumb > ... > ol.cmp-breadcrumb__list > li.cmp-breadcrumb__item
 *     ancestors: li > a.cmp-breadcrumb__item-link > span
 *     current:   li.cmp-breadcrumb__item--active > span
 * Iteration is keyed on <li> (block-level, iterationSafe per structure.json),
 * never on the anchors.
 */
export default function parse(element, { document }) {
  let items = [...element.querySelectorAll('li.cmp-breadcrumb__item')];
  if (!items.length) {
    // Fallback: any list items inside the breadcrumb nav/list
    items = [...element.querySelectorAll('ol > li, ul > li')];
  }

  const cells = [];
  items.forEach((li, i) => {
    const text = li.textContent.replace(/\s+/g, ' ').trim();
    if (!text) return;
    const link = li.querySelector('a[href]');
    const isCurrent = li.classList.contains('cmp-breadcrumb__item--active') || i === items.length - 1;

    if (link && !isCurrent) {
      // Build a clean anchor (drops wrapper <span> and stray <meta>)
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.replace(/\s+/g, ' ').trim() || text;
      cells.push([a]);
    } else {
      cells.push([text]);
    }
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumb-trail', cells });
  element.replaceWith(block);
}
