/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-feature. Base: cards.
 * Source: https://about.kaiserpermanente.org/expertise-and-impact
 * Generated: 2026-10-01
 *
 * Content model (cards convention): 2 columns, one row per card:
 *   [image] | [H2 title, description paragraph(s), CTA link]
 *
 * Source structure (validated against source.html + instances/01.html):
 *   .c05-column-control > ... > .cell > ... > .c08-feature > .c08-feature > .c08-feature__wrap
 *     > .c08-feature__template-container
 *         .c08-feature__background-wrap > img
 *         h2.c08-feature__headline
 *         .c08-feature__content-wrap .c08-feature__text > p
 *         .c08-feature__content-wrap a.c08-feature__link.button     (CTA - kept)
 *         a.c08-feature__link--absolute                            (overlay duplicate - ignored)
 * Iteration is keyed on the block-level .c08-feature__template-container
 * (one per tile; .c08-feature itself is nested twice, so it is not used).
 */
export default function parse(element, { document }) {
  let tiles = [...element.querySelectorAll('.c08-feature__template-container')];
  if (!tiles.length) {
    // Fallback: one wrap per tile
    tiles = [...element.querySelectorAll('.c08-feature__wrap')];
  }

  const cells = [];
  tiles.forEach((tile) => {
    // Image: <img> in the scraped/cleaned DOM; on the live page the tile image is an
    // inline background-image on .c08-feature__background-wrap (alt from aria-label).
    let img = tile.querySelector('.c08-feature__background-wrap img') || tile.querySelector('img');
    if (!img) {
      const bgEl = tile.querySelector('.c08-feature__background-wrap[style*="background-image"]')
        || tile.querySelector('[style*="background-image"]');
      const match = bgEl && (bgEl.getAttribute('style') || '').match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
      if (match) {
        img = document.createElement('img');
        img.src = match[1];
        const alt = bgEl.getAttribute('aria-label');
        if (alt) img.alt = alt;
      }
    }
    const heading = tile.querySelector('.c08-feature__headline') || tile.querySelector('h1, h2, h3, h4');
    const textWrap = tile.querySelector('.c08-feature__text');
    const paragraphs = textWrap
      ? [...textWrap.querySelectorAll('p')]
      : [...tile.querySelectorAll('.c08-feature__content-wrap p')];
    // Visible CTA only; the absolute overlay link is a duplicate
    const cta = tile.querySelector('a.c08-feature__link.button')
      || tile.querySelector('a.c08-feature__link:not(.c08-feature__link--absolute)');

    const textCell = [];
    if (heading) {
      const h2 = document.createElement('h2');
      h2.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
      textCell.push(h2);
    }
    if (paragraphs.length) {
      textCell.push(...paragraphs);
    } else if (textWrap && textWrap.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = textWrap.textContent.trim();
      textCell.push(p);
    }
    if (cta) {
      const a = document.createElement('a');
      a.href = cta.getAttribute('href');
      a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
      const p = document.createElement('p');
      p.append(a);
      textCell.push(p);
    }

    if (!img && !textCell.length) return;
    cells.push([img || '', textCell.length ? textCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
