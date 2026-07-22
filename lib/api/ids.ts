export function getIdFromUrl(request: Request, segment: string) {
  const pathname = new URL(request.url).pathname;
  const parts = pathname.split("/").filter(Boolean);
  const index = parts.indexOf(segment);

  return index >= 0 ? parts[index + 1] : undefined;
}
