import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "mqtt-broker-settings";

export type BrokerSettings = {
  url: string; // e.g. wss://broker.example.com:8084/mqtt
  username: string;
  password: string;
};

const DEFAULT_SETTINGS: BrokerSettings = {
  // Public test broker over WebSockets — good for getting connected on day one.
  url: "wss://test.mosquitto.org:8081/mqtt",
  username: "",
  password: "",
};

type SettingsState = {
  settings: BrokerSettings;
  loaded: boolean;
  load: () => Promise<void>;
  update: (partial: Partial<BrokerSettings>) => Promise<void>;
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  load: async () => {
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        set({ settings: JSON.parse(raw), loaded: true });
        return;
      }
    } catch {
      // fall through to defaults
    }
    set({ loaded: true });
  },

  update: async (partial) => {
    const next = { ...get().settings, ...partial };
    set({ settings: next });
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next));
  },
}));
