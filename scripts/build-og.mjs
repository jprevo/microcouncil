/**
 * Draws the social share card for every language — the picture Slack, Discord,
 * WhatsApp, Mastodon, Bluesky, LinkedIn, Facebook and X put above the link:
 *
 *   npm run og
 *
 * One 1200x630 PNG per locale in `src/locales/registry.json`, written to
 * `src/public/og/<code>.png`, which Vite copies verbatim to `dist/og/<code>.png`
 * (`src/` is the Vite root, so `src/public/` is its public directory). The tags
 * that point at them are emitted by `scripts/build-pages.mjs`, which derives the
 * same file names from the same registry.
 *
 * Like the generated pages, this is build output: wiped and rewritten on every
 * run, git-ignored rather than committed, and regenerated ahead of `npm run dev`
 * and `npm run build`.
 *
 * ---------------------------------------------------------------- the drawing
 *
 * The card carries the mark, the brand and the lede on the dark theme's own
 * ground — a share card is seen once, at thumbnail size, in someone else's feed,
 * and the dark ground is what makes it a shape rather than another white
 * rectangle in the column.
 *
 * The mark is not redrawn here: the circles are read out of
 * `src/assets/logo-dark.svg`, the very file the app shows in its dark theme, so
 * the card cannot drift from the site when the logo changes. The palette is the
 * dark theme's, spelled out below because a PNG inherits no custom properties.
 *
 * --------------------------------------------------------------- many tongues
 *
 * Nothing here assumes how long a sentence is, where its words end, or which way
 * it runs. A lede is two lines in one language and five in the next, and a card
 * whose text is positioned by hand only looks right in the language it was
 * nudged for.
 *
 * So the lede is fitted rather than placed: wrapped at the largest of a ladder
 * of sizes that still fits the box, and centred in the space the lockup and the
 * footer leave it. A short lede sits large and airy; a long one steps down a
 * notch instead of spilling off the edge.
 *
 * Line breaking goes through `Intl.Segmenter`, so a language that does not
 * separate its words with spaces — Japanese, Chinese, Thai — breaks at the word
 * boundaries the ICU data knows about rather than not at all. Punctuation that
 * may not open or close a line is glued to its neighbour first, which is what
 * keeps a French opening guillemet off the end of a line and a CJK full stop off
 * the start of one.
 *
 * Right-to-left languages mirror the whole card — lockup, text, watermark and
 * the accent at its foot — from the `dir` already declared in the registry.
 *
 * A script the bundled Archivo cannot draw needs its own font, and that is the
 * one manual step a new language may cost: drop a `.ttf`/`.otf` into
 * `assets/fonts/` and it joins the fallback stack automatically, ahead of
 * whatever the build machine happens to have installed.
 *
 * @license SIL Open Font License 1.1
 * Archivo, Copyright 2020 The Archivo Project Authors
 * (https://github.com/Omnibus-Type/Archivo) — the static 400 and 800 instances
 * live in `assets/fonts/`, full text in `licenses/Archivo-OFL.txt`. They are
 * build-time only: the browser gets the variable subsets inlined in
 * `src/fonts.css`, and never these files.
 */

import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CARD_DIR,
  CARD_HEIGHT,
  CARD_WIDTH,
  cardPath,
  SITE_HOST,
} from "./share.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const FONTS_DIR = join(ROOT, "assets/fonts");
const PUBLIC_DIR = join(SRC, "public");
const OUT_DIR = join(PUBLIC_DIR, CARD_DIR);

/** Read from `share.mjs`, which the tags pointing at these files read too. */
const WIDTH = CARD_WIDTH;
const HEIGHT = CARD_HEIGHT;

/** `[data-theme="dark"]` in `src/styles.css`, which a PNG cannot read. */
const INK = "#e6ecf8";
const MUTED = "#a8bde4";
const FAINT = "#7a8cb4";
const ACCENT = "#4d8cff";
const BACKGROUND = "#060b18";

