#!/usr/bin/env sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repository_root=$(CDPATH= cd -- "$script_dir/.." && pwd)

cd "$repository_root/web/Navigator.Web"

npm ci
npm run lint
npm run typecheck
npm run test -- --run
npm run build
