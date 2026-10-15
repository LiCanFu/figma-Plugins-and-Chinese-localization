#!/bin/bash
# 一次性守望：Figma 窗口切到前台（pollAgeMs<5s）后自动完成
#   1) 运行工作台截图  2) inspect+resolve 解除卡死任务  3) 生成「关键状态」页并截图
cd "/e/figma插件和汉化" || exit 1
WEDGED=5487dc50-028e-4611-8690-543c17febbdc
WS=26:4589
DEADLINE=$((SECONDS + 14400))

fresh() {
  local st age
  st=$(figma-local status 2>/dev/null)
  echo "$st" | grep -q '"connected": true' || return 1
  age=$(echo "$st" | grep -o '"pollAgeMs": *[0-9]*' | head -1 | grep -o '[0-9]*$')
  [ -n "$age" ] && [ "$age" -lt 5000 ]
}

jobid() { grep -o '"id": "[^"]*"' | head -1 | cut -d'"' -f4; }

unresolved_list() {
  figma-local status 2>/dev/null | tr -d '\n' \
    | grep -o '"unresolved": \[[^]]*\]' \
    | grep -o '[0-9a-f]\{8\}-[0-9a-f-]*'
}

wait_result() { # $1=jobid $2=tries(10s each); echoes ok|fail|timeout
  local i
  for i in $(seq 1 "$2"); do
    if [ -f ".figma-agent/runs/$1/result.json" ]; then
      if grep -q '"ok": true' ".figma-agent/runs/$1/result.json"; then echo ok; else echo fail; fi
      return 0
    fi
    sleep 10
  done
  echo timeout
}

wait_png() { # $1=jobid $2=tries(5s each)
  local i
  for i in $(seq 1 "$2"); do
    [ -f ".figma-agent/runs/$1/preview.png" ] && return 0
    sleep 5
  done
  return 1
}

STAGE=ws_preview
echo "watcher started, stage=$STAGE"
while [ $SECONDS -lt $DEADLINE ]; do
  if ! fresh; then sleep 15; continue; fi
  case "$STAGE" in
  ws_preview)
    OUT=$(figma-local preview --node "$WS" 2>&1)
    echo "$OUT" | grep -q RECONNECTING && { sleep 15; continue; }
    ID=$(echo "$OUT" | jobid)
    [ -z "$ID" ] && { echo "preview not queued: $(echo "$OUT" | head -2)"; sleep 20; continue; }
    echo "preview job: $ID"
    R=$(wait_result "$ID" 30)
    if wait_png "$ID" 12; then
      echo "WORKSPACE_PNG .figma-agent/runs/$ID/preview.png"
      STAGE=resolve
    else
      echo "preview $R but no png, retry"
      sleep 20
    fi
    ;;
  resolve)
    OUT=$(figma-local inspect --node "$WS" 2>&1)
    echo "$OUT" | grep -q RECONNECTING && { sleep 15; continue; }
    IID=$(echo "$OUT" | jobid)
    [ -z "$IID" ] && { echo "inspect not queued: $(echo "$OUT" | head -2)"; sleep 20; continue; }
    R=$(wait_result "$IID" 18)
    [ "$R" = ok ] || { echo "inspect $R, retry"; sleep 20; continue; }
    echo "inspect ok: $IID, resolving $WEDGED"
    figma-local resolve "$WEDGED" --inspect "$IID" --previous-plugin-stopped 2>&1 | head -6
    if [ -n "$(unresolved_list)" ]; then
      echo "still unresolved: $(unresolved_list | tr '\n' ' ')"
      sleep 20
    else
      echo "RESOLVED"
      STAGE=states_run
    fi
    ;;
  states_run)
    if [ -n "$(unresolved_list)" ]; then
      echo "unresolved appeared again, back to resolve"
      STAGE=resolve
      continue
    fi
    OUT=$(figma-local run agent-states.js --node "$WS" 2>&1)
    echo "$OUT" | grep -q RECONNECTING && { sleep 15; continue; }
    ID=$(echo "$OUT" | jobid)
    [ -z "$ID" ] && { echo "run not queued: $(echo "$OUT" | head -2)"; sleep 25; continue; }
    echo "states run job: $ID"
    R=$(wait_result "$ID" 36)
    [ "$R" = ok ] || { echo "states run $R, retry"; sleep 20; continue; }
    FID=$(grep -o '"frameId": "[^"]*"' ".figma-agent/runs/$ID/result.json" | head -1 | cut -d'"' -f4)
    [ -z "$FID" ] && { echo "no frameId in states result"; STAGE=done; break; }
    echo "states frame: $FID"
    OUT=$(figma-local preview --node "$FID" 2>&1)
    PID=$(echo "$OUT" | jobid)
    [ -z "$PID" ] && { echo "states preview not queued"; STAGE=done; break; }
    wait_result "$PID" 30 > /dev/null
    if wait_png "$PID" 12; then
      echo "STATES_PNG .figma-agent/runs/$PID/preview.png"
    else
      echo "states png missing"
    fi
    STAGE=done
    ;;
  done)
    echo "ALL DONE"
    exit 0
    ;;
  esac
done
echo "TIMEOUT stage=$STAGE"
exit 1
