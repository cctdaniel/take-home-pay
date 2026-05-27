export function getUniqueSourceUrls(sourceUrls: readonly string[]): string[] {
  const seen = new Set<string>();
  const uniqueSourceUrls: string[] = [];

  for (const rawUrl of sourceUrls) {
    const trimmedUrl = rawUrl.trim();
    if (!trimmedUrl) {
      continue;
    }

    let normalized = trimmedUrl.toLowerCase();
    try {
      const parsed = new URL(trimmedUrl);
      normalized = `${parsed.protocol}//${parsed.host}${parsed.pathname.replace(/\/+$/, "")}${parsed.search}`;
    } catch {
      // Fall back to raw normalized URL to avoid crashing on non-URL entries.
    }

    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueSourceUrls.push(trimmedUrl);
    }
  }

  return uniqueSourceUrls;
}

