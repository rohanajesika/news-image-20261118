// news-image-20261118 — "Sum up 18 November's world news in one image".
//
// The front page itself is composed offline (four illustrated panels plus
// real type, see README.md) and ships in this repository as entry.png —
// JPEG bytes under that name, which the rules allow: the gate tells PNG
// from JPEG by the first bytes, and the photo-heavy page is far over the
// 1 MiB cap as PNG. This program only places that image at
// $MAKEFUN_OUTPUT_DIR/entry.png, so the run is deterministic: the same
// bytes in, the same bytes out, every time. Node standard library only,
// no network, no writes outside the output directory.
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
const repoRoot = dirname(fileURLToPath(import.meta.url));
const source = join(repoRoot, "entry.png");
const target = join(outputDir, "entry.png");

// The shipped file is JPEG bytes: it must open with the SOI marker and
// close with the EOI marker, or the gate would refuse it as truncated.
const JPEG_SOI = Buffer.from([0xff, 0xd8, 0xff]);
const JPEG_EOI = Buffer.from([0xff, 0xd9]);

if (!existsSync(source)) {
  throw new Error(`entry.png is missing next to main.ts (${source})`);
}

const bytes = readFileSync(source);
if (!bytes.subarray(0, 3).equals(JPEG_SOI)) {
  throw new Error("entry.png does not start with a JPEG SOI marker");
}
if (!bytes.subarray(-2).equals(JPEG_EOI)) {
  throw new Error("entry.png does not end with a JPEG EOI marker");
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(source, target);

const inBytes = statSync(source).size;
const outBytes = statSync(target).size;
if (inBytes !== outBytes) {
  throw new Error(
    `copy mismatch: ${inBytes} bytes read, ${outBytes} bytes written`,
  );
}

console.log(`wrote ${target} (${outBytes} bytes)`);
