import { Pressable, Text, View, StyleSheet } from "react-native";
import { ErrorMessage } from "./ErrorMessage";

type Props = {
  label: string;
  subtitle?: string;
  onPress: () => void;
  error?: string | null;
  isLast?: boolean;
};

export function Row({ label, subtitle, onPress, error, isLast }: Props) {
  return (
    <View>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.content}>
          <Text style={styles.label}>{label}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
      <ErrorMessage message={error ?? null} />
      {!isLast && <View style={styles.separator} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  pressed: {
    backgroundColor: "#f2f2f7",
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: 17,
    color: "#000",
  },
  subtitle: {
    fontSize: 13,
    color: "#8e8e93",
    marginTop: 2,
  },
  chevron: {
    fontSize: 20,
    color: "#c7c7cc",
    marginLeft: 8,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#c6c6c8",
    marginLeft: 16,
  },
});
