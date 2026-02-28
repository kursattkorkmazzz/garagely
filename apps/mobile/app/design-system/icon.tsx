import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppIcon } from "@/components/ui/app-icon";
import { useTheme } from "@/theme/theme-context";
import { spacing } from "@/theme/tokens/spacing";
import { radius } from "@/theme/tokens/radius";

export default function IconShowcase() {
  const { theme, withOpacity } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Default Icon */}
      <View style={styles.section}>
        <AppText variant="heading5">Default</AppText>
        <View style={styles.row}>
          <AppIcon icon="Home" />
          <AppIcon icon="User" />
          <AppIcon icon="Settings" />
          <AppIcon icon="Bell" />
          <AppIcon icon="Search" />
        </View>
      </View>

      {/* Sizes */}
      <View style={styles.section}>
        <AppText variant="heading5">Sizes</AppText>
        <View style={styles.row}>
          <AppIcon icon="Star" size={16} />
          <AppIcon icon="Star" size={20} />
          <AppIcon icon="Star" size={24} />
          <AppIcon icon="Star" size={32} />
          <AppIcon icon="Star" size={40} />
        </View>
      </View>

      {/* Theme Colors */}
      <View style={styles.section}>
        <AppText variant="heading5">Theme Colors</AppText>
        <View style={styles.row}>
          <AppIcon icon="Heart" color={theme.primary} />
          <AppIcon icon="Heart" color={theme.secondary} />
          <AppIcon icon="Heart" color={theme.accent} />
          <AppIcon icon="Heart" color={theme.destructive} />
          <AppIcon icon="Heart" color={theme.mutedForeground} />
        </View>
      </View>

      {/* Palette Colors */}
      <View style={styles.section}>
        <AppText variant="heading5">Palette Colors</AppText>
        <View style={styles.row}>
          <AppIcon icon="Circle" color={theme.color.red} />
          <AppIcon icon="Circle" color={theme.color.orange} />
          <AppIcon icon="Circle" color={theme.color.cyan} />
          <AppIcon icon="Circle" color={theme.color.green} />
          <AppIcon icon="Circle" color={theme.color.purple} />
        </View>
      </View>

      {/* Palette Colors With Background*/}
      <View style={styles.section}>
        <AppText variant="heading5">Palette Colors With Background</AppText>
        <View style={styles.row}>
          <AppIcon
            icon="Circle"
            color={theme.color.red}
            style={{
              backgroundColor: withOpacity(theme.color.red, 0.2),
              borderRadius: radius,
              padding: spacing.xs,
            }}
          />
          <AppIcon
            icon="Circle"
            color={theme.color.orange}
            style={{
              backgroundColor: withOpacity(theme.color.orange, 0.2),
              borderRadius: radius,
              padding: spacing.xs,
            }}
          />
          <AppIcon
            icon="Circle"
            color={theme.color.cyan}
            style={{
              backgroundColor: withOpacity(theme.color.cyan, 0.2),
              borderRadius: radius,
              padding: spacing.xs,
            }}
          />
          <AppIcon
            icon="Circle"
            color={theme.color.green}
            style={{
              backgroundColor: withOpacity(theme.color.green, 0.2),
              borderRadius: radius,
              padding: spacing.xs,
            }}
          />
          <AppIcon
            icon="Circle"
            color={theme.color.purple}
            style={{
              backgroundColor: withOpacity(theme.color.purple, 0.2),
              borderRadius: radius,
              padding: spacing.xs,
            }}
          />
        </View>
      </View>

      {/* Common Icons */}
      <View style={styles.section}>
        <AppText variant="heading5">Common Icons</AppText>
        <View style={styles.grid}>
          <View style={styles.iconItem}>
            <AppIcon icon="Mail" />
            <AppText variant="caption" color="muted">
              Mail
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="Lock" />
            <AppText variant="caption" color="muted">
              Lock
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="Eye" />
            <AppText variant="caption" color="muted">
              Eye
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="EyeOff" />
            <AppText variant="caption" color="muted">
              EyeOff
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="Phone" />
            <AppText variant="caption" color="muted">
              Phone
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="MapPin" />
            <AppText variant="caption" color="muted">
              MapPin
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="Calendar" />
            <AppText variant="caption" color="muted">
              Calendar
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="Clock" />
            <AppText variant="caption" color="muted">
              Clock
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="Check" />
            <AppText variant="caption" color="muted">
              Check
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="X" />
            <AppText variant="caption" color="muted">
              X
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="Plus" />
            <AppText variant="caption" color="muted">
              Plus
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="Minus" />
            <AppText variant="caption" color="muted">
              Minus
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="ChevronLeft" />
            <AppText variant="caption" color="muted">
              ChevronLeft
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="ChevronRight" />
            <AppText variant="caption" color="muted">
              ChevronRight
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="ArrowLeft" />
            <AppText variant="caption" color="muted">
              ArrowLeft
            </AppText>
          </View>
          <View style={styles.iconItem}>
            <AppIcon icon="ArrowRight" />
            <AppText variant="caption" color="muted">
              ArrowRight
            </AppText>
          </View>
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
    alignItems: "center",
    gap: spacing.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  iconItem: {
    alignItems: "center",
    gap: spacing.xs,
    width: 70,
  },
});
