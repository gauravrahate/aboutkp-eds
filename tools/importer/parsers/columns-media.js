/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media. Base: columns.
 * Source: https://about.kaiserpermanente.org/who-we-are
 * Generated: 2026-10-01
 *
 * Content model (blocks/columns-media): 1 row, 2 cells, output in visual order:
 *   [text: H2, paragraph(s), CTA link] | [media: image, wrapped in its link when present]
 *
 * Source structure (validated against source.html):
 *   .c13-horizontal-media-with-copy ... .c13-horizontal-media-with-copy__template-container
 *       (medium-flex-dir-row-reverse: media is first in DOM, rendered on the right)
 *     .c13-horizontal-media-with-copy__media-wrapper > a[href] > .c13-horizontal-media-with-copy__bg-image > img
 *     .c13-horizontal-media-with-copy__content
 *       h2.c13-horizontal-media-with-copy__headline
 *       .c13-horizontal-media-with-copy__text > p
 *       .c13-horizontal-media-with-copy__link > a.button
 * On the live page the image may be an inline / lazy-loaded background-image
 * on __bg-image instead of an <img>.
 */
const P = 'c13-horizontal-media-with-copy';

function bgUrl(el) {
  if (!el) return null;
  const style = el.getAttribute('style') || '';
  const m = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
  if (m) return m[1];
  return el.getAttribute('data-background-image') || el.getAttribute('data-bg') || null;
}

export default function parse(element, { document }) {
  const mediaWrap = element.querySelector(`.${P}__media-wrapper`);
  const content = element.querySelector(`.${P}__content`) || element;

  // ---- media cell ----
  let img = mediaWrap ? mediaWrap.querySelector('img') : null;
  if (!img) {
    const bgEl = (mediaWrap && (mediaWrap.querySelector(`.${P}__bg-image`)
      || mediaWrap.querySelector('[style*="background-image"], [data-background-image]')))
      || element.querySelector(`.${P}__bg-image`);
    const src = bgUrl(bgEl) || bgUrl(mediaWrap);
    if (src) {
      img = document.createElement('img');
      img.src = src;
      const alt = bgEl && (bgEl.getAttribute('aria-label') || bgEl.getAttribute('title'));
      if (alt) img.alt = alt;
    }
  }
  const mediaLink = mediaWrap ? mediaWrap.querySelector('a[href]') : null;
  let mediaCell = '';
  if (img) {
    if (mediaLink) {
      const a = document.createElement('a');
      a.href = mediaLink.getAttribute('href');
      a.append(img);
      mediaCell = a;
    } else {
      mediaCell = img;
    }
  }

  // ---- text cell ----
  const textCell = [];
  const heading = content.querySelector(`.${P}__headline`) || content.querySelector('h1, h2, h3, h4');
  if (heading) {
    const h2 = document.createElement('h2');
    h2.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    textCell.push(h2);
  }
  const textWrap = content.querySelector(`.${P}__text`);
  if (textWrap) {
    const paras = [...textWrap.querySelectorAll('p')];
    if (paras.length) textCell.push(...paras);
    else if (textWrap.textContent.trim()) {
      const p = document.createElement('p');
      p.textContent = textWrap.textContent.trim();
      textCell.push(p);
    }
  }
  const ctas = [...content.querySelectorAll(`.${P}__link a[href]`)];
  if (!ctas.length) {
    const fallback = content.querySelector('a.button[href]');
    if (fallback) ctas.push(fallback);
  }
  ctas.forEach((cta) => {
    const a = document.createElement('a');
    a.href = cta.getAttribute('href');
    a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
    const p = document.createElement('p');
    p.append(a);
    textCell.push(p);
  });

  if (!textCell.length && !mediaCell) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [[textCell.length ? textCell : '', mediaCell]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
