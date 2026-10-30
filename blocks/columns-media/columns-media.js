import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Columns Media
 * Side-by-side copy and media (source: c13-horizontal-media-with-copy).
 * Content model: 1 row, 2 cells, in either order:
 *   [H2, paragraph(s), CTA link] | [image, optionally linked]
 * The image always sits right of the copy on desktop and above it on mobile.
 */

/**
 * True when the cell holds a picture and no meaningful text.
 * A bare link (e.g. the image's link, authored as a URL) does not count as text.
 * @param {Element} cell
 * @returns {boolean}
 */
function isMediaCell(cell) {
  if (!cell.querySelector('picture')) return false;
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('picture, a').forEach((el) => el.remove());
  return !clone.textContent.trim();
}

/**
 * Optimizes the picture and wraps it in the cell's link when the link was
 * authored next to the image rather than around it.
 * @param {Element} cell
 */
function decorateMedia(cell) {
  const picture = cell.querySelector('picture');
  const img = picture.querySelector('img');
  let target = picture;
  if (img) {
    target = createOptimizedPicture(img.src, img.alt, false, [{ media: '(width >= 1024px)', width: '1200' }, { width: '750' }]);
    picture.replaceWith(target);
  }

  const link = cell.querySelector('a[href]');
  if (link && !link.contains(target)) {
    const holder = link.closest('p');
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    // Image alt names the link; otherwise use the link text unless it is just the URL.
    const linkText = link.textContent.trim();
    if (!(img && img.alt) && linkText && !/^(\/|https?:)/i.test(linkText)) {
      a.setAttribute('aria-label', linkText);
    }
    target.replaceWith(a);
    a.append(target);
    if (holder && holder !== cell && !holder.contains(a)) holder.remove();
    else link.remove();
  }

  // drop empty leftovers so the media cell is only the image
  cell.querySelectorAll('p').forEach((p) => {
    if (!p.textContent.trim() && !p.querySelector('picture')) p.remove();
  });
  cell.className = 'columns-media-media';
}

/**
 * Turns a link that is alone in its paragraph into the outlined (secondary)
 * button, unless authored formatting already made it a button.
 * @param {Element} cell
 */
function decorateCopy(cell) {
  cell.className = 'columns-media-copy';
  cell.querySelectorAll('p').forEach((p) => {
    const links = p.querySelectorAll('a[href]');
    if (links.length !== 1) return;
    const a = links[0];
    if (a.classList.contains('button') || a.querySelector('img')) return;
    if (p.textContent.trim() !== a.textContent.trim()) return;
    p.classList.add('button-wrapper');
    a.classList.add('button', 'secondary');
  });
}

export default function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    const cells = [...row.children].filter((cell) => cell.textContent.trim() || cell.querySelector('picture'));
    [...row.children].forEach((cell) => { if (!cells.includes(cell)) cell.remove(); });

    let mediaFound = false;
    cells.forEach((cell) => {
      if (!mediaFound && isMediaCell(cell)) {
        mediaFound = true;
        decorateMedia(cell);
      } else {
        decorateCopy(cell);
      }
    });

    row.classList.add('columns-media-row');
    if (!mediaFound) row.classList.add('columns-media-row-no-media');
  });
}
