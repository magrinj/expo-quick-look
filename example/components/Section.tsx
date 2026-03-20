import { View, Text, StyleSheet } from "react-native";
import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export function Section({ title, children }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6e6e73",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    marginTop: 16,
    marginHorizontal: 16,
  },
});
