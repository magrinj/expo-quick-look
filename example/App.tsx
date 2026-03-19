import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { Asset } from "expo-asset";
// eslint-disable-next-line import/no-unresolved
import ExpoQuickLook from "@magrinj/expo-quick-look";
import type {
  DismissEvent,
  EditedFileEvent,
  SavedEditedCopyEvent,
} from "@magrinj/expo-quick-look";

const isIOS = Platform.OS === "ios";
const TEST_SERVER = isIOS ? "http://10.5.1.102:3333" : "http://10.0.2.2:3333";

async function resolveAssetPath(module: number): Promise<string> {
  const [asset] = await Asset.loadAsync(module);
  if (!asset.localUri) throw new Error("Failed to load asset");
  return asset.localUri;
}

export default function App() {
  const [events, setEvents] = useState<string[]>([]);
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);
  const [canPreviewResult, setCanPreviewResult] = useState<string>("");

  const log = useCallback((msg: string) => {
    setEvents((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  }, []);

  useEffect(() => {
    const sub1 = ExpoQuickLook.addListener("onDismiss", (_: DismissEvent) => {
      log("onDismiss");
    });
    const sub2 = ExpoQuickLook.addListener("onEditedFile", (e: EditedFileEvent) => {
      log(`onEditedFile: ${e.filePath}`);
    });
    const sub3 = ExpoQuickLook.addListener("onSavedEditedCopy", (e: SavedEditedCopyEvent) => {
      log(`onSavedEditedCopy: ${e.editedPath}`);
    });
    return () => {
      sub1.remove();
      sub2.remove();
      sub3.remove();
    };
  }, []);

  const handlePreviewPDF = async () => {
    try {
      const path = await resolveAssetPath(require("./assets/sample.pdf"));
      await ExpoQuickLook.previewFile({ uri: path });
      log("previewFile resolved");
    } catch (e: any) {
      log(`Error: ${e.message}`);
    }
  };

  const handlePreviewRemotePDF = async () => {
    try {
      log("Opening remote PDF...");
      await ExpoQuickLook.previewFile({
        uri: "https://pdfobject.com/pdf/sample-3pp.pdf",
      });
      log("remote previewFile resolved");
    } catch (e: any) {
      log(`Error: ${e.message}`);
    }
  };

  const handlePreviewWithHeaders = async () => {
    try {
      log("Opening protected PDF with Bearer token...");
      await ExpoQuickLook.previewFile({
        uri: `${TEST_SERVER}/document.pdf`,
        requestOptions: {
          headers: {
            Authorization: "Bearer test-secret-token",
          },
        },
      });
      log("previewFile with headers resolved");
    } catch (e: any) {
      log(`Error: ${e.message}`);
    }
  };

  const handlePreviewApiEndpoint = async () => {
    try {
      log("Opening API endpoint (no file extension in URL)...");
      await ExpoQuickLook.previewFile({
        uri: `${TEST_SERVER}/api/v1/documents/download`,
        requestOptions: {
          headers: {
            Authorization: "Bearer test-secret-token",
          },
        },
      });
      log("previewFile API endpoint resolved");
    } catch (e: any) {
      log(`Error: ${e.message}`);
    }
  };

  const handlePreviewWithoutHeaders = async () => {
    try {
      log("Opening protected PDF WITHOUT token (should fail)...");
      await ExpoQuickLook.previewFile({
        uri: `${TEST_SERVER}/document.pdf`,
      });
      log("previewFile without headers resolved");
    } catch (e: any) {
      log(`Error: ${e.message}`);
    }
  };

  const handlePreviewMultiple = async () => {
    try {
      const paths = await Promise.all([
        resolveAssetPath(require("./assets/sample.pdf")),
        resolveAssetPath(require("./assets/sample.png")),
        resolveAssetPath(require("./assets/sample.txt")),
      ]);
      await ExpoQuickLook.previewFiles({ uris: paths, initialIndex: 0 });
      log("previewFiles resolved");
    } catch (e: any) {
      log(`Error: ${e.message}`);
    }
  };

  const handleCanPreview = async () => {
    try {
      const path = await resolveAssetPath(require("./assets/sample.pdf"));
      const result = await ExpoQuickLook.canPreview(path);
      setCanPreviewResult(`canPreview(pdf): ${result}`);
    } catch (e: any) {
      setCanPreviewResult(`Error: ${e.message}`);
    }
  };

  const handleEditingPreview = async () => {
    try {
      const path = await resolveAssetPath(require("./assets/sample.png"));
      await ExpoQuickLook.previewFile({
        uri: path,
        editingMode: "createCopy",
      });
      log("editing preview resolved");
    } catch (e: any) {
      log(`Error: ${e.message}`);
    }
  };

  const handleThumbnail = async () => {
    try {
      const path = await resolveAssetPath(require("./assets/sample.pdf"));
      const result = await ExpoQuickLook.generateThumbnail({
        uri: path,
        size: { width: 200, height: 200 },
      });
      setThumbnailUri(result.uri);
      log(`thumbnail: ${result.width}x${result.height}`);
    } catch (e: any) {
      log(`Error: ${e.message}`);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
          <Text style={styles.header}>expo-quick-look</Text>

          <Section title="Preview File">
            <Button title="Preview PDF (local)" onPress={handlePreviewPDF} />
            <View style={{ height: 8 }} />
            <Button title="Preview PDF (remote)" onPress={handlePreviewRemotePDF} />
            <View style={{ height: 8 }} />
            <Button title="Preview PDF (with headers)" onPress={handlePreviewWithHeaders} />
            <View style={{ height: 8 }} />
            <Button title="Preview API endpoint (no extension)" onPress={handlePreviewApiEndpoint} />
            <View style={{ height: 8 }} />
            <Button title="Preview PDF (no token — should fail)" onPress={handlePreviewWithoutHeaders} />
          </Section>

          {isIOS && (
            <Section title="Preview Multiple Files (iOS)">
              <Button title="Preview 3 files" onPress={handlePreviewMultiple} />
            </Section>
          )}

          <Section title="Can Preview">
            <Button title="Check PDF" onPress={handleCanPreview} />
            {canPreviewResult ? <Text style={styles.result}>{canPreviewResult}</Text> : null}
          </Section>

          {isIOS && (
            <Section title="Editing / Markup (iOS)">
              <Button title="Preview image with markup" onPress={handleEditingPreview} />
            </Section>
          )}

          {isIOS && (
            <Section title="Generate Thumbnail (iOS)">
              <Button title="Generate from PDF" onPress={handleThumbnail} />
              {thumbnailUri && (
                <Image source={{ uri: thumbnailUri }} style={styles.thumbnail} />
              )}
            </Section>
          )}

          <Section title="Events Log">
            {events.length === 0 && <Text style={styles.muted}>No events yet</Text>}
            {events.map((e, i) => (
              <Text key={i} style={styles.event}>{e}</Text>
            ))}
          </Section>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" },
  content: { padding: 16, paddingBottom: 40 },
  header: { fontSize: 28, fontWeight: "700", marginBottom: 16 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: "600", marginBottom: 12 },
  result: { marginTop: 8, fontSize: 14, color: "#333" },
  muted: { color: "#999", fontSize: 14 },
  event: { fontSize: 12, fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace", marginBottom: 4 },
  thumbnail: { width: 200, height: 200, marginTop: 12, borderRadius: 8 },
});
