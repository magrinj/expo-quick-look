import { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// eslint-disable-next-line import/no-unresolved
import ExpoQuickLook from "@magrinj/expo-quick-look";
import type {
  DismissEvent,
  EditedFileEvent,
  SavedEditedCopyEvent,
} from "@magrinj/expo-quick-look";
import { Section } from "../../components/Section";
import { Row } from "../../components/Row";
import { useEvents } from "../../lib/events";
import { resolveAssetPath } from "../../lib/assets";
import {
  TEST_SERVER,
  AUTH_TOKEN,
  REMOTE_PDF_URL,
  REMOTE_IMAGE_URL,
} from "../../lib/config";

const isIOS = Platform.OS === "ios";

export default function PreviewTab() {
  const { log } = useEvents();
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [results, setResults] = useState<Record<string, string>>({});
  const [editedCopyPath, setEditedCopyPath] = useState<string | null>(null);

  useEffect(() => {
    const sub1 = ExpoQuickLook.addListener("onDismiss", (_: DismissEvent) => {
      log("onDismiss");
    });
    const sub2 = ExpoQuickLook.addListener(
      "onEditedFile",
      (e: EditedFileEvent) => {
        log(`onEditedFile: ${e.filePath}`);
      }
    );
    const sub3 = ExpoQuickLook.addListener(
      "onSavedEditedCopy",
      (e: SavedEditedCopyEvent) => {
        log(
          `onSavedEditedCopy: original=${e.originalPath} edited=${e.editedPath}`
        );
        setEditedCopyPath(e.editedPath);
      }
    );
    return () => {
      sub1.remove();
      sub2.remove();
      sub3.remove();
    };
  }, [log]);

  const handleAction = useCallback(
    async (key: string, fn: () => Promise<void>) => {
      setErrors((prev) => ({ ...prev, [key]: null }));
      try {
        await fn();
      } catch (e: any) {
        setErrors((prev) => ({ ...prev, [key]: e.message }));
      }
    },
    []
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Card 1: Local Files */}
      <Section title="Local Files">
        <Row
          label="Preview PDF"
          onPress={() =>
            handleAction("localPdf", async () => {
              const path = await resolveAssetPath(
                require("../../assets/sample.pdf")
              );
              await ExpoQuickLook.previewFile({ uri: path });
              log("previewFile (local PDF) resolved");
            })
          }
          error={errors.localPdf}
        />
        <Row
          label="Preview Image"
          onPress={() =>
            handleAction("localImage", async () => {
              const path = await resolveAssetPath(
                require("../../assets/sample.png")
              );
              await ExpoQuickLook.previewFile({ uri: path });
              log("previewFile (local image) resolved");
            })
          }
          error={errors.localImage}
        />
        <Row
          label="Preview Text"
          onPress={() =>
            handleAction("localText", async () => {
              const path = await resolveAssetPath(
                require("../../assets/sample.txt")
              );
              await ExpoQuickLook.previewFile({ uri: path });
              log("previewFile (local text) resolved");
            })
          }
          error={errors.localText}
          isLast
        />
      </Section>

      {/* Card 2: Remote Files */}
      <Section title="Remote Files">
        <Row
          label="Public PDF"
          subtitle="pdfobject.com"
          onPress={() =>
            handleAction("remotePdf", async () => {
              log("Opening remote PDF...");
              await ExpoQuickLook.previewFile({ uri: REMOTE_PDF_URL });
              log("previewFile (remote PDF) resolved");
            })
          }
          error={errors.remotePdf}
        />
        <Row
          label="Public Image"
          subtitle="picsum.photos"
          onPress={() =>
            handleAction("remoteImage", async () => {
              log("Opening remote image...");
              await ExpoQuickLook.previewFile({ uri: REMOTE_IMAGE_URL });
              log("previewFile (remote image) resolved");
            })
          }
          error={errors.remoteImage}
          isLast
        />
      </Section>

      {/* Card 3: Multi-File Preview (iOS only) */}
      {isIOS && (
        <Section title="Multi-File Preview">
          <Row
            label="Preview 3 files"
            subtitle="PDF, image, and text"
            onPress={() =>
              handleAction("multiFile", async () => {
                const paths = await Promise.all([
                  resolveAssetPath(require("../../assets/sample.pdf")),
                  resolveAssetPath(require("../../assets/sample.png")),
                  resolveAssetPath(require("../../assets/sample.txt")),
                ]);
                await ExpoQuickLook.previewFiles({
                  uris: paths,
                  initialIndex: 0,
                });
                log("previewFiles resolved");
              })
            }
            error={errors.multiFile}
            isLast
          />
        </Section>
      )}

      {/* Card 4: Authenticated Files */}
      <Section title="Authenticated Files">
        <Row
          label="Protected PDF (with token)"
          subtitle={TEST_SERVER}
          onPress={() =>
            handleAction("authPdf", async () => {
              log("Opening protected PDF with Bearer token...");
              await ExpoQuickLook.previewFile({
                uri: `${TEST_SERVER}/document.pdf`,
                requestOptions: {
                  headers: { Authorization: AUTH_TOKEN },
                },
              });
              log("previewFile (auth PDF) resolved");
            })
          }
          error={errors.authPdf}
        />
        <Row
          label="API Endpoint (no extension)"
          subtitle="Content-Disposition filename"
          onPress={() =>
            handleAction("apiEndpoint", async () => {
              log("Opening API endpoint...");
              await ExpoQuickLook.previewFile({
                uri: `${TEST_SERVER}/api/v1/documents/download`,
                requestOptions: {
                  headers: { Authorization: AUTH_TOKEN },
                },
              });
              log("previewFile (API endpoint) resolved");
            })
          }
          error={errors.apiEndpoint}
        />
        <Row
          label="Without token (should fail)"
          subtitle="Expects 401 error"
          onPress={() =>
            handleAction("noAuth", async () => {
              log("Opening protected PDF WITHOUT token...");
              await ExpoQuickLook.previewFile({
                uri: `${TEST_SERVER}/document.pdf`,
              });
              log("previewFile (no auth) resolved");
            })
          }
          error={errors.noAuth}
          isLast
        />
      </Section>

      {/* Card 5: Editing / Markup (iOS only) */}
      {isIOS && (
        <Section title="Editing / Markup">
          <Row
            label="Edit image (create copy)"
            subtitle={
              editedCopyPath
                ? `Edited: ${editedCopyPath.split("/").pop()}`
                : "Creates a new file with edits"
            }
            onPress={() =>
              handleAction("editCopy", async () => {
                const path = await resolveAssetPath(
                  require("../../assets/sample.png")
                );
                await ExpoQuickLook.previewFile({
                  uri: path,
                  editingMode: "createCopy",
                });
                log("editing preview (createCopy) resolved");
              })
            }
            error={errors.editCopy}
          />
          {editedCopyPath && (
            <Row
              label="Open edited copy"
              subtitle={editedCopyPath.split("/").pop() ?? ""}
              onPress={() =>
                handleAction("openEdited", async () => {
                  await ExpoQuickLook.previewFile({ uri: editedCopyPath });
                  log("opened edited copy");
                })
              }
              error={errors.openEdited}
            />
          )}
          <Row
            label="Edit image (in-place)"
            subtitle="Modifies the original file"
            onPress={() =>
              handleAction("editInPlace", async () => {
                const path = await resolveAssetPath(
                  require("../../assets/sample.png")
                );
                await ExpoQuickLook.previewFile({
                  uri: path,
                  editingMode: "updateContents",
                });
                log("editing preview (updateContents) resolved");
              })
            }
            error={errors.editInPlace}
            isLast
          />
        </Section>
      )}

      {/* Card 6: Can Preview */}
      <Section title="Can Preview">
        <Row
          label="Check PDF"
          subtitle={results.canPdf ?? "Tap to check"}
          onPress={() =>
            handleAction("canPdf", async () => {
              const path = await resolveAssetPath(
                require("../../assets/sample.pdf")
              );
              const result = await ExpoQuickLook.canPreview(path);
              setResults((prev) => ({ ...prev, canPdf: `Result: ${result}` }));
              log(`canPreview(pdf): ${result}`);
            })
          }
          error={errors.canPdf}
        />
        <Row
          label="Check Remote URL"
          subtitle={results.canRemote ?? "Tap to check"}
          onPress={() =>
            handleAction("canRemote", async () => {
              const result = await ExpoQuickLook.canPreview(REMOTE_PDF_URL);
              setResults((prev) => ({
                ...prev,
                canRemote: `Result: ${result}`,
              }));
              log(`canPreview(remote): ${result}`);
            })
          }
          error={errors.canRemote}
        />
        <Row
          label="Check Unsupported"
          subtitle={results.canUnsupported ?? ".xyz extension"}
          onPress={() =>
            handleAction("canUnsupported", async () => {
              const result = await ExpoQuickLook.canPreview("/fake/file.xyz");
              setResults((prev) => ({
                ...prev,
                canUnsupported: `Result: ${result}`,
              }));
              log(`canPreview(.xyz): ${result}`);
            })
          }
          error={errors.canUnsupported}
          isLast
        />
      </Section>

      {/* Card 7: Android Options (Android only) */}
      {!isIOS && (
        <Section title="Android Options">
          <Row
            label="Custom chooser title"
            subtitle='chooserTitle: "Open document with"'
            onPress={() =>
              handleAction("chooser", async () => {
                const path = await resolveAssetPath(
                  require("../../assets/sample.pdf")
                );
                await ExpoQuickLook.previewFile({
                  uri: path,
                  chooserTitle: "Open document with",
                });
                log("previewFile (custom chooser) resolved");
              })
            }
            error={errors.chooser}
            isLast
          />
        </Section>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" },
  content: { padding: 16, paddingBottom: 40 },
});
