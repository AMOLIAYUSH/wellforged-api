export const normalizePublicUrl = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;

  if (raw.startsWith("//")) return `https:${raw}`;
  if (raw.startsWith("/")) return raw;

  try {
    const url = new URL(raw);
    const isLocal =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1";

    // Strip stale localhost dev ports so clients don't hit dead servers.
    if (isLocal) return url.pathname + url.search + url.hash;

    // Enforce https for public assets.
    if (url.protocol === "http:") url.protocol = "https:";
    return url.toString();
  } catch {
    // Non-URL strings (e.g. icon names like "Shield") pass through.
    return raw;
  }
};

