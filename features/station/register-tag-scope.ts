import i18n from "i18next";
import { registerTagScope } from "@/features/tag/scope-registry";
import { STATION_TAG_SCOPE_PREFIX } from "@/features/station/utils/station-tag-scope";

/**
 * Station feature için tag scope resolver'ını kayıt eder.
 * App init sonrası bir kez çağrılmalı (örn. app/_layout.tsx içinde).
 */
export function registerStationTagScope(): void {
  registerTagScope(STATION_TAG_SCOPE_PREFIX, (sub: string) => {
    if (!sub) return i18n.t("station:addStation", { defaultValue: "Station" });
    const label = i18n.t(`station:type.${sub}`, { defaultValue: sub });
    return label;
  });
}