const MARGIN = 84;
const MARK_SIZE = 76;
/** Between the mark and the brand beside it. */
const LOCKUP_GAP = 26;
const LOCKUP_TO_LEDE = 48;
const LEDE_TO_FOOTER = 44;
const FOOTER_SIZE = 22;
const BAR_HEIGHT = 8;

/**
 * The width the text may use. Short of the full column: the watermark bleeds in
 * from the far edge, and a line that ran under it would be read against the one
 * part of the ground that is not flat.
 */
const TEXT_WIDTH = 820;

/** Largest first — the fitter takes the first size whose wrap still fits. */
const BRAND_SIZES = [52, 48, 44, 40, 36, 32];
const LEDE_SIZES = [48, 44, 40, 36, 33, 30];
/** Past this the lede is a paragraph, not a caption, and reads as neither. */
const LEDE_MAX_LINES = 5;
const LINE_HEIGHT = 1.34;

/* ------------------------------------------------------------------- fonts */

/**
 * Where a table lives in a font file, or `null` if it carries none.
 *
 * A collection holds several fonts in one file; the first is the one Skia
 * registers under the family name, and the only one any of this cares about.
 */
function findTable(buffer, wanted) {
  const base =
    buffer.toString("ascii", 0, 4) === "ttcf" ? buffer.readUInt32BE(12) : 0;

  for (let index = 0; index < buffer.readUInt16BE(base + 4); index += 1) {
    const record = base + 12 + index * 16;
    if (buffer.toString("ascii", record, record + 4) === wanted)
      return buffer.readUInt32BE(record + 8);
  }
  return null;
}

/**
 * The most useful of a `cmap`'s subtables: Unicode-wide first, then the plain
 * BMP one, then nothing — a font that only maps its glyphs by MacRoman tells us
 * nothing about the scripts it can draw.
 */
const SUBTABLE_RANK = { "3,10": 3, "0,4": 3, "3,1": 2, "0,3": 2 };

function bestSubtable(buffer, cmap) {
  let best = null;
  let bestRank = 0;

  for (let index = 0; index < buffer.readUInt16BE(cmap + 2); index += 1) {
    const record = cmap + 4 + index * 8;
    const platform = buffer.readUInt16BE(record);
    const encoding = buffer.readUInt16BE(record + 2);
    const rank = SUBTABLE_RANK[`${platform},${encoding}`] ?? 0;

    if (rank > bestRank) {
      bestRank = rank;
      best = cmap + buffer.readUInt32BE(record + 4);
    }
  }
  return best;
}

/** Format 4: the BMP, in segments, some of which map code points one by one. */
function readFormat4(buffer, at) {
  const u16 = (offset) => buffer.readUInt16BE(offset);
  const segments = u16(at + 6) / 2;
  const ends = at + 14;
  const starts = ends + segments * 2 + 2;
  const offsets = starts + segments * 4;

  const ranges = [];
  for (let index = 0; index < segments; index += 1) {
    const from = u16(starts + index * 2);
    const to = u16(ends + index * 2);
    if (from > to || from === 0xffff) continue;

    const offset = u16(offsets + index * 2);
    if (offset === 0) {
      ranges.push([from, to]);
      continue;
    }
    // An indexed segment maps some of its code points to nothing at all — the
    // one case where taking the whole segment would be a lie.
    for (let code = from; code <= to; code += 1) {
      const glyph = offsets + index * 2 + offset + (code - from) * 2;
      if (glyph + 1 < buffer.length && u16(glyph) !== 0)
        ranges.push([code, code]);
    }
  }
  return ranges;
}

/** Format 12: the whole of Unicode, in groups. */
function readFormat12(buffer, at) {
  const ranges = [];
  for (let index = 0; index < buffer.readUInt32BE(at + 12); index += 1) {
    const group = at + 16 + index * 12;
    ranges.push([buffer.readUInt32BE(group), buffer.readUInt32BE(group + 4)]);
  }
  return ranges;
}

