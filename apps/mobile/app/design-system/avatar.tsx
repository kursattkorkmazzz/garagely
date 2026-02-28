import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import {
  AppAvatar,
  AppAvatarImage,
  AppAvatarFallback,
  AppAvatarBadge,
} from "@/components/ui/app-avatar";
import { Plus, Check } from "lucide-react-native";
import { spacing } from "@/theme/tokens/spacing";
import { useTheme } from "@/theme/theme-context";

export default function AvatarShowcase() {
  const { theme } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Avatar with Image */}
      <View style={styles.section}>
        <AppText variant="heading5">Avatar with Image</AppText>
        <View style={styles.row}>
          <AppAvatar>
            <AppAvatarImage
              src="https://i.pravatar.cc/150?img=1"
              alt="User avatar"
            />
            <AppAvatarFallback fallbackText="John Doe" />
          </AppAvatar>
        </View>
      </View>

      {/* Sizes */}
      <View style={styles.section}>
        <AppText variant="heading5">Sizes</AppText>
        <View style={styles.row}>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Small
            </AppText>
            <AppAvatar size="sm">
              <AppAvatarImage src="https://i.pravatar.cc/150?img=2" />
              <AppAvatarFallback fallbackText="Jane Smith" />
            </AppAvatar>
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Default
            </AppText>
            <AppAvatar size="default">
              <AppAvatarImage src="https://i.pravatar.cc/150?img=3" />
              <AppAvatarFallback fallbackText="Jane Smith" />
            </AppAvatar>
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Large
            </AppText>
            <AppAvatar size="lg">
              <AppAvatarImage src="https://i.pravatar.cc/150?img=4" />
              <AppAvatarFallback fallbackText="Jane Smith" />
            </AppAvatar>
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              XL
            </AppText>
            <AppAvatar size="xl">
              <AppAvatarImage src="https://i.pravatar.cc/150?img=5" />
              <AppAvatarFallback fallbackText="Jane Smith" />
            </AppAvatar>
          </View>
        </View>
      </View>

      {/* Fallback (Invalid Image URL) */}
      <View style={styles.section}>
        <AppText variant="heading5">Fallback (No Image)</AppText>
        <View style={styles.row}>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              John Doe
            </AppText>
            <AppAvatar>
              <AppAvatarImage src="https://invalid-url.com/image.png" />
              <AppAvatarFallback fallbackText="John Doe" />
            </AppAvatar>
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Alice
            </AppText>
            <AppAvatar>
              <AppAvatarImage src="https://invalid-url.com/image.png" />
              <AppAvatarFallback fallbackText="Alice" />
            </AppAvatar>
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              No Text
            </AppText>
            <AppAvatar>
              <AppAvatarImage src="https://invalid-url.com/image.png" />
              <AppAvatarFallback />
            </AppAvatar>
          </View>
        </View>
      </View>

      {/* Custom Fallback Colors */}
      <View style={styles.section}>
        <AppText variant="heading5">Custom Fallback Colors</AppText>
        <View style={styles.row}>
          <AppAvatar>
            <AppAvatarImage src="https://invalid-url.com/image.png" />
            <AppAvatarFallback
              fallbackText="Red User"
              fallbackColor={theme.color.red}
            />
          </AppAvatar>
          <AppAvatar>
            <AppAvatarImage src="https://invalid-url.com/image.png" />
            <AppAvatarFallback
              fallbackText="Green User"
              fallbackColor={theme.color.green}
            />
          </AppAvatar>
          <AppAvatar>
            <AppAvatarImage src="https://invalid-url.com/image.png" />
            <AppAvatarFallback
              fallbackText="Purple User"
              fallbackColor={theme.color.purple}
            />
          </AppAvatar>
        </View>
      </View>

      {/* With Badge */}
      <View style={styles.section}>
        <AppText variant="heading5">With Badge</AppText>
        <View style={styles.row}>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Plus Icon
            </AppText>
            <AppAvatar size="lg">
              <AppAvatarImage src="https://i.pravatar.cc/150?img=6" />
              <AppAvatarFallback fallbackText="User Name" />
              <AppAvatarBadge>
                <Plus size={12} color="#fff" />
              </AppAvatarBadge>
            </AppAvatar>
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              Check Icon
            </AppText>
            <AppAvatar size="lg">
              <AppAvatarImage src="https://i.pravatar.cc/150?img=7" />
              <AppAvatarFallback fallbackText="User Name" />
              <AppAvatarBadge backgroundColor={theme.color.green}>
                <Check size={12} color="#fff" />
              </AppAvatarBadge>
            </AppAvatar>
          </View>
          <View style={styles.item}>
            <AppText variant="bodySmall" color="muted">
              XL Size
            </AppText>
            <AppAvatar size="xl">
              <AppAvatarImage src="https://i.pravatar.cc/150?img=8" />
              <AppAvatarFallback fallbackText="User Name" />
              <AppAvatarBadge>
                <Plus size={16} color="#fff" />
              </AppAvatarBadge>
            </AppAvatar>
          </View>
        </View>
      </View>

      {/* Badge on Fallback */}
      <View style={styles.section}>
        <AppText variant="heading5">Badge on Fallback</AppText>
        <View style={styles.row}>
          <AppAvatar size="lg">
            <AppAvatarImage src="https://invalid-url.com/image.png" />
            <AppAvatarFallback
              fallbackText="New User"
              fallbackColor={theme.color.cyan}
            />
            <AppAvatarBadge>
              <Plus size={12} color="#fff" />
            </AppAvatarBadge>
          </AppAvatar>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    gap: spacing.lg,
  },
  section: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.lg,
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  item: {
    gap: spacing.xs,
    alignItems: "center",
  },
});
