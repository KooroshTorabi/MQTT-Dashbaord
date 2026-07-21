import mqtt, { MqttClient, IClientOptions } from "mqtt";
import { useMqttStore } from "@/lib/store/mqtt-store";

export type BrokerConfig = {
  /** e.g. "wss://broker.example.com:8084/mqtt" or "ws://test.mosquitto.org:8080/mqtt" */
  url: string;
  username?: string;
  password?: string;
  clientId?: string;
};

let client: MqttClient | null = null;

function randomClientId() {
  return "rn-dashboard-" + Math.random().toString(16).slice(2, 10);
}

/**
 * Connects to the broker over WebSockets (ws:// or wss://).
 * Swap this file's internals for a native module (e.g. expo-mqtt / rn-native-mqtt)
 * later without touching any screen — the store contract stays the same.
 */
export function connect(config: BrokerConfig) {
  const store = useMqttStore.getState();

  if (client) {
    client.end(true);
    client = null;
  }

  store.setStatus("connecting");

  const options: IClientOptions = {
    clientId: config.clientId || randomClientId(),
    username: config.username || undefined,
    password: config.password || undefined,
    reconnectPeriod: 3000,
    connectTimeout: 8000,
    clean: true,
  };

  client = mqtt.connect(config.url, options);

  client.on("connect", () => {
    store.setStatus("connected");
    // Re-subscribe to any topics the user had active before reconnecting
    const topics = useMqttStore.getState().subscribedTopics;
    topics.forEach((topic) => client?.subscribe(topic, { qos: 0 }));
  });

  client.on("reconnect", () => store.setStatus("connecting"));

  client.on("close", () => store.setStatus("disconnected"));

  client.on("error", (err) => {
    store.setStatus("error");
    store.setLastError(err.message);
  });

  client.on("message", (topic, payload) => {
    store.receiveMessage(topic, payload.toString());
  });
}

export function disconnect() {
  client?.end(true);
  client = null;
  useMqttStore.getState().setStatus("disconnected");
}

export function subscribe(topic: string) {
  useMqttStore.getState().addSubscribedTopic(topic);
  client?.subscribe(topic, { qos: 0 });
}

export function unsubscribe(topic: string) {
  useMqttStore.getState().removeSubscribedTopic(topic);
  client?.unsubscribe(topic);
}

export function publish(topic: string, payload: string, retain = false) {
  client?.publish(topic, payload, { qos: 0, retain });
}

export function isConnected() {
  return client?.connected ?? false;
}
