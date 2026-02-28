import { Link } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

export default function App() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Link href="/design-system/typography">Typography</Link>
      <Link href="/design-system/input">Input</Link>
      <Link href="/design-system/icon">Icon</Link>
      <Link href="/design-system/tabs">Tabs</Link>
      <Link href="/design-system/button">Button</Link>
      <Link href="/design-system/badge">Badge</Link>
      <Link href="/design-system/card">Card</Link>
      <Link href="/design-system/toast">Toast</Link>
      <Link href="/design-system/switch">Switch</Link>
      <Link href="/design-system/spinner">Spinner</Link>
      <Link href="/design-system/textarea">Textarea</Link>
      <Link href="/design-system/avatar">Avatar</Link>
      <Link href="/design-system/skeleton">Skeleton</Link>
      <Link href="/design-system/select">Select</Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    alignItems: "center",
    columnGap: 16,
  },
});
