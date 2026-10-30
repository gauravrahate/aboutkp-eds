/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: about.kaiserpermanente.org section breaks + Section Metadata.
 *
 * Every element matching any selector in payload.template.sections becomes its own
 * section (e.g. each .c05-column-control tile row), in document order.
 * The section style is read from the source markup, not from the template, because
 * pages sharing this template colour different components grey:
 *   expertise-and-impact: intro .bg--light-graphite, 2nd tile row .col-bg--light-graphite
 *   who-we-are:           media band .background-gray, intro bg--white
 *   news:                 intro .bg--light-graphite, featured mosaic -> feature-grid
 * Breaks are inserted in beforeTransform (before parsers replace section elements);
 * Section Metadata is inserted in afterTransform, anchored to marker <hr> elements.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-style';

// source background classes -> section style names
const STYLE_MARKERS = {
  'light-grey': '.bg--light-graphite, .col-bg--light-graphite, .background-gray',
};

// Layout styles matched on the section element itself only (never on descendants),
// checked before STYLE_MARKERS.
//   home: featured band (tiles | feature | latest news list) -> feature-grid
//   news: featured mosaic (tiles | feature | tiles)            -> feature-grid
// Verified on live pages: no column control on /expertise-and-impact or /who-we-are
// matches the news selector; home's featured band matches both (same style).
const SELF_STYLE_MARKERS = {
  'feature-grid': [
    '.c05-column-control:has(.c17-link-list)',
    '.c05-column-control:has(.c08-feature):has(.c06-content-tile, .c06a-content-tile)',
  ].join(', '),
};

function findSectionElements(root, sections) {
  const found = new Set();
  sections.forEach((section) => {
    const list = Array.isArray(section.selector) ? section.selector : [section.selector];
    list.forEach((sel) => root.querySelectorAll(sel).forEach((el) => found.add(el)));
  });
  // keep outermost elements only, in document order
  return [...found]
    .filter((el) => ![...found].some((other) => other !== el && other.contains(el)))
    .sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1));
}

function detectStyle(el) {
  const selfStyle = Object.keys(SELF_STYLE_MARKERS)
    .find((style) => el.matches(SELF_STYLE_MARKERS[style]));
  if (selfStyle) return selfStyle;
  return Object.keys(STYLE_MARKERS).find((style) => {
    const marker = STYLE_MARKERS[style];
    return el.matches(marker) || el.querySelector(marker);
  }) || null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    findSectionElements(element, sections).forEach((sectionEl, i) => {
      const style = detectStyle(sectionEl);
      if (i === 0 && !style) return;
      const hr = doc.createElement('hr');
      if (style) hr.setAttribute(SECTION_MARKER_ATTR, style);
      if (i === 0) hr.setAttribute('data-excat-first', 'true');
      sectionEl.before(hr);
    });
  }

  if (hookName === 'afterTransform') {
    element.querySelectorAll(`hr[${SECTION_MARKER_ATTR}]`).forEach((marker) => {
      const style = marker.getAttribute(SECTION_MARKER_ATTR);
      const metadataBlock = WebImporter.Blocks.createBlock(doc, {
        name: 'Section Metadata',
        cells: { style },
      });
      marker.after(metadataBlock);
      marker.removeAttribute(SECTION_MARKER_ATTR);
      if (marker.hasAttribute('data-excat-first')) marker.remove();
    });
  }
}
