# MQTT Dashboard (Expo Router + TypeScript)

A starter React Native app for reading and writing MQTT data, built for
someone coming from React / Next.js.

## What's inside

- **Expo Router** — file-based navigation, same mental model as Next.js
- **MQTT.js** over WebSockets — connects to any broker with a `ws://`/`wss://` listener
- **Zustand** — `lib/store/mqtt-store.ts` holds live message state, `lib/store/settings-store.ts` holds broker connection settings (persisted via `expo-secure-store`)
- **react-native-gifted-charts** — sparklines on each topic card for numeric data
- Three tabs: **Dashboard** (read/subscribe), **Publish** (write), **Settings** (broker connection)

## Setup

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android), or press `i` / `a` for a simulator.

By default it's pointed at the public `test.mosquitto.org` broker over
WebSockets so you can see it working immediately — go to the **Settings**
tab, hit **Connect**, then on **Dashboard** subscribe to a topic like
`test/topic`. Publish to the same topic from the **Publish** tab and watch
it appear live.

⚠️ The test broker is public — anyone can read/write to it. Don't send
anything sensitive, and switch to your own broker before doing anything real.

## Connecting to your own broker

Your broker needs an MQTT-over-**WebSocket** listener (not just the usual
raw TCP port 1883/8883). Most brokers support this on a separate port:

- Mosquitto: add a `listener 8080` + `protocol websockets` block to `mosquitto.conf`
- EMQX / HiveMQ Cloud: WebSocket listener is usually enabled by default, check the console for the `wss://` URL

Enter that URL in Settings, e.g.:
```
wss://your-broker.example.com:8084/mqtt
```

## Project structure

```
app/
  _layout.tsx           # root layout
  (tabs)/
    _layout.tsx          # tab bar
    index.tsx            # Dashboard (read)
    publish.tsx           # Publish (write)
    settings.tsx          # Broker connection
lib/
  mqtt/client.ts          # MQTT.js wrapper - swap transport here later
  store/mqtt-store.ts      # live message + connection state
  store/settings-store.ts  # persisted broker credentials
components/
  ConnectionBadge.tsx
  TopicCard.tsx
```

## Known limitations / next steps

- **No raw TCP MQTT** — this uses WebSockets, which is the easiest path in
  plain Expo. If you need TCP-only brokers or better background reliability,
  look at native modules like `expo-mqtt` or `rn-native-mqtt` — you'd only
  need to rewrite `lib/mqtt/client.ts`, the store and screens stay the same.
- **No background updates** — when the app is backgrounded, the connection
  will drop and reconnect on foreground (standard mobile OS behavior).
- **No JSON payload parsing** — `TopicCard` shows raw string values; if your
  devices send JSON, you'll want to parse and pick a field to display.
- **No topic persistence** — subscribed topics reset when the app restarts;
  add them to `settings-store.ts` if you want them to stick around.

## Tasks to do

- [ ] Add JSON payload parsing and field selection for topic cards.
- [ ] Persist subscribed topics between app launches.
- [ ] Add validation and clearer error messages for broker settings.
- [ ] Support authenticated MQTT connections, including TLS certificates where needed.
- [ ] Add reconnect status, retry controls, and connection diagnostics.
- [ ] Add the ability to remove, rename, and organize subscribed topics.
- [ ] Add tests for the MQTT client and Zustand stores.
- [ ] Document production deployment and configuration steps.
