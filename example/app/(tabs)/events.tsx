import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Section } from "../../components/Section";
import { useEvents } from "../../lib/events";

export default function EventsTab() {
  const { events, clear } = useEvents();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Section title="Event Log">
        <View style={styles.header}>
          <Text style={styles.count}>
            {events.length} event{events.length !== 1 ? "s" : ""}
          </Text>
          {events.length > 0 && (
            <Pressable onPress={clear}>
              <Text style={styles.clearButton}>Clear</Text>
            </Pressable>
          )}
        </View>
        {events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No events yet</Text>
            <Text style={styles.emptySubtext}>
              Preview a file from the Preview tab to see events appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.logList}>
            {events.map((event, i) => (
              <Text key={i} style={styles.logEntry}>
                {event}
              </Text>
            ))}
          </View>
        )}
      </Section>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f7" },
  content: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  count: {
    fontSize: 13,
    color: "#8e8e93",
  },
  clearButton: {
    fontSize: 15,
    color: "#007aff",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 17,
    color: "#8e8e93",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#aeaeb2",
    textAlign: "center",
    marginTop: 4,
  },
  logList: {
    padding: 12,
  },
  logEntry: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    color: "#3c3c43",
    marginBottom: 4,
  },
});
