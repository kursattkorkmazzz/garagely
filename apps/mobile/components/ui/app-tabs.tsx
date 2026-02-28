import React, { createContext, useContext, useState, ReactNode } from "react";
import { View, Pressable, StyleSheet, ViewProps } from "react-native";
import { useTheme } from "@/theme/theme-context";
import { AppText } from "./app-text";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";
import { AppView } from "./app-view";

// Context for sharing tab state
interface TabsContextProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextProps | null>(null);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("Tabs components must be used within AppTabs");
  }
  return context;
}

// AppTabs - Container component
type AppTabsProps = ViewProps & {
  defaultValue: string;
  children: ReactNode;
  onValueChange?: (value: string) => void;
};

export function AppTabs({
  defaultValue,
  children,
  onValueChange,
  style,
  ...rest
}: AppTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    onValueChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <AppView {...rest} style={style}>
        {children}
      </AppView>
    </TabsContext.Provider>
  );
}

// AppTabList - Tab buttons container
type AppTabListProps = ViewProps & {
  children: ReactNode;
};

export function AppTabList({ children, style, ...rest }: AppTabListProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: theme.secondary,
      borderRadius: radius * 2,
      borderWidth: 1,
      borderColor: theme.border,
      padding: spacing.xs,
    },
  });

  return (
    <AppView {...rest} style={[styles.container, style]}>
      {children}
    </AppView>
  );
}

// AppTabTrigger - Individual tab button
type AppTabTriggerProps = {
  value: string;
  children: ReactNode;
};

export function AppTabTrigger({ value, children }: AppTabTriggerProps) {
  const { theme } = useTheme();
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  const styles = StyleSheet.create({
    trigger: {
      flex: 1,
      paddingVertical: spacing.sm + spacing.xs,
      paddingHorizontal: spacing.md,
      borderRadius: radius * 1.5,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: isActive ? theme.primary : "transparent",
    },
  });

  return (
    <Pressable style={styles.trigger} onPress={() => setActiveTab(value)}>
      <AppText
        variant="buttonMedium"
        color={isActive ? "default" : "muted"}
        style={{
          color: isActive ? theme.primaryForeground : theme.mutedForeground,
        }}
      >
        {children}
      </AppText>
    </Pressable>
  );
}

// AppTabContent - Content area for each tab
type AppTabContentProps = ViewProps & {
  value: string;
  children: ReactNode;
};

export function AppTabContent({
  value,
  children,
  style,
  ...rest
}: AppTabContentProps) {
  const { activeTab } = useTabsContext();

  if (activeTab !== value) {
    return null;
  }

  return (
    <AppView {...rest} style={style}>
      {children}
    </AppView>
  );
}
