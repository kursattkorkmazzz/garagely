/**
 * Tag scope label registry.
 *
 * Tag'ler `scope` string'iyle saklanır (örn. "station:GAS_STATION").
 * Yönetim ekranı bu raw string'leri kullanıcıya gösteremez — feature'lar
 * kayıt sırasında resolver tanımlar:
 *
 *   registerTagScope("station", (sub) => i18n.t(`station:types.${sub}`));
 *
 * Resolver'lar bir kere kayıt edilir (örn. app/_layout.tsx'te i18n init sonrası).
 */

export type TagScopeResolver = (subScope: string) => string;

const registry = new Map<string, TagScopeResolver>();

export function registerTagScope(
  featurePrefix: string,
  resolver: TagScopeResolver,
): void {
  registry.set(featurePrefix, resolver);
}

export function unregisterTagScope(featurePrefix: string): void {
  registry.delete(featurePrefix);
}

/**
 * Scope string'ini ("station:MECHANIC") human-readable label'a çevirir.
 * Resolver bulunamazsa raw scope string'ini döner (fallback).
 */
export function resolveScopeLabel(scope: string): string {
  const idx = scope.indexOf(":");
  if (idx < 0) {
    const resolver = registry.get(scope);
    return resolver ? resolver("") : scope;
  }
  const prefix = scope.slice(0, idx);
  const sub = scope.slice(idx + 1);
  const resolver = registry.get(prefix);
  return resolver ? resolver(sub) : scope;
}

/**
 * Sadece feature prefix'i için label çözer (örn. "station" → "İstasyon").
 * Resolver yoksa prefix string'i döner.
 */
export function resolveScopePrefixLabel(scope: string): string {
  const idx = scope.indexOf(":");
  const prefix = idx < 0 ? scope : scope.slice(0, idx);
  const resolver = registry.get(prefix);
  return resolver ? resolver("") : prefix;
}
