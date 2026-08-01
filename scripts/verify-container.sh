#!/usr/bin/env sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repository_root=$(CDPATH= cd -- "$script_dir/.." && pwd)
compose_file="$repository_root/deploy/compose.yaml"
project_name=${NAVIGATOR_COMPOSE_PROJECT:-navigator-smoke-$$}
smoke_port=${NAVIGATOR_SMOKE_PORT:-18080}
smoke_image=${NAVIGATOR_SMOKE_IMAGE:-navigator:smoke-$$}
response_body=$(mktemp "${TMPDIR:-/tmp}/navigator-smoke.XXXXXX")
started=false

cleanup() {
    status=$?
    trap - EXIT
    if [ "$status" -ne 0 ] && [ "$started" = true ]; then
        docker compose --project-name "$project_name" --file "$compose_file" logs --no-color navigator || true
    fi
    docker compose --project-name "$project_name" --file "$compose_file" down --remove-orphans >/dev/null 2>&1 || true
    rm -f "$response_body"
    exit "$status"
}
trap cleanup EXIT

command -v docker >/dev/null 2>&1 || {
    echo "Docker is required but was not found on PATH." >&2
    exit 1
}
docker info >/dev/null 2>&1 || {
    echo "Docker is installed, but the Docker daemon is unavailable." >&2
    exit 1
}
docker compose version >/dev/null 2>&1 || {
    echo "The Docker Compose plugin is required but unavailable." >&2
    exit 1
}
command -v curl >/dev/null 2>&1 || {
    echo "curl is required for container HTTP verification." >&2
    exit 1
}

cd "$repository_root"
export NAVIGATOR_IMAGE="$smoke_image"
export NAVIGATOR_BIND_ADDRESS=127.0.0.1
export NAVIGATOR_HTTP_PORT="$smoke_port"

docker compose --project-name "$project_name" --file "$compose_file" config --quiet
docker compose --project-name "$project_name" --file "$compose_file" build navigator
docker compose --project-name "$project_name" --file "$compose_file" up --detach --no-build navigator
started=true

container_id=$(docker compose --project-name "$project_name" --file "$compose_file" ps --quiet navigator)
if [ -z "$container_id" ]; then
    echo "Compose did not create the Navigator container." >&2
    exit 1
fi

attempt=1
while [ "$attempt" -le 60 ]; do
    health=$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}missing{{end}}' "$container_id")
    [ "$health" = healthy ] && break
    if [ "$health" = unhealthy ] || [ "$health" = missing ]; then
        echo "Navigator container health status is '$health'." >&2
        exit 1
    fi
    attempt=$((attempt + 1))
    sleep 2
done
[ "$health" = healthy ] || {
    echo "Navigator did not become healthy within 120 seconds (last status: '$health')." >&2
    exit 1
}

base_url="http://127.0.0.1:$smoke_port"
check_request() {
    path=$1
    expected_status=$2
    expect_html=${3:-false}
    result=$(curl --silent --show-error --connect-timeout 5 --max-time 10 --output "$response_body" --write-out '%{http_code}|%{content_type}' "$base_url$path")
    status=${result%%|*}
    content_type=${result#*|}
    [ "$status" = "$expected_status" ] || {
        echo "GET $path returned HTTP $status; expected $expected_status." >&2
        exit 1
    }
    if [ "$expect_html" = true ]; then
        case "$content_type" in
            text/html*) ;;
            *) echo "GET $path returned '$content_type'; expected HTML." >&2; exit 1 ;;
        esac
        grep -q '<div id="root"></div>' "$response_body" || {
            echo "GET $path did not return the Navigator SPA entry document." >&2
            exit 1
        }
    fi
    echo "GET $path -> HTTP $status"
}

check_request /health/live 200
check_request /health/ready 200
check_request / 200 true
check_request /registries 200 true
check_request /sessions 200 true
check_request /api/does-not-exist 404
check_request /health/does-not-exist 404

runtime_uid=$(docker compose --project-name "$project_name" --file "$compose_file" exec --no-TTY navigator id -u)
[ "$runtime_uid" != 0 ] || {
    echo "Navigator is running as root (UID 0)." >&2
    exit 1
}
running_id=$(docker compose --project-name "$project_name" --file "$compose_file" ps --quiet --status running navigator)
[ "$running_id" = "$container_id" ] || {
    echo "Navigator did not remain running after smoke requests." >&2
    exit 1
}

echo "Navigator container is healthy, serves the SPA and health endpoints, reserves server namespaces, and runs as UID $runtime_uid."
