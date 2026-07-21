import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { publish, isConnected } from "@/lib/mqtt/client";

export default function PublishScreen() {
  const [topic, setTopic] = useState("");
  const [payload, setPayload] = useState("");
  const [retain, setRetain] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const handlePublish = () => {
    if (!isConnected()) {
      Alert.alert("Not connected", "Connect to a broker in Settings first.");
      return;
    }
    if (!topic.trim()) {
      Alert.alert("Missing topic", "Enter a topic to publish to.");
      return;
    }
    publish(topic.trim(), payload, retain);
    setLastSent(new Date().toLocaleTimeString());
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Publish</Text>

        <Text style={styles.label}>Topic</Text>
        <TextInput
          style={styles.input}
          placeholder="devices/lamp1/cmd"
          placeholderTextColor="#6B7280"
          value={topic}
          onChangeText={setTopic}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Payload</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder='{"state":"on"}  or  ON  or  42'
          placeholderTextColor="#6B7280"
          value={payload}
          onChangeText={setPayload}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.row}>
          <Text style={styles.label}>Retain message</Text>
          <Switch
            value={retain}
            onValueChange={setRetain}
            trackColor={{ false: "#1F2937", true: "#38BDF8" }}
          />
        </View>

        <Pressable style={styles.button} onPress={handlePublish}>
          <Text style={styles.buttonText}>Publish</Text>
        </Pressable>

        {lastSent && (
          <Text style={styles.sentText}>Last published at {lastSent}</Text>
        )}

        <View style={styles.presets}>
          <Text style={styles.label}>Quick payloads</Text>
          <View style={styles.presetRow}>
            {["ON", "OFF", "1", "0"].map((p) => (
              <Pressable
                key={p}
                style={styles.presetChip}
                onPress={() => setPayload(p)}
              >
                <Text style={styles.presetChipText}>{p}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  content: { padding: 20 },
  title: { color: "#F9FAFB", fontSize: 28, fontWeight: "700", marginBottom: 20 },
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
  multiline: { minHeight: 90, textAlignVertical: "top" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
  },
  button: {
    backgroundColor: "#38BDF8",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: { color: "#0B1220", fontWeight: "700", fontSize: 16 },
  sentText: { color: "#6B7280", fontSize: 12, marginTop: 10, textAlign: "center" },
  presets: { marginTop: 30 },
  presetRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  presetChip: {
    backgroundColor: "#111827",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  presetChipText: { color: "#E5E7EB", fontSize: 13 },
});
