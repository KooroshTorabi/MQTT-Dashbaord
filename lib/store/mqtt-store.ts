import { create } from "zustand";

export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

export type TopicMessage = {
  topic: string;
  value: string;
  timestamp: number;
};

const MAX_HISTORY_POINTS = 50;

type MqttState = {
  status: ConnectionStatus;
  lastError: string | null;
  subscribedTopics: string[];
  // Latest value per topic, for cards/list views
  latest: Record<string, TopicMessage>;
  // Rolling numeric history per topic, for charts
  history: Record<string, { value: number; timestamp: number }[]>;

  setStatus: (status: ConnectionStatus) => void;
  setLastError: (message: string) => void;
  addSubscribedTopic: (topic: string) => void;
  removeSubscribedTopic: (topic: string) => void;
  receiveMessage: (topic: string, value: string) => void;
  clearAll: () => void;
};

export const useMqttStore = create<MqttState>((set, get) => ({
  status: "disconnected",
  lastError: null,
  subscribedTopics: [],
  latest: {},
  history: {},

  setStatus: (status) => set({ status }),

  setLastError: (message) => set({ lastError: message }),

  addSubscribedTopic: (topic) => {
    if (get().subscribedTopics.includes(topic)) return;
    set({ subscribedTopics: [...get().subscribedTopics, topic] });
  },

  removeSubscribedTopic: (topic) => {
    set({
      subscribedTopics: get().subscribedTopics.filter((t) => t !== topic),
    });
  },

  receiveMessage: (topic, value) => {
    const timestamp = Date.now();
    const latest = { ...get().latest, [topic]: { topic, value, timestamp } };

    const numeric = Number(value);
    let history = get().history;
    if (!Number.isNaN(numeric)) {
      const prevSeries = history[topic] ?? [];
      const nextSeries = [...prevSeries, { value: numeric, timestamp }].slice(
        -MAX_HISTORY_POINTS
      );
      history = { ...history, [topic]: nextSeries };
    }

    set({ latest, history });
  },

  clearAll: () => set({ latest: {}, history: {} }),
}));
