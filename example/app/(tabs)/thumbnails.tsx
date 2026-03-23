import { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ExpoQuickLook from "@magrinj/expo-quick-look";
import { Section } from "../../components/Section";
import { Row } from "../../components/Row";
import { useEvents } from "../../lib/events";
import { resolveAssetPath } from "../../lib/assets";

const isIOS = Platform.OS === "ios";

type Thumbnail = {
  uri: string;
  width: number;
  height: number;
  label: string;
};

export default function ThumbnailsTab() {
  const { log } = useEvents();
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);

  const handleAction = async (key: string, fn: () => Promise<void>) => {
    setErrors((prev) => ({ ...prev, [key]: null }));
    try {
      await fn();
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, [key]: e.message }));
    }
  };

  if (!isIOS) {
    return (
      <SafeAreaView style={styles.placeholder} edges={["top"]}>
        <Text style={styles.placeholderText}>
          Thumbnail generation is only available on iOS.
        </Text>
        <Text style={styles.placeholderSubtext}>
          This feature uses QLThumbnailGenerator which has no Android
          equivalent.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Section title="Generate Thumbnail">
          <Row
            label="From PDF"
            subtitle="200×200 default scale"
            onPress={() =>
              handleAction("thumbPdf", async () => {
                const path = await resolveAssetPath(
                  require("../../assets/sample.pdf"),
                );
                const result = await ExpoQuickLook.generateThumbnail({
                  uri: path,
                  size: { width: 200, height: 200 },
                });
                setThumbnails((prev) => [
                  ...prev,
                  {
                    uri: result.uri,
                    width: result.width,
                    height: result.height,
                    label: "PDF",
                  },
                ]);
                log(`thumbnail (PDF): ${result.width}×${result.height}`);
              })
            }
            error={errors.thumbPdf}
          />
          <Row
            label="From Image"
            subtitle="200×200 default scale"
            onPress={() =>
              handleAction("thumbImage", async () => {
                const path = await resolveAssetPath(
                  require("../../assets/sample.png"),
                );
                const result = await ExpoQuickLook.generateThumbnail({
                  uri: path,
                  size: { width: 200, height: 200 },
                });
                setThumbnails((prev) => [
                  ...prev,
                  {
                    uri: result.uri,
                    width: result.width,
                    height: result.height,
                    label: "Image",
                  },
                ]);
                log(`thumbnail (Image): ${result.width}×${result.height}`);
              })
            }
            error={errors.thumbImage}
          />
          <Row
            label="From PDF (@3x)"
            subtitle="200×200 at 3x scale"
            onPress={() =>
              handleAction("thumbPdf3x", async () => {
                const path = await resolveAssetPath(
                  require("../../assets/sample.pdf"),
                );
                const result = await ExpoQuickLook.generateThumbnail({
                  uri: path,
                  size: { width: 200, height: 200 },
                  scale: 3,
                });
                setThumbnails((prev) => [
                  ...prev,
                  {
                    uri: result.uri,
                    width: result.width,
                    height: result.height,
                    label: "PDF @3x",
                  },
                ]);
                log(`thumbnail (PDF @3x): ${result.width}×${result.height}`);
              })
            }
            error={errors.thumbPdf3x}
            isLast
          />
        </Section>

        {thumbnails.length > 0 && (
          <Section title="Generated Thumbnails">
            <View style={styles.grid}>
              {thumbnails.map((thumb, i) => (
                <Pressable
                  key={i}
                  style={styles.thumbItem}
                  onPress={() => {
                    ExpoQuickLook.previewFile({ uri: thumb.uri });
                    log(`previewing thumbnail: ${thumb.label}`);
                  }}
                >
                  <Image
                    source={{ uri: thumb.uri }}
                    style={styles.thumbImage}
                  />
                  <Text style={styles.thumbLabel}>{thumb.label}</Text>
                  <Text style={styles.thumbDims}>
                    {thumb.width}×{thumb.height}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Section>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" },
  content: { padding: 16, paddingBottom: 40 },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  placeholderText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#3c3c43",
    textAlign: "center",
  },
  placeholderSubtext: {
    fontSize: 15,
    color: "#8e8e93",
    textAlign: "center",
    marginTop: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  thumbItem: {
    alignItems: "center",
  },
  thumbImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#f2f2f7",
  },
  thumbLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3c3c43",
    marginTop: 4,
  },
  thumbDims: {
    fontSize: 11,
    color: "#8e8e93",
  },
});