/**
 * The code points a font file says it can draw, as ranges.
 *
 * Worth the reading because the failure it catches is silent: Skia answers every
 * `measureText` and draws a card either way, and a language whose script no
 * loaded font covers comes out as a neat row of tofu boxes that nothing in the
 * build complains about. Ask the files what they carry, and the card that cannot
 * be drawn stops the build instead of reaching a timeline.
 *
 * Formats 4, 6 and 12 — between them, every `cmap` a modern TTF/OTF ships.
 */
function readCoverage(buffer) {
  const cmap = findTable(buffer, "cmap");
  if (cmap === null) return [];

  const at = bestSubtable(buffer, cmap);
  if (at === null) return [];

  const format = buffer.readUInt16BE(at);
  if (format === 4) return readFormat4(buffer, at);
  if (format === 12) return readFormat12(buffer, at);
  if (format === 6) {
    const first = buffer.readUInt16BE(at + 6);
    return [[first, first + buffer.readUInt16BE(at + 8) - 1]];
  }
  return [];
}

/**
 * Archivo first, then anything else dropped into `assets/fonts/` for a script it
 * does not cover. Skia loads the machine's own fonts too, and those stay as a
 * last resort behind both: they differ between a laptop and a CI runner, so
 * nothing that decides a layout — or the coverage check — may depend on them.
 */
function loadFonts() {
  const before = new Set(GlobalFonts.families.map((entry) => entry.family));

  const files = readdirSync(FONTS_DIR)
    .filter((name) =>
      [".ttf", ".otf", ".ttc"].includes(extname(name).toLowerCase()),
    )
    .sort();

  const ranges = [];
  for (const name of files) {
    const path = join(FONTS_DIR, name);
    // The two Archivo instances answer to one family name; their own weight
    // metadata is what tells 400 from 800 when the font string asks for one.
    if (name.startsWith("Archivo"))
      GlobalFonts.registerFromPath(path, "Archivo");
    else GlobalFonts.registerFromPath(path);

    ranges.push(...readCoverage(readFileSync(path)));
  }

  const added = GlobalFonts.families
    .map((entry) => entry.family)
    .filter((family) => !before.has(family) && family !== "Archivo")
    .sort();

  return {
    stack: ["Archivo", ...added].map((family) => `"${family}"`).join(", "),
    coverage: ranges,
  };
}

const { stack: FONT_STACK, coverage: COVERAGE } = loadFonts();

/**
 * Nothing is drawn for these and nothing needs to be: the separators, the marks
 * that only steer the bidi algorithm, and the soft hyphen.
 */
const INVISIBLE = /[\s\u00ad\u200b-\u200f\u202a-\u202e\u2060\ufeff]/u;

/** The characters of `text` no font in `assets/fonts/` can draw. */
function missingGlyphs(text) {
  return [...new Set(text)].filter(
    (character) =>
      !INVISIBLE.test(character) &&
      !COVERAGE.some(
        ([from, to]) =>
          character.codePointAt(0) >= from && character.codePointAt(0) <= to,
      ),
  );
}

/* -------------------------------------------------------------------- mark */

/**
 * The round table, read out of the app's own dark-theme SVG rather than copied
 * into this file. It is a handful of circles and a `viewBox`; a general SVG
 * parser would be a lie about what this needs.
 */
function readMark() {
  const svg = readFileSync(join(SRC, "assets/logo-dark.svg"), "utf8");

  const viewBox = /viewBox="([^"]+)"/.exec(svg);
  if (viewBox === null) throw new Error("logo-dark.svg has no viewBox.");
  const [minX, minY, width] = viewBox[1].trim().split(/\s+/).map(Number);

  const circles = [...svg.matchAll(/<circle\b([^>]*)>/g)].map(
    ([, attributes]) => {
      const read = (name) => {
        const found = new RegExp(`\\b${name}="([^"]*)"`).exec(attributes);
        return found === null ? null : found[1];
      };
      return {
        cx: Number(read("cx")),
        cy: Number(read("cy")),
        r: Number(read("r")),
        fill: read("fill"),
        stroke: read("stroke"),
        strokeWidth: Number(read("stroke-width") ?? 0),
      };
    },
  );

  if (circles.length === 0) throw new Error("logo-dark.svg has no circles.");
  return { minX, minY, width, circles };
}

