import React, { createContext, useContext, useState, ReactNode } from "react";
import { View, Image, StyleSheet, ImageSourcePropType } from "react-native";
import { AppText } from "./app-text";
import { useTheme } from "@/theme/theme-context";

type AvatarSize = "sm" | "default" | "lg" | "xl";

const sizeValues: Record<AvatarSize, number> = {
  sm: 32,
  default: 40,
  lg: 56,
  xl: 80,
};

const badgeSizes: Record<AvatarSize, number> = {
  sm: 12,
  default: 16,
  lg: 20,
  xl: 24,
};

const fontSizes: Record<AvatarSize, number> = {
  sm: 12,
  default: 14,
  lg: 20,
  xl: 28,
};

// Context for sharing avatar state
interface AvatarContextProps {
  size: AvatarSize;
  imageLoaded: boolean;
  setImageLoaded: (loaded: boolean) => void;
}

const AvatarContext = createContext<AvatarContextProps | null>(null);

function useAvatarContext() {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error("Avatar components must be used within an AppAvatar");
  }
  return context;
}

// AppAvatar - Container component
type AppAvatarProps = {
  children: ReactNode;
  size?: AvatarSize;
};

export function AppAvatar({ children, size = "default" }: AppAvatarProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const avatarSize = sizeValues[size];

  return (
    <AvatarContext.Provider value={{ size, imageLoaded, setImageLoaded }}>
      <View style={[styles.container, { width: avatarSize, height: avatarSize }]}>
        {children}
      </View>
    </AvatarContext.Provider>
  );
}

// AppAvatarImage - The image component
type AppAvatarImageProps = {
  src: ImageSourcePropType | string;
  alt?: string;
};

export function AppAvatarImage({ src, alt }: AppAvatarImageProps) {
  const { size, imageLoaded, setImageLoaded } = useAvatarContext();
  const avatarSize = sizeValues[size];

  const imageSource = typeof src === "string" ? { uri: src } : src;

  return (
    <Image
      source={imageSource}
      accessibilityLabel={alt}
      style={[
        styles.image,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          opacity: imageLoaded ? 1 : 0,
          position: imageLoaded ? "relative" : "absolute",
        },
      ]}
      onLoad={() => setImageLoaded(true)}
      onError={() => setImageLoaded(false)}
    />
  );
}

// AppAvatarFallback - Fallback when image is not loaded
type AppAvatarFallbackProps = {
  fallbackText?: string | null;
  fallbackColor?: string;
};

function getInitials(text: string): string {
  return text
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase())
    .slice(0, 2)
    .join("");
}

export function AppAvatarFallback({
  fallbackText,
  fallbackColor,
}: AppAvatarFallbackProps) {
  const { theme } = useTheme();
  const { size, imageLoaded } = useAvatarContext();
  const avatarSize = sizeValues[size];
  const fontSize = fontSizes[size];

  if (imageLoaded) {
    return null;
  }

  const initials = fallbackText ? getInitials(fallbackText) : "?";
  const backgroundColor = fallbackColor ?? theme.muted;

  return (
    <View
      style={[
        styles.fallback,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor,
        },
      ]}
    >
      <AppText
        style={{
          fontSize,
          fontWeight: "600",
          color: theme.foreground,
        }}
      >
        {initials}
      </AppText>
    </View>
  );
}

// AppAvatarBadge - Badge at bottom right
type AppAvatarBadgeProps = {
  children: ReactNode;
  backgroundColor?: string;
};

export function AppAvatarBadge({ children, backgroundColor }: AppAvatarBadgeProps) {
  const { theme } = useTheme();
  const { size } = useAvatarContext();
  const badgeSize = badgeSizes[size];

  return (
    <View
      style={[
        styles.badge,
        {
          width: badgeSize,
          height: badgeSize,
          borderRadius: badgeSize / 2,
          backgroundColor: backgroundColor ?? theme.primary,
          borderColor: theme.background,
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    resizeMode: "cover",
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
});
