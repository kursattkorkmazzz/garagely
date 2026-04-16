import { ThemeService } from "@/theme/theme-service";
import { useSyncExternalStore } from "react";

export function useTheme() {
  return useSyncExternalStore(
    ThemeService.subscribe,
    ThemeService.getState,
    ThemeService.getState,
  );
}
