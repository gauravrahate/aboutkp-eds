# Migration Plan: Kaiser Permanente "Expertise and Impact" Page

> **Status: not started. Plan mode is still on.**
> You've asked me to run this twice, but asking in chat can't switch modes. While plan mode is on I can only read and plan; I can't create files, run the import or change code. To start, **switch the mode selector from Plan to Execute** and send any message, for example "go". I'll then start at step 1 and work through the checklist without stopping, pausing only if I need a decision from you.

## Overview
I'll move the single page **https://about.kaiserpermanente.org/expertise-and-impact** to Edge Delivery Services. The project uses Document Authoring. It already has these starter blocks: hero, cards, columns, header, footer, fragment and widget. Wherever the page's layout matches one of them, I'll reuse it. I'll only build new blocks or variants for patterns those blocks don't cover.

**Target page path:** `/expertise-and-impact`

## Scope
- **In scope:** the main body content of the page, plus its metadata (title, description, social image), images, block code and styling that matches the original site.
- **Out of scope unless you ask:** the global header/navigation and footer, which need their own migration. Uploading or publishing to Document Authoring, and committing or opening a PR, also wait until you approve them.

## Approach

### 1. Page analysis
- Scrape the page, capture screenshots, pull out metadata and download the images.
- Find the section boundaries and the content inside each section. A landing page like this probably has a hero banner, feature or story cards, column layouts, stats or callouts, and promo or CTA bands.
- Decide which parts become default content (headings, text, lists) and which become blocks.
- Name the block variants, such as `hero-expertise` or `cards-stories`.

### 2. Block mapping
- Compare each variant with the existing blocks and the Block Collection, and reuse a block wherever it matches closely enough.
- Record the DOM selector for each block variant in the page template.

### 3. Import infrastructure
- Write a parser for each block variant.
- Write page transformers for cleanup, section breaks, section metadata and image handling.
- Bundle all of this into the import script.

### 4. Block generation
- Create or extend the block code (JS and CSS) for any variant the current blocks don't cover.
- Write the code defensively, since authors may add or leave out cells, and scope all CSS to the block's own class.

### 5. Content import
- Run the bulk import for the single URL to produce the page's HTML content and images.
- Check that the content renders in the local preview.

### 6. Design migration
- Pull the design tokens from the source site (fonts, colors, spacing) into the global styles.
- Style each block to match the original, checking each one visually.

### 7. Validation
- Compare the original page with the migrated one, full page, on desktop and mobile.
- Fix any differences in content, layout or styling.

## Checklist
- [ ] Confirm the project type (Document Authoring) and the block library source
- [ ] Analyze the page: scrape, take screenshots, extract metadata, download images
- [ ] Identify sections and content sequences, and choose default content vs. blocks
- [ ] Name block variants and match them against existing blocks (hero, cards, columns, widget)
- [ ] Add block mappings (DOM selectors) to the page template
- [ ] Generate import parsers for each block variant
- [ ] Generate page transformers (cleanup, sections, images)
- [ ] Build and bundle the import script
- [ ] Generate or extend block code for any new variants
- [ ] Run the content import for `/expertise-and-impact`
- [ ] Check the rendered page in the local preview (blocks decorate, images load, no 404s)
- [ ] Migrate global design tokens (fonts, colors, spacing)
- [ ] Style each block to match the original site
- [ ] Run a full-page visual comparison on desktop and mobile, and fix differences
- [ ] Summarize the results and list optional next steps: header/footer migration, upload to Document Authoring, and a PR with a `{branch}--aboutkp-eds--gauravrahate.aem.page/expertise-and-impact` preview link

## Risks
- **Bot protection on the source site:** scraping may need a fallback method if the site blocks automated access.
- **Dynamic content:** carousels, tabs or lazy-loaded parts may need special handling in the parsers and blocks.
- **Header and footer:** until they're migrated separately, the page will show the template's default header and footer.

## Execution
**Switch the mode selector to Execute, then send a message, and the migration starts right away.** Asking in chat can't change the mode for you.
