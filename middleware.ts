export { auth as middleware } from "@/lib/auth";

export const config = {
  // Protect everything except: login, auth API, static assets, Next.js internals
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon\\.ico|scout-mark\\.svg|orisha-agrifood\\.svg|scout-wordmark\\.svg).*)",
  ],
};
