/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsNewsListParser from './parsers/cards-news-list.js';
import cardsTileParser from './parsers/cards-tile.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/aboutkp-cleanup.js';
import sectionsTransformer from './transformers/aboutkp-sections.js';

// PARSER REGISTRY
const parsers = {
  'cards-feature': cardsFeatureParser,
  'cards-news-list': cardsNewsListParser,
  'cards-tile': cardsTileParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "home",
  "description": "Homepage: featured grid band (stacked tiles | photo feature | latest news list + View all news), then a 3-up explore tiles band",
  "urls": [
    "https://about.kaiserpermanente.org/"
  ],
  "blocks": [
    {
      "name": "cards-tile",
      "instances": [
        ".c05-column-control:has(.c17-link-list) .cell:has(.c06-content-tile, .c06a-content-tile)",
        ".c05-column-control:not(:has(.c17-link-list, .c08-feature)):has(.c06-content-tile, .c06a-content-tile)"
      ]
    },
    {
      "name": "cards-feature",
      "instances": [
        ".c08-feature.query-base"
      ]
    },
    {
      "name": "cards-news-list",
      "instances": [
        ".c17-link-list__container-lists"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "Featured news grid (tiles + feature + latest news)",
      "selector": [
        ".c05-column-control:has(.c17-link-list)",
        ".responsivegrid > .aem-Grid > .c05-column-control:nth-of-type(1)"
      ],
      "style": "feature-grid",
      "blocks": [
        "cards-tile",
        "cards-feature",
        "cards-news-list"
      ],
      "defaultContent": [
        ".c17-link-list__link-wrapper"
      ]
    },
    {
      "id": "section-2",
      "name": "Explore tiles (3-up)",
      "selector": [
        ".c05-column-control:not(:has(.c17-link-list, .c08-feature)):has(.c06-content-tile, .c06a-content-tile)",
        ".responsivegrid > .aem-Grid > .c05-column-control:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [
        "cards-tile"
      ],
      "defaultContent": []
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