const MARK = readMark();

/**
 * `x`/`y` are the top-left of the square the mark is drawn into. `tint` replaces
 * every colour in the file, which is how the same drawing becomes the watermark.
 */
function drawMark(ctx, { x, y, size, tint = null }) {
  const scale = size / MARK.width;

  for (const circle of MARK.circles) {
    ctx.beginPath();
    ctx.arc(
      x + (circle.cx - MARK.minX) * scale,
      y + (circle.cy - MARK.minY) * scale,
      circle.r * scale,
      0,
      Math.PI * 2,
    );

    if (circle.fill !== null && circle.fill !== "none") {
      ctx.fillStyle = tint ?? circle.fill;
      ctx.fill();
    }
    if (circle.stroke !== null && circle.stroke !== "none") {
      ctx.strokeStyle = tint ?? circle.stroke;
      ctx.lineWidth = circle.strokeWidth * scale;
      ctx.stroke();
    }
  }
}

/* -------------------------------------------------------------------- text */

/** Never the first thing on a line: the tail of a sentence, and its closers. */
const NO_LINE_START =
  /^[)\]}>»›"'’”.,;:!?%‰…、。，．；：！？」』】〉》〕）］｝]/u;
/** Never the last thing on a line: what opens the next word. */
const NO_LINE_END = /[([{<«‹"'‘“¿¡「『【〈《〔（［｛]$/u;
/** Spaces that are there precisely so the line does not break at them. */
const GLUE = /^[\u00a0\u202f\u2007\u2011\ufeff]+$/u;

/**
 * The text cut into the pieces a line may be built from. `Intl.Segmenter` finds
 * the word boundaries — including in scripts that write without spaces — and the
 * pass after it glues back the pieces that must not be parted.
 */
function chunk(text, locale) {
  const segments = [
    ...new Intl.Segmenter(locale, { granularity: "word" }).segment(text),
  ].map((entry) => entry.segment);

  const glued = [];
  for (const segment of segments) {
    const previous = glued.at(-1);
    const attaches =
      previous !== undefined &&
      (GLUE.test(segment) ||
        GLUE.test(previous) ||
        NO_LINE_START.test(segment) ||
        NO_LINE_END.test(previous.trimEnd()));

    if (attaches) glued[glued.length - 1] = previous + segment;
    else glued.push(segment);
  }
  return glued;
}

/**
 * A piece with no break in it that is wider than the line anyway — a long
 * compound, a URL — split where it has to be. By grapheme, so a split never
 * lands inside an accent or an emoji.
 */
function splitOversized(ctx, piece, maxWidth) {
  const graphemes = [...new Intl.Segmenter().segment(piece)].map(
    (entry) => entry.segment,
  );
  const parts = [];
  let current = "";

  for (const grapheme of graphemes) {
    if (
      current !== "" &&
      ctx.measureText(current + grapheme).width > maxWidth
    ) {
      parts.push(current);
      current = grapheme;
    } else current += grapheme;
  }
  if (current !== "") parts.push(current);
  return parts;
}

/** Greedy wrap, at the current font. Trailing spaces never count as width. */
function wrap(ctx, text, maxWidth, locale) {
  const lines = [];
  let line = "";

  const push = () => {
    if (line.trim() !== "") lines.push(line.trimEnd());
    line = "";
  };

  for (const piece of chunk(text, locale)) {
    if (line === "" && piece.trim() === "") continue;

    if (line === "" && ctx.measureText(piece.trimEnd()).width > maxWidth) {
      const parts = splitOversized(ctx, piece, maxWidth);
      lines.push(...parts.slice(0, -1));
      line = parts.at(-1);
      continue;
    }

    if (
      line !== "" &&
      ctx.measureText((line + piece).trimEnd()).width > maxWidth
    ) {
      push();
      if (piece.trim() !== "") line = piece;
    } else line += piece;
  }

  push();
  return lines.length === 0 ? [""] : lines;
}

/** Shortens a line until it and an ellipsis fit — the last resort of the fitter. */
function ellipsize(ctx, text, maxWidth) {
  let cut = [...new Intl.Segmenter().segment(text)].map(
    (entry) => entry.segment,
  );
  while (
    cut.length > 1 &&
    ctx.measureText(`${cut.join("").trimEnd()}…`).width > maxWidth
  )
    cut = cut.slice(0, -1);
  return `${cut.join("").trimEnd()}…`;
}

/**
 * The largest size in `sizes` whose wrap fits the box, in lines and in pixels
 * both — the whole answer to a lede that is half as long in one language and
 * twice as long in the next. Counting lines alone is not enough: five lines fit
 * at 36px and overrun the footer at 48.
 *
 * Below the last size the text is cut rather than allowed to overrun, which is
 * a translation too long for a share card and worth seeing as one.
 */
function fit(
  ctx,
  {
    text,
    locale,
    sizes,
    weight,
    maxWidth,
    maxLines,
    maxHeight = Infinity,
    tracking = 0,
  },
) {
  const apply = (size) => {
    ctx.font = `${weight} ${size}px ${FONT_STACK}`;
    ctx.letterSpacing = `${(tracking * size).toFixed(2)}px`;
  };

  let last = null;
  for (const size of sizes) {
    apply(size);
    const lines = wrap(ctx, text, maxWidth, locale);
    last = { size, lines };
    if (
      lines.length <= maxLines &&
      lines.length * size * LINE_HEIGHT <= maxHeight
    )
      return last;
  }

  const room = Math.min(
    maxLines,
    Math.max(1, Math.floor(maxHeight / (last.size * LINE_HEIGHT))),
  );
  const lines = last.lines.slice(0, room);
  lines[lines.length - 1] = ellipsize(ctx, lines.at(-1), maxWidth);
  return { size: last.size, lines };
}

/* -------------------------------------------------------------------- card */

function drawBackground(ctx, rtl) {
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // The light the table sits in, thrown from behind the watermark so the card
  // has a near corner and a far one instead of one flat sheet of navy.
  const glowX = rtl ? 140 : WIDTH - 140;
  const glow = ctx.createRadialGradient(glowX, 170, 0, glowX, 170, 700);
  glow.addColorStop(0, "rgb(77 140 255 / 0.26)");
  glow.addColorStop(0.55, "rgb(77 140 255 / 0.07)");
  glow.addColorStop(1, "rgb(77 140 255 / 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // The mark again, vast and nearly out of frame. It reads as texture at
  // thumbnail size and as the logo once the card is opened.
  ctx.save();
  ctx.globalAlpha = 0.17;
  const watermark = 660;
  drawMark(ctx, {
    x: rtl ? -watermark * 0.42 : WIDTH - watermark * 0.58,
    y: HEIGHT / 2 - watermark / 2,
    size: watermark,
    tint: ACCENT,
  });
  ctx.restore();

  // The accent, laid along the foot of the card and fading out across it.
  const bar = ctx.createLinearGradient(rtl ? WIDTH : 0, 0, rtl ? 0 : WIDTH, 0);
  bar.addColorStop(0, ACCENT);
  bar.addColorStop(0.62, "rgb(77 140 255 / 0)");
  ctx.fillStyle = bar;
  ctx.fillRect(0, HEIGHT - BAR_HEIGHT, WIDTH, BAR_HEIGHT);
}

function renderCard({ code, dir, brand, lede }) {
  const rtl = dir === "rtl";
  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext("2d");

  ctx.direction = rtl ? "rtl" : "ltr";
  ctx.textAlign = rtl ? "right" : "left";
  ctx.textBaseline = "alphabetic";

  drawBackground(ctx, rtl);

  // Everything hangs off one edge, and which edge is the only thing `dir`
  // changes about the layout.
  const edge = rtl ? WIDTH - MARGIN : MARGIN;
  const inward = (distance) => (rtl ? edge - distance : edge + distance);

  drawMark(ctx, {
    x: rtl ? edge - MARK_SIZE : edge,
    y: MARGIN,
    size: MARK_SIZE,
  });

  const brandText = fit(ctx, {
    text: brand,
    locale: code,
    sizes: BRAND_SIZES,
    weight: 800,
    maxWidth: TEXT_WIDTH - MARK_SIZE - LOCKUP_GAP,
    maxLines: 1,
    tracking: -0.015,
  });
  ctx.fillStyle = INK;
  // Optically centred on the mark rather than sat on its baseline: capital
  // height, not line height, is what the eye lines a wordmark up with.
  ctx.fillText(
    brandText.lines[0],
    inward(MARK_SIZE + LOCKUP_GAP),
    MARGIN + MARK_SIZE / 2 + brandText.size * 0.35,
  );

  const footerBaseline = HEIGHT - MARGIN;
  const top = MARGIN + MARK_SIZE + LOCKUP_TO_LEDE;
  const bottom = footerBaseline - FOOTER_SIZE - LEDE_TO_FOOTER;

  const ledeText = fit(ctx, {
    text: lede,
    locale: code,
    sizes: LEDE_SIZES,
    weight: 400,
    maxWidth: TEXT_WIDTH,
    maxLines: LEDE_MAX_LINES,
    maxHeight: bottom - top,
    tracking: -0.005,
  });

  // Centred in what the lockup and the footer leave, so two lines and five sit
  // as deliberately as each other.
  const lineHeight = ledeText.size * LINE_HEIGHT;
  const block = ledeText.lines.length * lineHeight;
  let baseline = top + (bottom - top - block) / 2 + ledeText.size;

  ctx.fillStyle = MUTED;
  for (const line of ledeText.lines) {
    ctx.fillText(line, edge, baseline);
    baseline += lineHeight;
  }

  ctx.font = `400 ${FOOTER_SIZE}px ${FONT_STACK}`;
  ctx.letterSpacing = "1.6px";
  ctx.fillStyle = FAINT;
  ctx.fillText(SITE_HOST, edge, footerBaseline);

  return canvas.toBuffer("image/png");
}

/* -------------------------------------------------------------------- main */

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), "utf8"));
}

const registry = readJson("src/locales/registry.json");

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

for (const locale of registry) {
  const ui = readJson(`src/locales/${locale.code}/ui.json`);

  // Before anything is drawn, because what is drawn for a character no font
  // carries is a box, and a card full of boxes looks like a finished build.
  const missing = missingGlyphs(`${ui.brand}${ui.lede}${SITE_HOST}`);
  if (missing.length > 0)
    throw new Error(
      `No font in assets/fonts/ can draw ${missing
        .map(
          (character) =>
            `${character} (U+${character
              .codePointAt(0)
              .toString(16)
              .toUpperCase()
              .padStart(4, "0")})`,
        )
        .join(", ")}, which "${locale.code}" needs for its share card. ` +
        `Add a font covering that script to assets/fonts/ — any .ttf/.otf ` +
        `there is picked up automatically — and note its licence in licenses/.`,
    );

  writeFileSync(
    join(PUBLIC_DIR, cardPath(locale.code)),
    renderCard({
      code: locale.code,
      dir: locale.dir,
      brand: ui.brand,
      lede: ui.lede,
    }),
  );
}

console.log(
  `Generated ${registry.length} share card(s): ${registry
    .map((locale) => cardPath(locale.code).slice(1))
    .join(", ")}`,
);
