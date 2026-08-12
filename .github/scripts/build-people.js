#!/usr/bin/env node
// Bundles contributors/<username>/card.json into contributors/people.json.
// Companion to .github/scripts/build-manifest.js — same shape, same idea:
// rebuild from source of truth on disk, let the workflow diff + commit.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const CONTRIB_DIR = path.join(ROOT, "contributors");
const MANIFEST_PATH = path.join(CONTRIB_DIR, "manifest.json");
const OUT_PATH = path.join(CONTRIB_DIR, "people.json");

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  const usernames = readJson(MANIFEST_PATH);
  if (!Array.isArray(usernames)) {
    throw new Error("manifest.json must be an array of usernames");
  }

  const people = [];
  const problems = [];

  for (const username of usernames) {
    const cardPath = path.join(CONTRIB_DIR, username, "card.json");
    if (!fs.existsSync(cardPath)) {
      problems.push(`${username}: no card.json at contributors/${username}/card.json`);
      continue;
    }
    try {
      const card = readJson(cardPath);
      people.push({ username, ...card });
    } catch (e) {
      problems.push(`${username}: invalid JSON in card.json (${e.message})`);
    }
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(people, null, 2) + "\n");

  console.log(`Wrote contributors/people.json with ${people.length} of ${usernames.length} contributors.`);
  if (problems.length) {
    console.warn("Skipped:");
    problems.forEach((p) => console.warn(`  - ${p}`));
  }
}

main();