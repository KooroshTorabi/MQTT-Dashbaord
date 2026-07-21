import { View, Text, StyleSheet } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { TopicMessage } from "@/lib/store/mqtt-store";

export function TopicCard({
  message,
  history,
}: {
  message: TopicMessage;
  history?: { value: number; timestamp: number }[];
}) {
  const chartData = history?.map((h) => ({ value: h.value })) ?? [];
  const time = new Date(message.timestamp).toLocaleTimeString();

  return (
    <View style={styles.card}>
      <Text style={styles.topic} numberOfLines={1}>
        {message.topic}
      </Text>
      <Text style={styles.value}>{message.value}</Text>
      <Text style={styles.time}>updated {time}</Text>

      {chartData.length > 1 && (
        <View style={styles.chartWrap}>
          <LineChart
            data={chartData}
            height={60}
            thickness={2}
            color="#38BDF8"
            hideDataPoints
            hideYAxisText
            hideAxesAndRules
            curved
            areaChart
            startFillColor="#38BDF8"
            startOpacity={0.25}
            endOpacity={0}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1F2937",
  },
  topic: { color: "#9CA3AF", fontSize: 12, marginBottom: 4 },
  value: { color: "#F9FAFB", fontSize: 24, fontWeight: "700" },
  time: { color: "#6B7280", fontSize: 11, marginTop: 4 },
  chartWrap: { marginTop: 10 },
});
