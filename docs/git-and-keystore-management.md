# Managing the `android/` folder, keystore, and fresh clones

This project uses Expo's **managed workflow**. The `android/` (and `ios/`)
folders are *generated build artifacts*, not hand-written source code — they
get created by `expo prebuild` / `expo run:android` and can be regenerated
from `app.json` at any time. Because of that, they're gitignored.

This doc explains what that means in practice, and how to not lose your
signing keystore when folders get regenerated.

## What's in `.gitignore` and why

```gitignore
/android
/ios
```

These are excluded because:
- They're large, machine-generated, and would bloat the repo
- They can be perfectly recreated from `app.json` + your dependencies
- Committing them invites merge conflicts on generated boilerplate no one hand-edits directly under normal Expo workflow

## What happens on a fresh `git clone`

```bash
git clone <repo-url>
cd mqtt-dashboard
npm install
npx expo prebuild --platform android
```

`expo prebuild` regenerates a clean `android/` folder from scratch. This is
expected and normal — it's not there until you run this.

## ⚠️ The catch: manual Gradle edits don't survive regeneration

If you've made manual changes inside `android/` — like the release signing
config in `android/app/build.gradle` and `android/gradle.properties` (see
`docs/building-android-apk.md`) — those changes live *inside* the gitignored,
regenerable folder. A fresh `prebuild` will **not** include them.

**After every fresh `prebuild`, you need to reapply:**
1. Copy your `release.keystore` file back into `android/app/`
2. Re-add the `MYAPP_RELEASE_*` entries to `android/gradle.properties`
3. Re-add the `release` block inside `signingConfigs` in `android/app/build.gradle`

Full step-by-step for all three is in `docs/building-android-apk.md`.

## ⚠️ The keystore itself must be backed up separately — never rely on git or the android/ folder for it

Your `release.keystore` file is a **real cryptographic identity**. It:
- Cannot be regenerated — if lost, you can never sign an update to this exact app again on devices that already have it installed
- Should **never** be committed to a public (or even private) git repo — it's a secret, equivalent to a password
- Lives inside the gitignored `android/` folder, so it will NOT survive if you delete `android/` and re-run `prebuild` without backing it up first

### Recommended: keep the keystore in a stable location outside `android/`

```bash
mkdir -p credentials
cp android/app/release.keystore credentials/release.keystore
echo "credentials/" >> .gitignore
```

This puts it somewhere that:
- Won't get wiped out by `rm -rf android && npx expo prebuild`
- Is still excluded from git (check your `.gitignore` includes `credentials/`)

**Then also back it up somewhere outside your machine entirely** — a
password manager (as a file attachment), an encrypted USB drive, or a
private cloud folder. If your laptop dies and this file only lived in
`credentials/` locally, it's gone for good.

## Quick reference: full setup on a brand-new machine

```bash
git clone <repo-url>
cd mqtt-dashboard
npm install
npx expo prebuild --platform android

# Restore your keystore from backup
cp /path/to/your/backup/release.keystore android/app/release.keystore

# Recreate android/gradle.properties signing entries (see docs/building-android-apk.md)
# Recreate the signingConfigs.release block in android/app/build.gradle (see docs/building-android-apk.md)

cd android
./gradlew assembleRelease
```