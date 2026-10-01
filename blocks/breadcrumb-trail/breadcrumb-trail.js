/**
 * Breadcrumb Trail
 * Authored as one row per crumb. Each crumb row holds a link, except the
 * last row, which is plain text for the current page.
 * Decorated into <nav aria-label="Breadcrumb"><ol><li>…</li></ol></nav>.
 */

/**
 * Extracts crumbs from an authored row. A row normally holds one crumb, but
 * authors sometimes paste several links into one cell, so each link becomes
 * its own crumb. Text with no link becomes a plain-text crumb.
 * @param {Element} row
 * @returns {{ href: string|null, text: string }[]}
 */
function crumbsFromRow(row) {
  const links = [...row.querySelectorAll('a[href]')];
  if (links.length) {
    return links
      .map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim() }))
      .filter((c) => c.text);
  }
  const text = row.textContent.trim();
  return text ? [{ href: null, text }] : [];
}

export default function decorate(block) {
  const crumbs = [...block.children].flatMap(crumbsFromRow);

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');
  ol.className = 'breadcrumb-trail-list';

  crumbs.forEach((crumb, i) => {
    const li = document.createElement('li');
    li.className = 'breadcrumb-trail-item';
    const isLast = i === crumbs.length - 1;

    if (isLast) {
      // The current page is always rendered as plain text, even if linked.
      const span = document.createElement('span');
      span.textContent = crumb.text;
      li.append(span);
      li.classList.add('breadcrumb-trail-item-current');
      li.setAttribute('aria-current', 'page');
    } else if (crumb.href) {
      const a = document.createElement('a');
      a.href = crumb.href;
      a.textContent = crumb.text;
      li.append(a);
    } else {
      const span = document.createElement('span');
      span.textContent = crumb.text;
      li.append(span);
    }
    ol.append(li);
  });

  nav.append(ol);
  block.replaceChildren(nav);
}
