import { createContext, useContext } from "react";

type TabContextValue = {
  value: string;
  onChange: (next: string) => void;
};

export const TabContext = createContext<TabContextValue | null>(null);

export function useTabContext(): TabContextValue {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error("AppTab components must be used inside <AppTab>");
  return ctx;
}
