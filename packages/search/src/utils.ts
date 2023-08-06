export function getCacheKey(tenant: string, index?: string) {
  return `documents_${tenant}_${index ?? "ALL"}`;
}
