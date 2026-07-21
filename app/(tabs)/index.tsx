import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMqttStore } from "@/lib/store/mqtt-store";
import { subscribe, unsubscribe } from "@/lib/mqtt/client";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { TopicCard } from "@/components/TopicCard";

export default function DashboardScreen() {
  const [newTopic, setNewTopic] = useState("");
  const status = useMqttStore((s) => s.status);
  const subscribedTopics = useMqttStore((s) => s.subscribedTopics);
  const latest = useMqttStore((s) => s.latest);
  const history = useMqttStore((s) => s.history);

  const handleAddTopic = () => {
    const topic = newTopic.trim();
    if (!topic) return;
    subscribe(topic);
    setNewTopic("");
  };

  const cards = subscribedTopics.map((topic) => ({
    topic,
    message: latest[topic],
  }));

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <ConnectionBadge status={status} />
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Subscribe to topic e.g. sensors/temp"
          placeholderTextColor="#6B7280"
          value={newTopic}
          onChangeText={setNewTopic}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleAddTopic}
        />
        <Pressable style={styles.addButton} onPress={handleAddTopic}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.topic}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No topics yet. Subscribe to one above to see live data.
          </Text>
        }
        renderItem={({ item }) =>
          item.message ? (
            <TopicCard message={item.message} history={history[item.topic]} />
          ) : (
            <View style={styles.pendingCard}>
              <View style={styles.pendingRow}>
                <Text style={styles.pendingTopic}>{item.topic}</Text>
                <Pressable onPress={() => unsubscribe(item.topic)}>
                  <Text style={styles.remove}>remove</Text>
                </Pressable>
              </View>
              <Text style={styles.pendingWaiting}>waiting for data…</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1220" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: { color: "#F9FAFB", fontSize: 28, fontWeight: "700" },
  addRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  addButton: {
    backgroundColor: "#38BDF8",
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  addButtonText: { color: "#0B1220", fontWeight: "700" },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  empty: { color: "#6B7280", textAlign: "center", marginTop: 40 },
  pendingCard: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  pendingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendingTopic: { color: "#F9FAFB", fontSize: 14, fontWeight: "600" },
  pendingWaiting: { color: "#6B7280", fontSize: 12, marginTop: 6 },
  remove: { color: "#EF4444", fontSize: 12 },
});
