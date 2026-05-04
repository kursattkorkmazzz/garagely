import { AppText } from "@/components/ui/app-text";
import { useCallback, useEffect, useRef } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from "react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const DEFAULT_ITEM_HEIGHT = 44;
const DEFAULT_VISIBLE_ITEMS = 5;

type ScrollDrumProps = {
  items: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  itemHeight?: number;
  visibleItems?: number;
};

export function ScrollDrum({
  items,
  selectedIndex,
  onIndexChange,
  itemHeight = DEFAULT_ITEM_HEIGHT,
  visibleItems = DEFAULT_VISIBLE_ITEMS,
}: ScrollDrumProps) {
  const { theme } = useUnistyles();
  const scrollRef = useRef<ScrollView>(null);
  const padding = Math.floor(visibleItems / 2) * itemHeight;
  const containerHeight = visibleItems * itemHeight;
  const isScrollingByCode = useRef(false);

  useEffect(() => {
    const offset = selectedIndex * itemHeight;
    isScrollingByCode.current = true;
    scrollRef.current?.scrollTo({ y: offset, animated: false });
    const t = setTimeout(() => { isScrollingByCode.current = false; }, 100);
    return () => clearTimeout(t);
  }, [selectedIndex, itemHeight]);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isScrollingByCode.current) return;
      const offset = e.nativeEvent.contentOffset.y;
      const index = Math.round(offset / itemHeight);
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      if (clamped !== selectedIndex) onIndexChange(clamped);
    },
    [itemHeight, items.length, onIndexChange, selectedIndex],
  );

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      {/* Center highlight band */}
      <View
        pointerEvents="none"
        style={[
          styles.highlightBand,
          {
            top: padding,
            height: itemHeight,
            backgroundColor: theme.utils.withOpacity(theme.colors.primary, 0.08),
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: theme.utils.withOpacity(theme.colors.primary, 0.2),
          },
        ]}
      />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: padding }}
      >
        {items.map((item, i) => {
          const isSelected = i === selectedIndex;
          return (
            <View key={item} style={[styles.item, { height: itemHeight }]}>
              <AppText
                style={[
                  styles.itemText,
                  {
                    color: isSelected
                      ? theme.colors.foreground
                      : theme.colors.mutedForeground,
                    fontWeight: isSelected ? "600" : "400",
                  },
                ]}
              >
                {item}
              </AppText>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  highlightBand: {
    position: "absolute",
    left: 0,
    right: 0,
    borderRadius: theme.radius.sm,
    zIndex: 0,
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    ...theme.typography.bodyLarge,
    fontSize: 18,
  },
}));
