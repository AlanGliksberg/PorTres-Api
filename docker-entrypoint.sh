#!/bin/bash
set -euo pipefail

node build/server.js &
API_PID=$!

node build/workers/notifications.worker.js &
WORKER_PID=$!

graceful_shutdown() {
  kill -TERM "$API_PID" "$WORKER_PID" 2>/dev/null || true
  wait "$API_PID" 2>/dev/null || true
  wait "$WORKER_PID" 2>/dev/null || true
}

trap graceful_shutdown SIGINT SIGTERM

wait -n "$API_PID" "$WORKER_PID"
EXIT_CODE=$?
graceful_shutdown
exit "$EXIT_CODE"
