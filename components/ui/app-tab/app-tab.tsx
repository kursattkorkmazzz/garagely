import { ReactNode } from "react";
import { View } from "react-native";
import { TabContext } from "./tab-context";

type AppTabProps = {
  value: string;
  onChange: (next: string) => void;
  children: ReactNode;
};

export function AppTab({ value, onChange, children }: AppTabProps) {
  return (
    <TabContext.Provider value={{ value, onChange }}>
      <View>{children}</View>
    </TabContext.Provider>
  );
}
