/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: about.kaiserpermanente.org site-wide cleanup.
 * All selectors verified in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // OneTrust cookie consent overlay: <div id="onetrust-consent-sdk"> (cleaned.html line ~601)
    // AEM cloud service config stubs: <div class="cloudservice testandtarget">,
    // <div class="cloudservice google-recaptcha configpage"> (lines ~597-599)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      'div.cloudservice.testandtarget',
      'div.cloudservice.google-recaptcha.configpage',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Global chrome: <div class="header aem-GridColumn ..."> (line ~12) and
    // <div class="footer aem-GridColumn ..."> (line ~506)
    WebImporter.DOMUtils.remove(element, [
      'div.header.aem-GridColumn',
      'div.footer.aem-GridColumn',
      'iframe',
      'link',
      'noscript',
    ]);
  }
}
