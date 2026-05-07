import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createCSRFCookie } from "@/utils/csrf";

/**
 * Generate a nonce for CSP script-src
 * This provides better security than 'unsafe-inline' while maintaining Next.js compatibility
 */
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString("base64");
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Dashboard access control: only admin dashboard is allowed.
  // Redirect /student or any other dashboard path to /admin.
  const path = url.pathname;
  if (path.startsWith('/student') || path.startsWith('/teacher') || path.startsWith('/parent') || path.startsWith('/staff')) {
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  const nonce = generateNonce();

  // Set CSRF cookie if not present
  const csrfCookie = request.cookies.get("__csrf_token");
  if (!csrfCookie) {
    const { name, value, options } = createCSRFCookie();
    response.cookies.set(name, value, options);
  }

  // Security headers for all routes
  const securityHeaders = {
    // DNS prefetch for performance
    "X-DNS-Prefetch-Control": "on",

    // HSTS - enforce HTTPS for 2 years
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // Clickjacking protection
    "X-Frame-Options": "SAMEORIGIN",

    // XSS filter (legacy browsers)
    "X-XSS-Protection": "1; mode=block",

    // Referrer policy - send origin only for cross-origin requests
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Disable dangerous browser features
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",

    // Prevent cross-origin isolation issues
    "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    "Cross-Origin-Resource-Policy": "same-origin",

    // Prevent embedding in other sites
    "X-Permitted-Cross-Domain-Policies": "none",
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Content Security Policy
  // Note: Next.js requires 'unsafe-eval' for development and some production features
  // We use 'unsafe-inline' for styles because Next.js injects styles dynamically
  // In production, consider using a stricter CSP with nonces
  const isDev = process.env.NODE_ENV === "development";

  // Build CSP directives
  const cspDirectives = [
    // Default: only allow same-origin
    "default-src 'self'",

    // Scripts: Allow Vercel, Google APIs, unsafe-inline/eval for production stability
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://vercel.com https://frontend-cdn.perplexity.ai https://apis.google.com",

    // Styles: Allow Google Fonts and Perplexity
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://frontend-cdn.perplexity.ai",

    // Images: Allow Firebase, Unsplash, Vercel, QR Code Generator
    "img-src 'self' blob: data: https://*.firebasestorage.app https://firebasestorage.googleapis.com https://images.unsplash.com https://vercel.live https://vercel.com https://api.qrserver.com",

    // Fonts: Allow Google Fonts and Perplexity
    "font-src 'self' data: https://fonts.gstatic.com https://frontend-cdn.perplexity.ai",

    // API connections: Allow Firebase, Vercel Analytics/Toolbar
    "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com https://vercel.live https://vercel.com https://vitals.vercel-insights.com https://frontend-cdn.perplexity.ai",

    // Frames: YouTube, Google, Vercel
    "frame-src 'self' https://www.youtube.com https://www.google.com https://vercel.live https://vercel.com https://*.firebaseapp.com",

    // Prevent this site from being embedded
    "frame-ancestors 'none'",

    // Form submissions only to self
    "form-action 'self'",

    // Base URI restriction
    "base-uri 'self'",

    // Block plugins
    "object-src 'none'",

    // Upgrade insecure requests in production
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ];

  const cspHeader = cspDirectives.join("; ");
  response.headers.set("Content-Security-Policy", cspHeader);

  // Pass nonce to the page for inline scripts (if needed)
  response.headers.set("X-Nonce", nonce);

  // Additional headers for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Prevent caching of API responses
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    // Prevent API responses from being cached by CDNs
    response.headers.set("Surrogate-Control", "no-store");

    // CORS headers for API routes (if needed)
    // response.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_APP_URL || "*");
  }

  // Security headers for sensitive routes
  const sensitiveRoutes = ["/admin", "/student", "/api/admin"];
  const isSensitiveRoute = sensitiveRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isSensitiveRoute) {
    // Extra strict caching for sensitive routes
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");

    // Clear site data on logout (browser support varies)
    if (request.nextUrl.pathname.includes("logout")) {
      response.headers.set("Clear-Site-Data", '"cache", "cookies", "storage"');
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths including API routes
     * Exclude static files and images
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
