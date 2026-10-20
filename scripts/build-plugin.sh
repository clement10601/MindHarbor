#!/usr/bin/env bash
# Builds dist/mindharbor-plugin.zip for the ChatGPT plugin directory.
# The skill text comes from skills/, so SKILL.md stays the single source.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
out="$root/dist/mindharbor-plugin"
zip_path="$root/dist/mindharbor-plugin.zip"

if grep -q REPLACE_WITH "$root/plugin/plugin.json"; then
  echo "plugin/plugin.json still has a placeholder (author.email). Fill it in first." >&2
  exit 1
fi

rm -rf "$out" "$zip_path"
mkdir -p "$out/skills/mindharbor/references"
cp "$root/plugin/plugin.json" "$out/"
cp -r "$root/plugin/assets" "$out/"
cp "$root/LICENSE" "$out/"

{
  cat "$root/plugin/skill-frontmatter.yml"
  echo
  echo "> 使用者用英文或其他非中文語言交談時，改依 \`references/en.md\` 的英文版規則回應。"
  echo
  cat "$root/skills/zh-TW/SKILL.md"
} > "$out/skills/mindharbor/SKILL.md"
cp "$root/skills/en/SKILL.md" "$out/skills/mindharbor/references/en.md"

(cd "$out" && zip -qr "$zip_path" .)
echo "Built $zip_path"
