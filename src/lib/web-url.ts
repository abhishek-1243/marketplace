export function isHttpUrl(value: string) {
  try { return ["https:", "http:"].includes(new URL(value).protocol); }
  catch { return false; }
}
