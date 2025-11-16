#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

ENV_FILE=".env.development"

# Load dev env vars when available.
if [[ -f "$ENV_FILE" ]]; then
  echo "Loading environment variables from ${ENV_FILE}"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# Ensure ENVIRONMENT defaults to development locally.
export ENVIRONMENT="${ENVIRONMENT:-development}"

# Stop any running stack before cleaning/rebuilding.
echo "Stopping current containers..."
docker compose down --remove-orphans --volumes || true

# Remove dangling images/volumes to start fresh.
echo "Cleaning previous Docker artifacts..."
docker system prune --all --force --volumes

# Rebuild the services with the current sources.
echo "Building images..."
docker compose build

# Launch services in the foreground to stream logs.
echo "Starting stack (Ctrl+C to stop)..."
docker compose up --remove-orphans
