import { View, Text, StyleSheet } from "react-native";
import { ConnectionStatus } from "@/lib/store/mqtt-store";

const CONFIG: Record<ConnectionStatus, { color: string; label: string }> = {
  connected: { color: "#22C55E", label: "Connected" },
  connecting: { color: "#F59E0B", label: "Connecting…" },
  disconnected: { color: "#6B7280", label: "Disconnected" },
  error: { color: "#EF4444", label: "Error" },
};

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  const { color, label } = CONFIG[status];
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { color: "#E5E7EB", fontSize: 13, fontWeight: "500" },
});
