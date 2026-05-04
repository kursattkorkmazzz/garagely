import { ReactNode } from "react";
import { useTabContext } from "./tab-context";

type AppTabPanelProps = {
  value: string;
  children: ReactNode;
};

export function AppTabPanel({ value, children }: AppTabPanelProps) {
  const { value: activeValue } = useTabContext();
  if (activeValue !== value) return null;
  return <>{children}</>;
}
