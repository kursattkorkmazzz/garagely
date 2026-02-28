import React, { ReactNode, isValidElement } from "react";
import { View, StyleSheet, ViewProps } from "react-native";
import { useTheme } from "@/theme/theme-context";
import { AppText } from "./app-text";
import { radius } from "@/theme/tokens/radius";
import { spacing } from "@/theme/tokens/spacing";
import { AppView } from "./app-view";

// AppCard - Container
type AppCardProps = ViewProps & {
  children: ReactNode;
};

export function AppCard({ children, style, ...rest }: AppCardProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: radius * 2,
      borderWidth: 1,
      borderColor: theme.border,
    },
  });

  return (
    <AppView {...rest} style={[styles.container, style]}>
      {children}
    </AppView>
  );
}

// AppCardAction - Action area (defined first for reference in AppCardHeader)
type AppCardActionProps = ViewProps & {
  children: ReactNode;
};

function AppCardActionComponent({
  children,
  style,
  ...rest
}: AppCardActionProps) {
  const styles = StyleSheet.create({
    action: {
      flexDirection: "row",
      alignItems: "center",
      alignSelf: "center",
      gap: spacing.sm,
    },
  });

  return (
    <AppView {...rest} style={[styles.action, style]}>
      {children}
    </AppView>
  );
}

AppCardActionComponent.displayName = "AppCardAction";

export const AppCardAction = AppCardActionComponent;

// AppCardHeader - Header section
type AppCardHeaderProps = ViewProps & {
  children: ReactNode;
};

export function AppCardHeader({
  children,
  style,
  ...rest
}: AppCardHeaderProps) {
  const styles = StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      padding: spacing.md,
      gap: spacing.md,
    },
    content: {
      flex: 1,
      gap: spacing.xs,
    },
  });

  // Separate AppCardAction from other children
  const isAction = (child: unknown): boolean => {
    if (!isValidElement(child)) return false;
    const type = child.type as { displayName?: string };
    return type.displayName === "AppCardAction";
  };

  const childArray = React.Children.toArray(children);
  const actionChildren = childArray.filter(isAction);
  const otherChildren = childArray.filter((child) => !isAction(child));

  return (
    <AppView {...rest} style={[styles.header, style]}>
      <AppView style={styles.content}>{otherChildren}</AppView>
      {actionChildren}
    </AppView>
  );
}

// AppCardTitle - Title text
type AppCardTitleProps = {
  children: ReactNode;
};

export function AppCardTitle({ children }: AppCardTitleProps) {
  return <AppText variant="heading5">{children}</AppText>;
}

// AppCardDescription - Description text
type AppCardDescriptionProps = {
  children: ReactNode;
};

export function AppCardDescription({ children }: AppCardDescriptionProps) {
  return (
    <AppText variant="bodySmall" color="muted">
      {children}
    </AppText>
  );
}

// AppCardContent - Main content area
type AppCardContentProps = ViewProps & {
  children: ReactNode;
};

export function AppCardContent({
  children,
  style,
  ...rest
}: AppCardContentProps) {
  const styles = StyleSheet.create({
    content: {
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
    },
  });

  return (
    <AppView {...rest} style={[styles.content, style]}>
      {children}
    </AppView>
  );
}

// AppCardFooter - Footer section
type AppCardFooterProps = ViewProps & {
  children: ReactNode;
};

export function AppCardFooter({
  children,
  style,
  ...rest
}: AppCardFooterProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    footer: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      gap: spacing.sm,
    },
  });

  return (
    <AppView {...rest} style={[styles.footer, style]}>
      {children}
    </AppView>
  );
}
