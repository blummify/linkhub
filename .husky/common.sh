#!/usr/bin/env sh
# Husky runs hooks from the repo root, but paths can break in some setups.
cd "$(dirname "$0")/.." || exit 1
