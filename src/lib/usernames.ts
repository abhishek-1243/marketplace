const RESERVED = new Set(["admin", "api", "apply", "checkout", "contact", "copyright", "dashboard", "delivery-policy", "library", "login", "onboarding", "privacy", "refund-policy", "register", "search", "sounds", "terms", "messages", "favicon.ico", "robots.txt", "sitemap.xml"]);

export function isReservedUsername(username: string) {
  return RESERVED.has(username.toLowerCase());
}
