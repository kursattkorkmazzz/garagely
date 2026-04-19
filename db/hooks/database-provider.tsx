import { initializeDatabase } from "@/db/db";
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
