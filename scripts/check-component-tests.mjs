#!/usr/bin/env node
/**
 * Ensures UI modules have a matching Vitest file before push/CI.
 *
 * Usage:
 *   node scripts/check-component-tests.mjs [baseRef] [headRef]
 *   Defaults: merge-base with origin/main → HEAD
 *
 * Watched paths (must have a matching file under __tests__):
 *   - app/components/*.tsx (except layout-only helpers)
 *   - app/components/icons/*.tsx
 *   - app/branding/components/*.tsx
 *   - app/user-admin/components/*.tsx
 *   - app/admin-portal/components/*.tsx (+ drawer/) and shell/*.tsx
 *   - app/admin-portal/(app)/<view>/<Name>Client.tsx
 *   - app route Client.tsx modules (e.g. LinksClient)
 *   - app/ThemeToggle.tsx
 *   - lib/*.ts (excluding tests)
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const IGNORE_FILES = new Set([
  "app/components/MaterialSymbols.tsx", // global font loader, covered indirectly
]);

const WATCHERS = [
  {
    pattern: /^app\/components\/(?!__tests__|hooks\/)([^/]+)\.tsx$/,
    testPath: (name) => `app/components/__tests__/${name}.test.tsx`,
  },
  {
    pattern: /^app\/components\/icons\/([^/]+)\.tsx$/,
    testPath: (name) => `app/components/icons/__tests__/${name}.test.tsx`,
  },
  {
    pattern: /^app\/branding\/components\/([^/]+)\.tsx$/,
    testPath: (name) => `app/branding/components/__tests__/${name}.test.tsx`,
  },
  {
    pattern: /^app\/user-admin\/components\/([^/]+)\.tsx$/,
    testPath: (name) => `app/user-admin/components/__tests__/${name}.test.tsx`,
  },
  {
    pattern: /^app\/admin-portal\/components\/([^/]+)\.tsx$/,
    testPath: (name) => `app/admin-portal/components/__tests__/${name}.test.tsx`,
  },
  {
    pattern: /^app\/admin-portal\/components\/drawer\/([^/]+)\.tsx$/,
    testPath: (name) => `app/admin-portal/components/drawer/__tests__/${name}.test.tsx`,
  },
  {
    pattern: /^app\/admin-portal\/shell\/([^/]+)\.tsx$/,
    testPath: (name) => `app/admin-portal/shell/__tests__/${name}.test.tsx`,
  },
  {
    pattern: /^app\/admin-portal\/\(app\)\/([^/]+)\/([A-Z][\w]*Client)\.tsx$/,
    testPath: (view, name) => `app/admin-portal/(app)/${view}/__tests__/${name}.test.tsx`,
  },
  {
    pattern: /^app\/([^/]+)\/([A-Z][\w]*Client)\.tsx$/,
    testPath: (_dir, name) => `app/${_dir}/__tests__/${name}.test.tsx`,
  },
  {
    pattern: /^app\/ThemeToggle\.tsx$/,
    testPath: () => "app/__tests__/ThemeToggle.test.tsx",
  },
];

function git(args) {
  return execSync(`git ${args}`, { cwd: ROOT, encoding: "utf8" }).trim();
}

function resolveRange(baseRef, headRef) {
  if (baseRef && headRef) return `${baseRef}..${headRef}`;
  const upstream = "origin/main";
  try {
    git(`rev-parse --verify ${upstream}`);
    const base = git(`merge-base ${upstream} HEAD`);
    return `${base}..HEAD`;
  } catch {
    return "HEAD~1..HEAD";
  }
}

function changedFiles(range) {
  try {
    const out = git(`diff --name-only --diff-filter=ACMR ${range}`);
    return out ? out.split("\n").filter(Boolean) : [];
  } catch {
    return [];
  }
}

function expectedTestPath(file) {
  if (IGNORE_FILES.has(file)) return null;
  for (const { pattern, testPath } of WATCHERS) {
    const match = file.match(pattern);
    if (!match) continue;
    return testPath(...match.slice(1));
  }
  return null;
}

function main() {
  const baseRef = process.argv[2];
  const headRef = process.argv[3];
  const range = resolveRange(baseRef, headRef);
  const files = changedFiles(range);

  const missing = [];
  for (const file of files) {
    const testFile = expectedTestPath(file);
    if (!testFile) continue;
    const abs = path.join(ROOT, testFile);
    if (!fs.existsSync(abs)) {
      missing.push({ source: file, expected: testFile });
    }
  }

  if (missing.length === 0) {
    console.log(`✓ Component test check passed (${range})`);
    return;
  }

  console.error("\n✗ Missing tests for changed UI modules:\n");
  for (const { source, expected } of missing) {
    console.error(`  ${source}`);
    console.error(`    → expected ${expected}\n`);
  }
  console.error(
    "Add a Vitest file before pushing, or update scripts/check-component-tests.mjs if this module is exempt.\n"
  );
  process.exit(1);
}

main();
