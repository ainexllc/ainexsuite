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
  const isDev = process.env.NODE_ENV === "development";
  // Allow local network IPs in development
  const localDevSources = isDev
    ? " http://192.168.1.153:* http://localhost:* http://127.0.0.1:*"
    : "";

  const defaultSrc = options.defaultSrc || "'self'" + localDevSources;
  const scriptSrc =
    options.scriptSrc ||
    [
      "'self'",
      "'unsafe-inline'",
      "'unsafe-eval'",
      "https://apis.google.com",
      "https://www.gstatic.com",
      "https://accounts.google.com",
      "https://*.firebaseapp.com",
      "https://js.stripe.com",
      "https://www.googletagmanager.com",
    ].join(" ");
  const styleSrc =
    options.styleSrc ||
    "'self' 'unsafe-inline' https://accounts.google.com https://fonts.googleapis.com";
  const imgSrc =
    options.imgSrc ||
    "'self' data: https: blob: https://lh3.googleusercontent.com https://*.googleusercontent.com";
  const fontSrc = options.fontSrc || "'self' data: https://fonts.gstatic.com";
  const mediaSrc =
    options.mediaSrc ||
    "'self' data: blob: https://firebasestorage.googleapis.com https://*.firebasestorage.app https://storage.googleapis.com";
  const connectSrc =
    options.connectSrc ||
    [
      "'self'",
      ...(isDev
        ? [
            "http://192.168.1.153:*",
            "http://localhost:*",
            "http://127.0.0.1:*",
            "ws://192.168.1.153:*",
            "ws://localhost:*",
          ]
        : []),
      "https://*.googleapis.com",
      "https://*.firebaseio.com",
      "https://*.cloudfunctions.net",
      "https://*.firebaseapp.com",
      "https://firebasestorage.googleapis.com",
      "https://identitytoolkit.googleapis.com",
      "https://securetoken.googleapis.com",
      "https://www.googleapis.com",
      "https://accounts.google.com",
      "https://api.openai.com",
      "https://api.anthropic.com",
      "https://generativelanguage.googleapis.com",
      "https://api.resend.com",
      "https://api.stripe.com",
      "https://api.cloudinary.com",
      "https://queue.fal.run",
      "https://fal.run",
      "wss://*.firebaseio.com",
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://analytics.google.com",
    ].join(" ");
  const frameSrc =
    options.frameSrc ||
    "'self' https://*.firebaseapp.com https://js.stripe.com https://accounts.google.com";
  const frameAncestors = options.frameAncestors || "'none'";
  const objectSrc = options.objectSrc || "'none'";
  const baseUri = options.baseUri || "'self'";
  const formAction = options.formAction || "'self'";
  const workerSrc = options.workerSrc || "'self' blob:"; // For canvas-confetti and other workers

  return [
    `default-src ${defaultSrc}`,
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src ${imgSrc}`,
    `font-src ${fontSrc}`,
    `media-src ${mediaSrc}`,
    `connect-src ${connectSrc}`,
    `frame-src ${frameSrc}`,
    `frame-ancestors ${frameAncestors}`,
    `object-src ${objectSrc}`,
    `base-uri ${baseUri}`,
    `form-action ${formAction}`,
    `worker-src ${workerSrc}`,
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
  const isDev = process.env.NODE_ENV === "development";

  // CORS headers for local network development
  const corsHeaders = isDev
    ? [
        {
          key: "Access-Control-Allow-Origin",
          value: "*",
        },
        {
          key: "Access-Control-Allow-Methods",
          value: "GET, POST, PUT, DELETE, OPTIONS",
        },
        {
          key: "Access-Control-Allow-Headers",
          value: "Content-Type, Authorization",
        },
      ]
    : [];

  const headers = [
    ...corsHeaders,
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
