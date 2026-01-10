/**
 * Shared security headers configuration for all AINexSuite apps
 *
 * These headers improve security posture and help with:
 * - Preventing XSS attacks (CSP)
 * - Preventing clickjacking (X-Frame-Options)
 * - Preventing MIME sniffing (X-Content-Type-Options)
 * - Controlling referrer information (Referrer-Policy)
 * - Disabling unused browser features (Permissions-Policy)
 * - Supporting Firebase Auth popups (Cross-Origin-Opener-Policy)
 */

/**
 * Build Content Security Policy header value
 * @param {Object} options - Optional CSP customizations
 * @returns {string} CSP header value
 */
function buildCSP(options = {}) {
  const defaultSrc = options.defaultSrc || "'self'";
  const scriptSrc = options.scriptSrc || "'self' 'unsafe-inline' 'unsafe-eval'";
  const styleSrc = options.styleSrc || "'self' 'unsafe-inline'";
  const imgSrc = options.imgSrc || "'self' data: https: blob:";
  const fontSrc = options.fontSrc || "'self' data:";
  const connectSrc =
    options.connectSrc ||
    [
      "'self'",
      "https://*.googleapis.com",
      "https://*.firebaseio.com",
      "https://*.cloudfunctions.net",
      "https://*.firebaseapp.com",
      "https://firebasestorage.googleapis.com",
      "https://identitytoolkit.googleapis.com",
      "https://securetoken.googleapis.com",
      "https://www.googleapis.com",
      "https://api.openai.com",
      "https://api.anthropic.com",
      "https://generativelanguage.googleapis.com",
      "https://api.resend.com",
      "https://api.stripe.com",
      "https://api.cloudinary.com",
      "https://queue.fal.run",
      "https://fal.run",
      "wss://*.firebaseio.com",
    ].join(" ");
  const frameSrc =
    options.frameSrc ||
    "'self' https://*.firebaseapp.com https://js.stripe.com";
  const frameAncestors = options.frameAncestors || "'none'";
  const objectSrc = options.objectSrc || "'none'";
  const baseUri = options.baseUri || "'self'";
  const formAction = options.formAction || "'self'";

  return [
    `default-src ${defaultSrc}`,
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src ${imgSrc}`,
    `font-src ${fontSrc}`,
    `connect-src ${connectSrc}`,
    `frame-src ${frameSrc}`,
    `frame-ancestors ${frameAncestors}`,
    `object-src ${objectSrc}`,
    `base-uri ${baseUri}`,
    `form-action ${formAction}`,
  ].join("; ");
}

/**
 * Get security headers for Next.js config
 * @param {Object} options - Optional customizations
 * @param {Object} options.csp - CSP customizations
 * @param {boolean} options.allowFraming - Set to true to allow framing (default: false)
 * @returns {Array} Headers configuration for Next.js
 */
function getSecurityHeaders(options = {}) {
  const headers = [
    // Prevent clickjacking
    {
      key: "X-Frame-Options",
      value: options.allowFraming ? "SAMEORIGIN" : "DENY",
    },
    // Prevent MIME type sniffing
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    // Control referrer information
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    // Required for Firebase Auth popups to work
    {
      key: "Cross-Origin-Opener-Policy",
      value: "same-origin-allow-popups",
    },
    // Disable unused browser features
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    // Content Security Policy
    {
      key: "Content-Security-Policy",
      value: buildCSP(options.csp || {}),
    },
  ];

  return [
    {
      source: "/:path*",
      headers,
    },
  ];
}

module.exports = {
  getSecurityHeaders,
  buildCSP,
};
