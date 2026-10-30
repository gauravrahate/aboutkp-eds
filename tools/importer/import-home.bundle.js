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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/cards-feature.js
  function parse(element, { document }) {
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
          img = document.createElement("img");
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
        const h2 = document.createElement("h2");
        h2.textContent = heading.textContent.replace(/\s+/g, " ").trim();
        textCell.push(h2);
      }
      if (paragraphs.length) {
        textCell.push(...paragraphs);
      } else if (textWrap && textWrap.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = textWrap.textContent.trim();
        textCell.push(p);
      }
      if (cta) {
        const a = document.createElement("a");
        a.href = cta.getAttribute("href");
        a.textContent = cta.textContent.replace(/\s+/g, " ").trim();
        const p = document.createElement("p");
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
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-news-list.js
  function parse2(element, { document }) {
    const items = [...element.querySelectorAll("a.c17-link-list__link[href]")];
    const cells = [];
    items.forEach((item) => {
      const dateEl = item.querySelector(".c17-link-list__eyebrow");
      const dateText = dateEl ? dateEl.textContent.replace(/\s+/g, " ").trim() : "";
      const titleEl = item.querySelector(".c17-link-list__title") || item.querySelector("h1, h2, h3, h4, h6");
      let titleText = "";
      if (titleEl) {
        const clone = titleEl.cloneNode(true);
        clone.querySelectorAll("svg, img, picture").forEach((n) => n.remove());
        titleText = clone.textContent.replace(/\s+/g, " ").trim();
      }
      const contentCell = [];
      if (dateText) {
        const p = document.createElement("p");
        p.textContent = dateText;
        contentCell.push(p);
      }
      if (titleText) {
        const h3 = document.createElement("h3");
        const a = document.createElement("a");
        a.href = item.getAttribute("href");
        a.textContent = titleText;
        h3.append(a);
        contentCell.push(h3);
      }
      if (!contentCell.length) return;
      cells.push([contentCell]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-news-list", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-tile.js
  function bgUrl(el) {
    if (!el) return null;
    const style = el.getAttribute("style") || "";
    const m = style.match(/background-image\s*:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/i);
    if (m) return m[1];
    return el.getAttribute("data-background-image") || el.getAttribute("data-bg") || null;
  }
  function parse3(element, { document }) {
    let tiles = [...element.querySelectorAll(".c06-content-tile__tile, .c06a-content-tile__tile")];
    if (!tiles.length) {
      tiles = [...element.querySelectorAll("a.c06-content-tile__link, a.c06a-content-tile__link")];
    }
    const cells = [];
    tiles.forEach((tile) => {
      const link = tile.closest("a[href]") || tile.querySelector("a[href]");
      const bgEl = tile.querySelector(".c06-content-tile__bg-image, .c06a-content-tile__bg-image");
      let img = bgEl && bgEl.querySelector("img") || tile.querySelector("img");
      if (!img) {
        const src = bgUrl(bgEl) || bgUrl(tile.querySelector('[style*="background-image"], [data-background-image]'));
        if (src) {
          img = document.createElement("img");
          img.src = src;
        }
      }
      if (img && !img.getAttribute("alt") && bgEl && bgEl.getAttribute("aria-label")) {
        img.alt = bgEl.getAttribute("aria-label");
      }
      if (img && /\.svg$/i.test(img.getAttribute("src") || "")) {
        img.setAttribute("src", `${img.getAttribute("src")}?format=svg`);
      }
      const headline = tile.querySelector(".c06-content-tile__headline, .c06a-content-tile__headline") || tile.querySelector("h1, h2, h3, h4, h5, h6");
      const titleText = headline ? headline.textContent.replace(/\s+/g, " ").trim() : "";
      const contentCell = [];
      if (titleText) {
        const h3 = document.createElement("h3");
        if (link) {
          const a = document.createElement("a");
          a.href = link.getAttribute("href");
          a.textContent = titleText;
          h3.append(a);
        } else {
          h3.textContent = titleText;
        }
        contentCell.push(h3);
      }
      if (!img && !contentCell.length) return;
      cells.push([img || "", contentCell.length ? contentCell : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-tile", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/aboutkp-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "div.cloudservice.testandtarget",
        "div.cloudservice.google-recaptcha.configpage",
        // Alert popup container: <div class="c38-alert-popup aem-GridColumn ..."> (home, line ~336)
        "div.c38-alert-popup",
        // Latest-news list heading, display:none on the source:
        // <h5 class="c17-link-list__headline">News and information</h5> (home)
        "h5.c17-link-list__headline"
      ]);
      element.querySelectorAll("div.shared-embed, div.c24-html-embed").forEach((embed) => {
        if (!embed.textContent.trim() && !embed.querySelector("img, picture, video, iframe, a, table")) {
          embed.remove();
        }
      });
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
  var SECTION_MARKER_ATTR = "data-excat-section-style";
  var STYLE_MARKERS = {
    "light-grey": ".bg--light-graphite, .col-bg--light-graphite, .background-gray"
  };
  var SELF_STYLE_MARKERS = {
    "feature-grid": [
      ".c05-column-control:has(.c17-link-list)",
      ".c05-column-control:has(.c08-feature):has(.c06-content-tile, .c06a-content-tile)"
    ].join(", ")
  };
  function findSectionElements(root, sections) {
    const found = /* @__PURE__ */ new Set();
    sections.forEach((section) => {
      const list = Array.isArray(section.selector) ? section.selector : [section.selector];
      list.forEach((sel) => root.querySelectorAll(sel).forEach((el) => found.add(el)));
    });
    return [...found].filter((el) => ![...found].some((other) => other !== el && other.contains(el))).sort((a, b) => a.compareDocumentPosition(b) & 4 ? -1 : 1);
  }
  function detectStyle(el) {
    const selfStyle = Object.keys(SELF_STYLE_MARKERS).find((style) => el.matches(SELF_STYLE_MARKERS[style]));
    if (selfStyle) return selfStyle;
    return Object.keys(STYLE_MARKERS).find((style) => {
      const marker = STYLE_MARKERS[style];
      return el.matches(marker) || el.querySelector(marker);
    }) || null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    const doc = element.ownerDocument;
    if (hookName === "beforeTransform") {
      findSectionElements(element, sections).forEach((sectionEl, i) => {
        const style = detectStyle(sectionEl);
        if (i === 0 && !style) return;
        const hr = doc.createElement("hr");
        if (style) hr.setAttribute(SECTION_MARKER_ATTR, style);
        if (i === 0) hr.setAttribute("data-excat-first", "true");
        sectionEl.before(hr);
      });
    }
    if (hookName === "afterTransform") {
      element.querySelectorAll(`hr[${SECTION_MARKER_ATTR}]`).forEach((marker) => {
        const style = marker.getAttribute(SECTION_MARKER_ATTR);
        const metadataBlock = WebImporter.Blocks.createBlock(doc, {
          name: "Section Metadata",
          cells: { style }
        });
        marker.after(metadataBlock);
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (marker.hasAttribute("data-excat-first")) marker.remove();
      });
    }
  }

  // tools/importer/import-home.js
  var parsers = {
    "cards-feature": parse,
    "cards-news-list": parse2,
    "cards-tile": parse3
  };
  var PAGE_TEMPLATE = {
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_home_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
