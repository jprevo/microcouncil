/**
 * Regenerates ./skill/ — the self-contained agent skill published at
 * `jprevo/microcouncil/skill` — from the single sources of truth in src/ and docs/.
 *
 *   npm run skill
 *
 * ./skill is a build output: it is wiped and rewritten on every run, and committed so
 * harnesses (Hermes, Claude Code, any SKILL.md consumer) can fetch it straight from GitHub.
 * Authored skill content lives in skill-src/ — never edit ./skill by hand.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = join(ROOT, "skill-src");
const TARGET = join(ROOT, "skill");

/** `Le salon de thé` -> `le-salon-de-the`. Must match slugify() in microcouncil.py. */
function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), "utf8"));
}

function readText(path) {
  return readFileSync(join(ROOT, path), "utf8");
}

/** Adds a `slug` to every entry, and refuses to ship two entries that collide. */
function withSlugs(entries, key, label) {
  const seen = new Map();
  return entries.map((entry) => {
    const slug = slugify(entry[key]);
    if (slug === "") {
      throw new Error(
        `${label} ${JSON.stringify(entry[key])} produces an empty slug`,
      );
    }
    if (seen.has(slug)) {
      throw new Error(
        `${label} slug collision on "${slug}": ${seen.get(slug)} and ${entry[key]}`,
      );
    }
    seen.set(slug, entry[key]);
    return { slug, ...entry };
  });
}

/** Wipes ./skill only when it is absent, empty, or a previous build of this skill. */
function resetTarget() {
  if (existsSync(TARGET)) {
    const entries = readdirSync(TARGET);
    if (entries.length > 0 && !entries.includes("SKILL.md")) {
      throw new Error(
        `refusing to wipe ${TARGET}: it exists but holds no SKILL.md`,
      );
    }
    rmSync(TARGET, { recursive: true, force: true });
  }
  mkdirSync(TARGET, { recursive: true });
}

/**
 * Always LF. A CRLF checkout (git `core.autocrlf`) must not leak into the published skill:
 * the Python side normalises line endings on read, so mixed endings would make the prompt
 * differ from the one the web app produces.
 */
function writeFile(relativePath, content) {
  const path = join(TARGET, relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content.split("\r\n").join("\n"), "utf8");
  return relativePath;
}

/** Copies skill-src/ into the target, normalising line endings on the way. */
function copyTree(directory, prefix = "") {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const source = join(directory, entry.name);
    const target = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory()) copyTree(source, target);
    else writeFile(target, readFileSync(source, "utf8"));
  }
}

/** Every path listed here must be named in SKILL.md, see verifyReferences(). */
function listFiles(directory) {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(TARGET, join(entry.parentPath ?? entry.path, entry.name))
        .split("\\")
        .join("/"),
    );
}

/**
 * Hermes copies SKILL.md plus only the files it explicitly references. A supporting file
 * nobody names would silently vanish on `hermes skills install`, so the build fails loudly.
 */
function verifyReferences(skillMarkdown) {
  const orphans = listFiles(TARGET)
    .filter((path) => path !== "SKILL.md")
    .filter((path) => !skillMarkdown.includes(path));
  if (orphans.length > 0) {
    throw new Error(
      `SKILL.md references none of: ${orphans.join(", ")} — remote installs would drop them`,
    );
  }
}

function build() {
  const version = readJson("package.json").version;
  const members = withSlugs(readJson("src/members.json"), "name", "member");
  const environments = withSlugs(
    readJson("src/environments.json"),
    "title",
    "environment",
  );

  resetTarget();

  // Authored content first: SKILL.md, scripts/, references/.
  copyTree(SOURCE);

  const tokens = {
    VERSION: version,
    MEMBER_COUNT: String(members.length),
    ENVIRONMENT_COUNT: String(environments.length),
  };
  const skillMarkdown = Object.entries(tokens).reduce(
    (text, [token, value]) => text.split(`{{${token}}}`).join(value),
    readFileSync(join(TARGET, "SKILL.md"), "utf8"),
  );
  writeFile("SKILL.md", skillMarkdown);

  // Then the generated catalogue, copied from the app's own data so both never drift.
  const written = [
    writeFile("assets/members.json", `${JSON.stringify(members, null, 2)}\n`),
    writeFile(
      "assets/environments.json",
      `${JSON.stringify(environments, null, 2)}\n`,
    ),
    writeFile(
      "assets/prompt.md",
      `${readText("docs/data/prompt.md").trim()}\n`,
    ),
    writeFile(
      "assets/custom-example.md",
      `${readText("docs/data/custom.md").trim()}\n`,
    ),
  ];

  verifyReferences(skillMarkdown);

  console.log(`skill v${version} built in ${relative(ROOT, TARGET)}/`);
  console.log(
    `  ${members.length} members, ${environments.length} environments`,
  );
  console.log(
    `  assets: ${written.map((path) => path.replace("assets/", "")).join(", ")}`,
  );
}

try {
  build();
} catch (error) {
  console.error(`build-skill: ${error.message}`);
  process.exit(1);
}
