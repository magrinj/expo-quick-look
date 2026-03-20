import { Text, StyleSheet } from "react-native";

type Props = {
  message: string | null;
};

export function ErrorMessage({ message }: Props) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: {
    fontSize: 13,
    color: "#ff3b30",
    marginTop: 4,
    marginHorizontal: 16,
  },
});
