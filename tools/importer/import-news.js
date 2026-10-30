/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import breadcrumbTrailParser from './parsers/breadcrumb-trail.js';
import cardsArticleGridParser from './parsers/cards-article-grid.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsTileParser from './parsers/cards-tile.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/aboutkp-cleanup.js';
import sectionsTransformer from './transformers/aboutkp-sections.js';

// PARSER REGISTRY
const parsers = {
  'breadcrumb-trail': breadcrumbTrailParser,
  'cards-article-grid': cardsArticleGridParser,
  'cards-feature': cardsFeatureParser,
  'cards-tile': cardsTileParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "news",
  "description": "News landing page: breadcrumb, grey intro (H1 + lead), featured mosaic band (tiles | photo feature | tiles), then the latest-news article grid (latest 12 articles)",
  "urls": [
    "https://about.kaiserpermanente.org/news"
  ],
  "blocks": [
    {
      "name": "breadcrumb-trail",
      "instances": [
        ".c03-breadcrumb.breadcrumb"
      ]
    },
    {
      "name": "cards-tile",
      "instances": [
        ".c05-column-control:has(.c08-feature):has(.c06-content-tile, .c06a-content-tile) .cell:has(.c06-content-tile, .c06a-content-tile):not(:has(.cell))"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        ".c08-feature.query-base"
      ]
    },
    {
      "name": "cards-article-grid",
      "instances": [
        ".c04-filtered-card-grid"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Breadcrumb",
      "selector": [
        ".c03-breadcrumb.breadcrumb"
      ],
      "style": null,
      "blocks": [
        "breadcrumb-trail"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Page intro",
      "selector": [
        ".c14-page-hero"
      ],
      "style": "light-grey",
      "blocks": [],
      "defaultContent": [
        ".c14-page-hero__headline",
        ".c14-page-hero__text"
      ]
    },
    {
      "id": "section-3",
      "name": "Featured news mosaic (tiles + feature + tiles)",
      "selector": [
        ".c05-column-control:has(.c08-feature):has(.c06-content-tile, .c06a-content-tile)"
      ],
      "style": "feature-grid",
      "blocks": [
        "cards-tile",
        "cards-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "section-4",
      "name": "Latest news listing (article grid)",
      "selector": [
        ".c05-column-control:has(.c04-filtered-card-grid)"
      ],
      "style": null,
      "blocks": [
        "cards-article-grid"
      ],
      "defaultContent": [
        ".c07-text h2"
      ]
    }
  ]
};

// TRANSFORMER REGISTRY - cleanup runs first, sections after
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Initial cleanup + section breaks
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (root maps to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
