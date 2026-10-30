import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards Tile
 * Linked navigation tiles (source: c06-content-tile / c06a-content-tile).
 * Content model: one row per tile, 2 cells:
 *   [image] | [H3 title wrapped in a link]
 * The whole tile becomes the link, with an arrow cue. A tile whose image is
 * an icon (SVG/PNG) gets a solid-colour treatment (`cards-tile-icon`) instead
 * of a full-bleed photo, so every tile uses the same authoring model.
 */

const ICON_EXT = /\.(svg|png)$/i;

/**
 * @param {HTMLImageElement} img
 * @returns {boolean}
 */
function isIconImage(img) {
  try {
    return ICON_EXT.test(new URL(img.src, window.location.href).pathname);
  } catch {
    return false;
  }
}

/**
 * Builds one tile <li> from an authored row.
 * @param {Element} row
 * @returns {HTMLLIElement|null}
 */
function buildTile(row) {
  const picture = row.querySelector('picture');
  const heading = row.querySelector('h1, h2, h3, h4, h5, h6');
  const link = row.querySelector('a[href]');

  // Title: the heading, else the link text, else any remaining text.
  let titleText = '';
  if (heading) titleText = heading.textContent.trim();
  else if (link) titleText = link.textContent.trim();
  else titleText = row.textContent.trim();

  if (!picture && !titleText) return null;

  const li = document.createElement('li');
  li.className = 'cards-tile-tile';

  let tile = li;
  if (link) {
    const a = document.createElement('a');
    a.href = link.getAttribute('href');
    if (link.title && link.title !== titleText) a.title = link.title;
    a.className = 'cards-tile-link';
    li.append(a);
    tile = a;
  }

  if (picture) {
    const img = picture.querySelector('img');
    const imageWrap = document.createElement('div');
    imageWrap.className = 'cards-tile-image';
    if (img) {
      if (isIconImage(img)) li.classList.add('cards-tile-icon');
      imageWrap.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
    } else {
      imageWrap.append(picture);
    }
    tile.append(imageWrap);
  } else {
    li.classList.add('cards-tile-no-image');
  }

  if (titleText) {
    const title = document.createElement(heading ? heading.tagName.toLowerCase() : 'h3');
    title.className = 'cards-tile-title';
    if (heading && heading.id) title.id = heading.id;
    title.textContent = titleText;
    tile.append(title);
  }

  if (link) {
    const arrow = document.createElement('span');
    arrow.className = 'cards-tile-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    tile.append(arrow);
  }

  return li;
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const tile = buildTile(row);
    if (tile) ul.append(tile);
  });
  block.replaceChildren(ul);
}
