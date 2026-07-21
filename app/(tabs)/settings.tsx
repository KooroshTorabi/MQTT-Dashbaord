import { useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettingsStore } from "@/lib/store/settings-store";
import { useMqttStore } from "@/lib/store/mqtt-store";
import { connect, disconnect } from "@/lib/mqtt/client";
import { ConnectionBadge } from "@/components/ConnectionBadge";

export default function SettingsScreen() {
  const { settings, loaded, load, update } = useSettingsStore();
  const status = useMqttStore((s) => s.status);
  const lastError = useMqttStore((s) => s.lastError);

  useEffect(() => {
    load();
  }, []);

  const handleConnect = () => {
    connect({
      url: settings.url,
      username: settings.username || undefined,
      password: settings.password || undefined,
    });
  };

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.statusRow}>
          <ConnectionBadge status={status} />
        </View>
        {lastError && status === "error" && (
          <Text style={styles.error}>{lastError}</Text>
        )}

        <Text style={styles.label}>Broker WebSocket URL</Text>
        <TextInput
          style={styles.input}
          placeholder="wss://broker.example.com:8084/mqtt"
          placeholderTextColor="#6B7280"
          value={settings.url}
          onChangeText={(url) => update({ url })}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Username (optional)</Text>
        <TextInput
          style={styles.input}
          value={settings.username}
          onChangeText={(username) => update({ username })}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Password (optional)</Text>
        <TextInput
          style={styles.input}
          value={settings.password}
          onChangeText={(password) => update({ password })}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.buttonRow}>
          <Pressable style={styles.connectButton} onPress={handleConnect}>
            <Text style={styles.connectButtonText}>Connect</Text>
          </Pressable>
          <Pressable style={styles.disconnectButton} onPress={disconnect}>
            <Text style={styles.disconnectButtonText}>Disconnect</Text>
          </Pressable>
        </View>

        <Text style={styles.hint}>
          Using the public test.mosquitto.org broker by default — anyone can
          read/write to it, so don't send anything sensitive. Swap in your
          own broker's WebSocket URL (must support MQTT over ws:// or wss://)
          once you're ready.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  content: { padding: 20 },
  title: { color: "#F9FAFB", fontSize: 28, fontWeight: "700", marginBottom: 16 },
  statusRow: { marginBottom: 8 },
  error: { color: "#EF4444", fontSize: 12, marginBottom: 8 },
  label: { color: "#9CA3AF", fontSize: 13, marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  buttonRow: { flexDirection: "row", gap: 10, marginTop: 24 },
  connectButton: {
    flex: 1,
    backgroundColor: "#38BDF8",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  connectButtonText: { color: "#0B1220", fontWeight: "700" },
  disconnectButton: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  disconnectButtonText: { color: "#E5E7EB", fontWeight: "700" },
  hint: { color: "#6B7280", fontSize: 12, marginTop: 20, lineHeight: 18 },
});
