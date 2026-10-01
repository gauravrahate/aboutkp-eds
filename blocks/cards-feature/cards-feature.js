import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Feature
 * Image-overlay tiles. Each authored row is one tile:
 *   [image] | [heading, paragraph, CTA link]
 * The image fills the tile as a background; the text body is overlaid at the
 * bottom, and the tile's primary link makes the whole tile clickable.
 */

/**
 * Builds one tile <li> from an authored row. Cells may be missing, in another
 * order, or have the image inside the text cell.
 * @param {Element} row
 * @returns {HTMLLIElement|null}
 */
function buildTile(row) {
  const cells = [...row.children];
  if (!cells.length) return null;

  const li = document.createElement('li');
  li.className = 'cards-feature-tile';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'cards-feature-tile-image';
  const body = document.createElement('div');
  body.className = 'cards-feature-tile-body';

  cells.forEach((cell) => {
    const pictures = [...cell.querySelectorAll('picture')];
    const isImageOnly = pictures.length > 0 && !cell.textContent.trim();
    if (isImageOnly) {
      if (!imageWrap.querySelector('picture')) imageWrap.append(pictures[0]);
      return;
    }
    // Image authored inside the text cell: move the first one to the background.
    pictures.forEach((pic) => {
      const parent = pic.parentElement;
      if (!imageWrap.querySelector('picture')) imageWrap.append(pic);
      else pic.remove();
      if (parent && parent !== cell && !parent.textContent.trim() && !parent.children.length) {
        parent.remove();
      }
    });
    while (cell.firstChild) body.append(cell.firstChild);
  });

  const picture = imageWrap.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    if (img) {
      picture.replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
    }
    li.append(imageWrap);
  } else {
    li.classList.add('cards-feature-tile-no-image');
  }

  if (body.textContent.trim() || body.children.length) li.append(body);

  // The first link in the body is the tile's primary link (stretched over the tile).
  const primary = body.querySelector('a[href]');
  if (primary) primary.classList.add('cards-feature-tile-link');

  return li.children.length ? li : null;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const tile = buildTile(row);
    if (tile) ul.append(tile);
  });
  block.replaceChildren(ul);
}
