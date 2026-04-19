import { initializeDatabase } from "@/db/db";
import { useUserPreferencesStore } from "@/stores/user-preferences.store";
import { AsyncStates, useAsyncState } from "@/utils/hooks/use-async-state";
import { useEffect } from "react";

type DatabaseProviderProps = {
  children?: React.ReactNode;
};

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const dbInit = useAsyncState();

  useEffect(() => {
    initializeDatabase()
      .then(() => {
        console.log("[+] Database initialized succesffully.");
        useUserPreferencesStore
          .getState()
          .load()
          .then(() => {
            console.log("[+] User preferences loaded succesffully.");
          })
          .catch((err) => {
            console.log(
              "[-] Encountered error while loading user preferences.\n\n",
              err,
            );
          });
        dbInit.setState(AsyncStates.SUCCESS);
      })
      .catch((err) => {
        console.error("Database initialization failed:", err);
        dbInit.setState(AsyncStates.ERROR);
      });
  }, []);

  if (dbInit.state !== AsyncStates.SUCCESS) return null;
  return <>{children}</>;
}
