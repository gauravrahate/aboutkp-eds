# breadcrumb-trail

Custom **breadcrumb** block. Purpose: breadcrumb navigation.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: Single column list of crumbs: one row per crumb, each a link, followed by a final plain-text row for the current page..

## Styling notes

The block draws its own 70px band (list padding 20px/18px around a 32px line box) and
hides itself below 640px, as the source does. The section around it must not add
padding, so `styles/styles.css` needs:

```css
main > .section.breadcrumb-trail-container {
  padding: 0;
}
```

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)
