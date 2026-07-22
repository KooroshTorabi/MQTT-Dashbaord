# Building a Release APK Locally (no EAS, no external tools)

This produces a standalone, signed `.apk` you can send to any Android
device — no dev server, no Metro, no internet connection required to run it.

## Prerequisites

- Android Studio installed, with the SDK path known (usually `~/Android/Sdk`)
- JDK 17 or later (JDK 21 is fine)
- At least a few GB of free disk space

### Check your Java version
```bash
java -version
echo $JAVA_HOME
```
Both need to point at JDK 17+. If `JAVA_HOME` shows an older version even
though `java -version` shows a newer one, Gradle will still use the old one
— fix `JAVA_HOME` explicitly:
```bash
ls /usr/lib/jvm                     # find the JDK 17+ folder name
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64   # adjust to match
```
Make it permanent by adding that line to `~/.bashrc`, then `source ~/.bashrc`.

### Check your Android SDK is findable
```bash
ls ~/Android/Sdk
```
If Gradle can't find it, create `android/local.properties`:
```bash
echo "sdk.dir=$HOME/Android/Sdk" > android/local.properties
```

## 1. Generate a signing keystore (one-time, per app)

```bash
cd android/app
keytool -genkeypair -v -keystore release.keystore -alias mqtt-dashboard \
  -keyalg RSA -keysize 2048 -validity 10000
```

You'll be prompted for a password and some identity fields (name/org — can
be anything). This creates `release.keystore` in `android/app/`.

**Keep this file and its password safe.** Future updates to the same app
need the *same* keystore, or Android treats it as a different app entirely
and won't let you install over the old one.

## 2. Point Gradle at the keystore

Add to `android/gradle.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_KEY_ALIAS=mqtt-dashboard
MYAPP_RELEASE_STORE_PASSWORD=your_password_here
MYAPP_RELEASE_KEY_PASSWORD=your_password_here
```

In `android/app/build.gradle`, make sure `signingConfigs` and `buildTypes`
look like this (Expo's generated file already has a `debug` signing config
— add `release` as a **sibling**, not nested inside it, and **no comma**
between blocks — Groovy DSL blocks aren't a list):

```gradle
android {
    ...
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
            // ... (leave any existing minify/shrink/proguard lines as-is)
        }
    }
}
```

## 3. Build

```bash
cd android
./gradlew --stop        # clear any stale daemon from a previous failed build
./gradlew assembleRelease
cd ..
```

Output:
```
android/app/build/outputs/apk/release/app-release.apk
```

This file is fully standalone — signed, optimized, JS bundle embedded.
Send it anywhere (email, USB, cloud drive) and it installs independently.

## 4. Installing on another device

1. Transfer the `.apk` file to the phone
2. Tap it — Android prompts **"Install unknown apps"** the first time;
   allow it for that source (Files, Chrome, whatever was used)
3. It installs like any normal app

## 5. Keep secrets out of git

```bash
echo "android/app/release.keystore" >> .gitignore
echo "android/gradle.properties" >> .gitignore
```
The keystore and its passwords should never be committed.

## Troubleshooting quick reference

| Error mentions... | Cause | Fix |
|---|---|---|
| `Gradle requires JVM 17 or later` | `JAVA_HOME` points at an old JDK | Fix `JAVA_HOME`, see above |
| `SDK location not found` | Gradle can't find Android SDK | Create `android/local.properties` with `sdk.dir=...` |
| `Cannot lock file hash cache` | Stale Gradle daemon/cache from an interrupted build | `./gradlew --stop && rm -rf .gradle ~/.gradle/caches` |
| `Could not find method debug() for arguments [...]` | Stray comma or misplaced brace in `signingConfigs`/`buildTypes` | Check block structure matches example above exactly |
| Build fails with no clear reason, or hangs | Disk space | `df -h` — Android builds need several GB free scratch space |