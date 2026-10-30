/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article-grid. Base: cards.
 * Source: https://about.kaiserpermanente.org/news
 * Generated: 2026-10-28
 *
 * Content model (blocks/cards-article-grid, Cards): 2 columns, one row per article:
 *   [image] | [date paragraph, H3 title wrapped in a link, excerpt paragraph]
 *
 * Source structure (validated against source.html):
 *   .c04-filtered-card-grid
 *     ... filter sidebar / "Filters" toggle / Show-more loader (dropped)
 *     .filtered-card-grid__item  (repeating; some hidden via display:none by filters)
 *       a.filtered-card-grid__item__wrapper[href]
 *         .filtered-card-grid__image > img        (relative /content/dam/... src)
 *         .filtered-card-grid__content
 *           .filtered-card-grid__eyebrow           (date)
 *           .filtered-card-grid__title             (title; may contain decorative svg/img)
 *           .filtered-card-grid__copy              (excerpt; contains &nbsp;)
 * Project-owner decision: only the latest 12 articles a visitor sees are imported;
 * the remainder of the listing is ignored. With no filter selected the source grid
 * shows only national articles (data-alltags contains kp:mykp/source/national);
 * regional-only items are hidden, so they are skipped. Falls back to source order
 * when no item carries tags.
 */
const MAX_ITEMS = 12;
const DEFAULT_VIEW_TAG = 'kp:mykp/source/national';

function isInDefaultView(item) {
  const tags = (item.getAttribute('data-alltags') || '').split('|');
  return tags.includes(DEFAULT_VIEW_TAG);
}

function cleanText(el) {
  if (!el) return '';
  // Drop decorative inline media (video-play svg/img) before reading text
  const clone = el.cloneNode(true);
  clone.querySelectorAll('svg, img, picture').forEach((n) => n.remove());
  return clone.textContent.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}

export default function parse(element, { document }) {
  const allItems = [...element.querySelectorAll('.filtered-card-grid__item')];
  const defaultView = allItems.filter(isInDefaultView);
  const items = (defaultView.length ? defaultView : allItems).slice(0, MAX_ITEMS);

  const cells = [];
  items.forEach((item) => {
    const link = item.querySelector('a.filtered-card-grid__item__wrapper[href]')
      || item.querySelector('a[href]');
    const href = link ? link.getAttribute('href') : '';

    // Image: prefer lazy data-src when present, otherwise keep src as-is
    let img = null;
    const srcImg = item.querySelector('.filtered-card-grid__image img');
    if (srcImg) {
      const src = srcImg.getAttribute('data-src') || srcImg.getAttribute('src');
      if (src) {
        img = document.createElement('img');
        img.src = src;
        const alt = srcImg.getAttribute('alt');
        if (alt) img.alt = alt.trim();
      }
    }

    const dateText = cleanText(item.querySelector('.filtered-card-grid__eyebrow'));
    const titleText = cleanText(item.querySelector('.filtered-card-grid__title'));
    const copyText = cleanText(item.querySelector('.filtered-card-grid__copy'));

    if (!titleText && !img) return;

    const contentCell = [];
    if (dateText) {
      const p = document.createElement('p');
      p.textContent = dateText;
      contentCell.push(p);
    }
    if (titleText) {
      const h3 = document.createElement('h3');
      if (href) {
        const a = document.createElement('a');
        a.href = href;
        a.textContent = titleText;
        h3.append(a);
      } else {
        h3.textContent = titleText;
      }
      contentCell.push(h3);
    }
    if (copyText) {
      const p = document.createElement('p');
      p.textContent = copyText;
      contentCell.push(p);
    }

    cells.push([img || '', contentCell.length ? contentCell : '']);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article-grid', cells });
  element.replaceWith(block);
}
