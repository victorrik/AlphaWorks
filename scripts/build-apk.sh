#!/usr/bin/env bash
# Genera el APK de release (JS embebido, instalable sin Metro) y lo copia a
# ~/Downloads con la versión del package.json.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"

version="$(node -p "require('./package.json').version")"
name="$(node -p "require('./package.json').name")"
downloads="${HOME}/Downloads"
out="android/app/build/outputs/apk/release/app-release.apk"
dest="${downloads}/${name}-${version}.apk"

echo "Building ${name} v${version} (release APK)..."
(cd android && ./gradlew assembleRelease)

[ -f "$out" ] || { echo "No se encontró el APK en $out" >&2; exit 1; }
mkdir -p "$downloads"
cp "$out" "$dest"
echo "APK copiado a: $dest"
