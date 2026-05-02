import { AppText } from "@/components/ui/app-text";
import { X } from "lucide-react-native/icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  View,
} from "react-native";
import Pdf from "react-native-pdf";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type AppPdfViewerProps = {
  visible: boolean;
  uri: string;
  label?: string; // truncated filename
  sub?: string; // e.g. file size
  onClose: () => void;
};

export function AppPdfViewer({
  visible,
  uri,
  label,
  sub,
  onClose,
}: AppPdfViewerProps) {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleClose = () => {
    // State sıfırla sonraki açılış için
    setCurrentPage(1);
    setTotalPages(null);
    setLoading(true);
    setError(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        {/* ─── Top bar ─────────────────────────────────────────────── */}
        <View
          style={[
            styles.topBar,
            {
              paddingTop: insets.top + 8,
              backgroundColor: theme.colors.card,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <Pressable onPress={handleClose} hitSlop={12} style={styles.closeBtn}>
            <X size={22} color={theme.colors.foreground} />
          </Pressable>

          <AppText
            numberOfLines={1}
            style={[styles.topLabel, { color: theme.colors.foreground }]}
          >
            {label ?? ""}
          </AppText>

          {/* Sayfa sayacı — sağ tarafa hizalama için close butonuyla aynı genişlikte spacer */}
          <View style={styles.pageCounter}>
            {totalPages !== null && (
              <AppText
                style={[styles.pageText, { color: theme.colors.mutedForeground }]}
              >
                {currentPage} / {totalPages}
              </AppText>
            )}
          </View>
        </View>

        {/* ─── PDF ─────────────────────────────────────────────────── */}
        <View style={styles.pdfContainer}>
          {error ? (
            <View style={styles.centered}>
              <AppText style={{ color: theme.colors.mutedForeground }}>
                PDF yüklenemedi.
              </AppText>
            </View>
          ) : (
            <Pdf
              source={{ uri, cache: true }}
              page={1}
              fitPolicy={0}
              enableDoubleTapZoom
              enableAnnotationRendering
              spacing={Platform.OS === "android" ? 4 : 8}
              style={styles.pdf}
              onLoadComplete={(pages) => {
                setTotalPages(pages);
                setLoading(false);
              }}
              onPageChanged={(page) => {
                setCurrentPage(page);
              }}
              onError={() => {
                setLoading(false);
                setError(true);
              }}
            />
          )}

          {/* Loading overlay */}
          {loading && !error && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator
                size="large"
                color={theme.colors.mutedForeground}
              />
            </View>
          )}
        </View>

        {/* ─── Bottom bar ──────────────────────────────────────────── */}
        <View
          style={[
            styles.bottomBar,
            {
              paddingBottom: insets.bottom + 8,
              backgroundColor: theme.colors.card,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          {sub ? (
            <AppText
              style={[styles.bottomSub, { color: theme.colors.mutedForeground }]}
            >
              {sub}
            </AppText>
          ) : null}

          {totalPages !== null && (
            <AppText
              style={[styles.bottomPage, { color: theme.colors.mutedForeground }]}
            >
              Sayfa {currentPage} / {totalPages}
            </AppText>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
  },
  // ─── Top bar ───────────────────────────────────────────────────────
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm + 2,
    borderBottomWidth: 1,
    gap: theme.spacing.sm,
  },
  closeBtn: {
    padding: 4,
    width: 30,
  },
  topLabel: {
    flex: 1,
    textAlign: "center",
    ...theme.typography.bodyMedium,
    fontWeight: "600",
  },
  pageCounter: {
    width: 50,
    alignItems: "flex-end",
  },
  pageText: {
    ...theme.typography.bodySmall,
  },
  // ─── PDF container ─────────────────────────────────────────────────
  pdfContainer: {
    flex: 1,
  },
  pdf: {
    flex: 1,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  // ─── Bottom bar ────────────────────────────────────────────────────
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm + 2,
    borderTopWidth: 1,
    minHeight: 44,
  },
  bottomSub: {
    ...theme.typography.bodySmall,
  },
  bottomPage: {
    ...theme.typography.bodySmall,
  },
}));
