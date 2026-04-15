import { LocalizationService } from "@/i18n/localization.service";
import {
  AsyncStateRef,
  AsyncStates,
  useAsyncState,
} from "@/utils/hooks/use-async-state";
import { useEffect } from "react";

type LocalizationProviderProps = {
  children?: React.ReactNode;
  ref?: React.RefObject<AsyncStateRef>;
};

export function LocalizationProvider(props: LocalizationProviderProps) {
  const localizationState = useAsyncState(props.ref);

  useEffect(() => {
    localizationState.setState(AsyncStates.PENDING);
    LocalizationService.initI18Next()
      .then(() => {
        console.log("[+] Localization initialized.");

        localizationState.setState(AsyncStates.SUCCESS);
      })
      .catch(() => {
        console.log("[+] Localization failed.");
        localizationState.setState(AsyncStates.ERROR);
      });
  }, []);

  if (localizationState.state !== AsyncStates.SUCCESS) return null;
  return props.children;
}
