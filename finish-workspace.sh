#!/bin/bash
# 等待 Figma 插件恢复后自动完成：核验目标 -> 解除卡住的任务 -> 重新截图
cd "/e/figma插件和汉化" || exit 1
WEDGED=5487dc50-028e-4611-8690-543c17febbdc
TARGET=26:4589
deadline=$((SECONDS + 1800))

try_inspect() {
  local out iid ok i
  out=$(figma-local inspect --node "$TARGET" 2>&1)
  if echo "$out" | grep -q "RECONNECTING"; then return 1; fi
  iid=$(echo "$out" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
  [ -z "$iid" ] && return 1
  for i in $(seq 1 12); do
    if [ -f ".figma-agent/runs/$iid/result.json" ]; then
      ok=$(grep -o '"ok": [a-z]*' ".figma-agent/runs/$iid/result.json" | head -1)
      if echo "$ok" | grep -q true; then echo "$iid"; return 0; fi
      return 1
    fi
    sleep 10
  done
  return 1
}

while [ $SECONDS -lt $deadline ]; do
  if ! figma-local status 2>/dev/null | grep -q '"connected": true'; then sleep 20; continue; fi
  IID=$(try_inspect)
  if [ -z "$IID" ]; then echo "inspect attempt failed, retry in 30s"; sleep 30; continue; fi
  echo "inspect ok: $IID"
  echo "=== resolve ==="
  figma-local resolve "$WEDGED" --inspect "$IID" --previous-plugin-stopped 2>&1 | head -8
  echo "=== preview ==="
  PVID=""
  for i in $(seq 1 6); do
    out=$(figma-local preview --node "$TARGET" 2>&1)
    if echo "$out" | grep -q "RECONNECTING"; then sleep 10; continue; fi
    PVID=$(echo "$out" | grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4)
    break
  done
  if [ -z "$PVID" ]; then echo "preview not queued, retry in 20s"; sleep 20; continue; fi
  echo "preview job: $PVID"
  for i in $(seq 1 15); do
    if [ -f ".figma-agent/runs/$PVID/preview.png" ]; then echo "PNG READY: .figma-agent/runs/$PVID/preview.png"; exit 0; fi
    sleep 10
  done
  echo "preview png timeout, loop again"
  sleep 20
done
echo "TIMEOUT: workspace verification not completed in 30 minutes"
exit 1
