import { useState } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AppText } from "@/components/ui/app-text";
import {
  AppInput,
  InputField,
  InputLeftAction,
  InputRightAction,
} from "@/components/ui/app-input";
import { useTheme } from "@/theme/theme-context";
import { spacing } from "@/theme/tokens/spacing";

export default function InputShowcase() {
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Basic Input */}
      <View style={styles.section}>
        <AppText variant="heading5">Basic Input</AppText>
        <AppInput>
          <InputField placeholder="Type something..." />
        </AppInput>
      </View>

      {/* Input with Left Icon */}
      <View style={styles.section}>
        <AppText variant="heading5">With Left Icon</AppText>
        <AppInput>
          <InputLeftAction>
            <Feather name="mail" size={20} color={theme.mutedForeground} />
          </InputLeftAction>
          <InputField
            placeholder="john@example.com"
            keyboardType="email-address"
          />
        </AppInput>
      </View>

      {/* Input with Right Icon */}
      <View style={styles.section}>
        <AppText variant="heading5">With Right Icon</AppText>
        <AppInput>
          <InputField placeholder="Search..." />
          <InputRightAction>
            <Feather name="search" size={20} color={theme.mutedForeground} />
          </InputRightAction>
        </AppInput>
      </View>

      {/* Input with Both Icons */}
      <View style={styles.section}>
        <AppText variant="heading5">With Both Icons</AppText>
        <AppInput>
          <InputLeftAction>
            <Feather name="user" size={20} color={theme.mutedForeground} />
          </InputLeftAction>
          <InputField placeholder="Username" />
          <InputRightAction>
            <Feather name="check" size={20} color={theme.color.green} />
          </InputRightAction>
        </AppInput>
      </View>

      {/* Password Input with Toggle */}
      <View style={styles.section}>
        <AppText variant="heading5">Password with Toggle</AppText>
        <AppInput>
          <InputLeftAction>
            <Feather name="lock" size={20} color={theme.mutedForeground} />
          </InputLeftAction>
          <InputField
            placeholder="Enter password"
            secureTextEntry={!showPassword}
          />
          <InputRightAction>
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color={theme.mutedForeground}
              />
            </Pressable>
          </InputRightAction>
        </AppInput>
      </View>

      {/* Phone Input */}
      <View style={styles.section}>
        <AppText variant="heading5">Phone Input</AppText>
        <AppInput>
          <InputLeftAction>
            <Feather name="phone" size={20} color={theme.mutedForeground} />
          </InputLeftAction>
          <InputField
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
          />
        </AppInput>
      </View>

      {/* Number Input */}
      <View style={styles.section}>
        <AppText variant="heading5">Number Input</AppText>
        <AppInput>
          <InputLeftAction>
            <Feather name="hash" size={20} color={theme.mutedForeground} />
          </InputLeftAction>
          <InputField placeholder="Enter amount" keyboardType="numeric" />
          <InputRightAction>
            <AppText color="muted">USD</AppText>
          </InputRightAction>
        </AppInput>
      </View>

      {/* URL Input */}
      <View style={styles.section}>
        <AppText variant="heading5">URL Input</AppText>
        <AppInput>
          <InputLeftAction>
            <Feather name="globe" size={20} color={theme.mutedForeground} />
          </InputLeftAction>
          <InputField placeholder="https://example.com" keyboardType="url" />
        </AppInput>
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
});
