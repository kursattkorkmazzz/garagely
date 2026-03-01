import { ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/app-text";
import { AppButton } from "@/components/ui/app-button";
import { appToast, ToastPosition } from "@/components/ui/app-toast";
import { spacing } from "@/theme/tokens/spacing";

export default function ToastShowcase() {
  const showDefaultToast = () => {
    appToast("This is a default toast message");
  };

  const showSuccessToast = () => {
    appToast.success("Operation completed successfully!");
  };

  const showErrorToast = () => {
    appToast.error("Something went wrong. Please try again.");
  };

  const showLoadingToast = () => {
    const id = appToast.loading("Loading data...");
    setTimeout(() => {
      appToast.dismiss(id);
      appToast.success("Data loaded!");
    }, 2000);
  };

  const showPromiseToast = () => {
    const myPromise = new Promise<{ name: string }>((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.3) {
          resolve({ name: "John" });
        } else {
          reject(new Error("Network error"));
        }
      }, 2000);
    });

    appToast.promise(myPromise, {
      loading: "Fetching user data...",
      success: (data) => `Welcome back, ${data.name}!`,
      error: (err) => err.message,
    });
  };

  const showTopToast = () => {
    appToast("Toast at the top!", { position: ToastPosition.TOP });
  };

  const showBottomToast = () => {
    appToast("Toast at the bottom!", { position: ToastPosition.BOTTOM });
  };

  const showLongDurationToast = () => {
    appToast("This toast stays for 5 seconds", { duration: 5000 });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Default Toast */}
      <View style={styles.section}>
        <AppText variant="heading5">Default Toast</AppText>
        <AppButton onPress={showDefaultToast}>Show Default Toast</AppButton>
      </View>

      {/* Success Toast */}
      <View style={styles.section}>
        <AppText variant="heading5">Success Toast</AppText>
        <AppButton variant="secondary" onPress={showSuccessToast}>
          Show Success Toast
        </AppButton>
      </View>

      {/* Error Toast */}
      <View style={styles.section}>
        <AppText variant="heading5">Error Toast</AppText>
        <AppButton variant="destructive" onPress={showErrorToast}>
          Show Error Toast
        </AppButton>
      </View>

      {/* Loading Toast */}
      <View style={styles.section}>
        <AppText variant="heading5">Loading Toast</AppText>
        <AppText variant="bodySmall" color="muted">
          Shows loading, then dismisses after 2s
        </AppText>
        <AppButton variant="outline" onPress={showLoadingToast}>
          Show Loading Toast
        </AppButton>
      </View>

      {/* Promise Toast */}
      <View style={styles.section}>
        <AppText variant="heading5">Promise Toast</AppText>
        <AppText variant="bodySmall" color="muted">
          Automatically updates based on promise result
        </AppText>
        <AppButton variant="outline" onPress={showPromiseToast}>
          Show Promise Toast
        </AppButton>
      </View>

      {/* Positioning */}
      <View style={styles.section}>
        <AppText variant="heading5">Positioning</AppText>
        <View style={styles.row}>
          <AppButton variant="ghost" onPress={showTopToast}>
            Top
          </AppButton>
          <AppButton variant="ghost" onPress={showBottomToast}>
            Bottom
          </AppButton>
        </View>
      </View>

      {/* Duration */}
      <View style={styles.section}>
        <AppText variant="heading5">Custom Duration</AppText>
        <AppButton variant="ghost" onPress={showLongDurationToast}>
          5 Second Toast
        </AppButton>
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
    gap: spacing.sm,
  },
});
