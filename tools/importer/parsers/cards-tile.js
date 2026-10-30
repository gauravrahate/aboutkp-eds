/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-tile. Base: cards.
 * Source: https://about.kaiserpermanente.org/who-we-are
 * Generated: 2026-10-01
 *
 * Content model (blocks/cards-tile): 2 columns, one row per tile:
 *   [image] | [H3 title wrapped in a link to the tile href]
 *
 * Source structure (validated against source.html + live page):
 *   .c05-column-control > ... > .cell > ... > (.c06-content-tile | .c06a-content-tile)
 *     a.c06-content-tile__link[href] | a.c06a-content-tile__link[href]
 *       .c06-content-tile__tile | .c06a-content-tile__tile
 *         .c06(a)-content-tile__bg-image  (img in cleaned DOM; on the live page a lozad
 *                                          data-background-image / inline background-image,
 *                                          alt from aria-label)
 *         h3.c06(a)-content-tile__headline
 * Iteration is keyed on the block-level __tile wrapper inside each anchor (not the
 * anchor itself, and not .c06-content-tile, which is nested twice); the href is
 * read from the enclosing anchor.
 */
function bgUrl(el) {
  if (!el) return null;
  const style = el.getAttribute('style') || '';
  const m = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
  if (m) return m[1];
  return el.getAttribute('data-background-image') || el.getAttribute('data-bg') || null;
}

export default function parse(element, { document }) {
  let tiles = [...element.querySelectorAll('.c06-content-tile__tile, .c06a-content-tile__tile')];
  if (!tiles.length) {
    // Fallback: the anchors themselves
    tiles = [...element.querySelectorAll('a.c06-content-tile__link, a.c06a-content-tile__link')];
  }

  const cells = [];
  tiles.forEach((tile) => {
    const link = tile.closest('a[href]') || tile.querySelector('a[href]');
    const bgEl = tile.querySelector('.c06-content-tile__bg-image, .c06a-content-tile__bg-image');

    // Image: <img> first, else background-image (inline style or lozad data attribute)
    let img = (bgEl && bgEl.querySelector('img')) || tile.querySelector('img');
    if (!img) {
      const src = bgUrl(bgEl)
        || bgUrl(tile.querySelector('[style*="background-image"], [data-background-image]'));
      if (src) {
        img = document.createElement('img');
        img.src = src;
      }
    }
    if (img && !img.getAttribute('alt') && bgEl && bgEl.getAttribute('aria-label')) {
      img.alt = bgEl.getAttribute('aria-label');
    }
    // html2md's convertIcons turns any <img> whose src ends with ".svg" into ":name:"
    // icon syntax, which would drop icon tiles (e.g. "Fast facts"). Keep it a real image;
    // the cards-tile block detects icons from the URL pathname, so the query is harmless.
    if (img && /\.svg$/i.test(img.getAttribute('src') || '')) {
      img.setAttribute('src', `${img.getAttribute('src')}?format=svg`);
    }

    const headline = tile.querySelector('.c06-content-tile__headline, .c06a-content-tile__headline')
      || tile.querySelector('h1, h2, h3, h4, h5, h6');
    const titleText = headline ? headline.textContent.replace(/\s+/g, ' ').trim() : '';

    const contentCell = [];
    if (titleText) {
      const h3 = document.createElement('h3');
      if (link) {
        const a = document.createElement('a');
        a.href = link.getAttribute('href');
        a.textContent = titleText;
        h3.append(a);
      } else {
        h3.textContent = titleText;
      }
      contentCell.push(h3);
    }

    if (!img && !contentCell.length) return;
    cells.push([img || '', contentCell.length ? contentCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-tile', cells });
  element.replaceWith(block);
}
