import { X } from "lucide-react-native/icons";
import GalleryPreview from "react-native-gallery-preview";
import type { GalleryOverlayProps } from "react-native-gallery-preview/lib/typescript/types";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/app-text";

// ─── Public types ─────────────────────────────────────────────────────────────

export type ImageViewerItem = {
  uri: string;
  label?: string; // filename shown at bottom
  sub?: string; // e.g. file size shown at bottom right
};

type AppImageViewerProps = {
  isVisible: boolean;
  images: ImageViewerItem[];
  initialIndex?: number;
  onClose: () => void;
};

// ─── Overlay ──────────────────────────────────────────────────────────────────

function ImageViewerOverlay({
  onClose,
  currentImageIndex,
  imagesLength,
  images,
}: GalleryOverlayProps & { images: ImageViewerItem[] }) {
  const insets = useSafeAreaInsets();
  const current = images[currentImageIndex];

  return (
    <>
      {/* Top bar */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          backgroundColor: "rgba(0,0,0,0.45)",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/* Close button */}
        <Pressable
          onPress={onClose}
          hitSlop={12}
          style={{ padding: 4 }}
        >
          <X size={22} color="#fff" />
        </Pressable>

        {/* Counter */}
        {imagesLength > 1 && (
          <AppText
            style={{
              flex: 1,
              textAlign: "center",
              color: "#fff",
              fontSize: 15,
              fontWeight: "600",
            }}
          >
            {currentImageIndex + 1} / {imagesLength}
          </AppText>
        )}

        {/* Spacer to balance close button on the left */}
        {imagesLength > 1 && <View style={{ width: 30 }} />}
      </View>

      {/* Bottom bar */}
      {(current?.label || current?.sub) && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: insets.bottom + 8,
            paddingTop: 12,
            paddingHorizontal: 16,
            backgroundColor: "rgba(0,0,0,0.45)",
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          {current.label && (
            <AppText
              numberOfLines={1}
              style={{ flex: 1, color: "#fff", fontSize: 14 }}
            >
              {current.label}
            </AppText>
          )}
          {current.sub && (
            <AppText
              style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}
            >
              {current.sub}
            </AppText>
          )}
        </View>
      )}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AppImageViewer({
  isVisible,
  images,
  initialIndex = 0,
  onClose,
}: AppImageViewerProps) {
  if (!isVisible || images.length === 0) return null;

  return (
    <GalleryPreview
      isVisible={isVisible}
      onRequestClose={onClose}
      images={images.map((img) => ({ uri: img.uri }))}
      initialIndex={initialIndex}
      OverlayComponent={(overlayProps) => (
        <ImageViewerOverlay
          {...overlayProps}
          images={images}
        />
      )}
    />
  );
}
