/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-expertise-and-impact.js
  var import_expertise_and_impact_exports = {};
  __export(import_expertise_and_impact_exports, {
    default: () => import_expertise_and_impact_default
  });

  // tools/importer/parsers/breadcrumb-trail.js
  function parse(element, { document: document2 }) {
    let items = [...element.querySelectorAll("li.cmp-breadcrumb__item")];
    if (!items.length) {
      items = [...element.querySelectorAll("ol > li, ul > li")];
    }
    const cells = [];
    items.forEach((li, i) => {
      const text = li.textContent.replace(/\s+/g, " ").trim();
      if (!text) return;
      const link = li.querySelector("a[href]");
      const isCurrent = li.classList.contains("cmp-breadcrumb__item--active") || i === items.length - 1;
      if (link && !isCurrent) {
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = link.textContent.replace(/\s+/g, " ").trim() || text;
        cells.push([a]);
      } else {
        cells.push([text]);
      }
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "breadcrumb-trail", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-feature.js
  function parse2(element, { document: document2 }) {
    let tiles = [...element.querySelectorAll(".c08-feature__template-container")];
    if (!tiles.length) {
      tiles = [...element.querySelectorAll(".c08-feature__wrap")];
    }
    const cells = [];
    tiles.forEach((tile) => {
      let img = tile.querySelector(".c08-feature__background-wrap img") || tile.querySelector("img");
      if (!img) {
        const bgEl = tile.querySelector('.c08-feature__background-wrap[style*="background-image"]') || tile.querySelector('[style*="background-image"]');
        const match = bgEl && (bgEl.getAttribute("style") || "").match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
        if (match) {
          img = document2.createElement("img");
          img.src = match[1];
          const alt = bgEl.getAttribute("aria-label");
          if (alt) img.alt = alt;
        }
      }
      const heading = tile.querySelector(".c08-feature__headline") || tile.querySelector("h1, h2, h3, h4");
      const textWrap = tile.querySelector(".c08-feature__text");
      const paragraphs = textWrap ? [...textWrap.querySelectorAll("p")] : [...tile.querySelectorAll(".c08-feature__content-wrap p")];
      const cta = tile.querySelector("a.c08-feature__link.button") || tile.querySelector("a.c08-feature__link:not(.c08-feature__link--absolute)");
      const textCell = [];
      if (heading) {
        const h2 = document2.createElement("h2");
        h2.textContent = heading.textContent.replace(/\s+/g, " ").trim();
        textCell.push(h2);
      }
      if (paragraphs.length) {
        textCell.push(...paragraphs);
      } else if (textWrap && textWrap.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = textWrap.textContent.trim();
        textCell.push(p);
      }
      if (cta) {
        const a = document2.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = cta.textContent.replace(/\s+/g, " ").trim();
        const p = document2.createElement("p");
        p.append(a);
        textCell.push(p);
      }
      if (!img && !textCell.length) return;
      cells.push([img || "", textCell.length ? textCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/aboutkp-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "div.cloudservice.testandtarget",
        "div.cloudservice.google-recaptcha.configpage"
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "div.header.aem-GridColumn",
        "div.footer.aem-GridColumn",
        "iframe",
        "link",
        "noscript"
      ]);
    }
  }

  // tools/importer/transformers/aboutkp-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-expertise-and-impact.js
  var parsers = {
    "breadcrumb-trail": parse,
    "cards-feature": parse2
  };
  var PAGE_TEMPLATE = {
    name: "expertise-and-impact",
    description: "Section landing page: breadcrumb, light-grey intro (H1 + lead), and rows of image-overlay feature tiles",
    urls: [
      "https://about.kaiserpermanente.org/expertise-and-impact"
    ],
    blocks: [
      {
        name: "breadcrumb-trail",
        instances: [".c03-breadcrumb.breadcrumb"]
      },
      {
        name: "cards-feature",
        instances: [".c05-column-control"]
      }
    ],
    sections: [
      {
        id: "section-1",
        name: "Breadcrumb",
        selector: [".c03-breadcrumb.breadcrumb"],
        style: null,
        blocks: ["breadcrumb-trail"],
        defaultContent: []
      },
      {
        id: "section-2",
        name: "Page intro",
        selector: [".c14-page-hero"],
        style: "light-grey",
        blocks: [],
        defaultContent: [".c14-page-hero__headline", ".c14-page-hero__text"]
      },
      {
        id: "section-3",
        name: "Feature tiles row 1",
        selector: [".c05-column-control:nth-of-type(1)"],
        style: null,
        blocks: ["cards-feature"],
        defaultContent: []
      },
      {
        id: "section-4",
        name: "Feature tiles row 2",
        selector: [".c05-column-control:nth-of-type(2)"],
        style: "light-grey",
        blocks: ["cards-feature"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_expertise_and_impact_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_expertise_and_impact_exports);
})();
