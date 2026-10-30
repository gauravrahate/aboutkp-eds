/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import breadcrumbTrailParser from './parsers/breadcrumb-trail.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import cardsTileParser from './parsers/cards-tile.js';
import columnsMediaParser from './parsers/columns-media.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/aboutkp-cleanup.js';
import sectionsTransformer from './transformers/aboutkp-sections.js';

// PARSER REGISTRY
const parsers = {
  'breadcrumb-trail': breadcrumbTrailParser,
  'cards-feature': cardsFeatureParser,
  'cards-tile': cardsTileParser,
  'columns-media': columnsMediaParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  'name': 'expertise-and-impact',
  'description': 'Section landing page: breadcrumb, intro (H1 + lead), then rows of feature tiles, content tiles and media-with-copy bands; section backgrounds come from the source markup',
  'urls': [
    'https://about.kaiserpermanente.org/expertise-and-impact',
    'https://about.kaiserpermanente.org/who-we-are'
  ],
  'blocks': [
    {
      'name': 'breadcrumb-trail',
      'instances': [
        '.c03-breadcrumb.breadcrumb'
      ]
    },
    {
      'name': 'cards-feature',
      'instances': [
        '.c05-column-control:has(.c08-feature)'
      ]
    },
    {
      'name': 'cards-tile',
      'instances': [
        '.c05-column-control:has(.c06-content-tile, .c06a-content-tile)'
      ]
    },
    {
      'name': 'columns-media',
      'instances': [
        '.c13-horizontal-media-with-copy'
      ]
    }
  ],
  'sections': [
    {
      'id': 'section-breadcrumb',
      'name': 'Breadcrumb',
      'selector': [
        '.c03-breadcrumb.breadcrumb'
      ],
      'style': null,
      'blocks': [
        'breadcrumb-trail'
      ],
      'defaultContent': []
    },
    {
      'id': 'section-intro',
      'name': 'Page intro',
      'selector': [
        '.c14-page-hero'
      ],
      'style': 'light-grey',
      'blocks': [],
      'defaultContent': [
        '.c14-page-hero__headline',
        '.c14-page-hero__text'
      ]
    },
    {
      'id': 'section-media',
      'name': 'Media with copy band (every instance is a section)',
      'selector': [
        '.c13-horizontal-media-with-copy'
      ],
      'style': 'light-grey',
      'blocks': [
        'columns-media'
      ],
      'defaultContent': []
    },
    {
      'id': 'section-tiles',
      'name': 'Tile rows (every instance is a section)',
      'selector': [
        '.c05-column-control'
      ],
      'style': 'light-grey',
      'blocks': [
        'cards-feature',
        'cards-tile'
      ],
      'defaultContent': []
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
