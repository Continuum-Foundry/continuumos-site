// Encode a sequence of actual browser screenshots; no synthesized frames.
// Usage: node scripts/make-recording.mjs verification/recording-frames
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import sharp from 'sharp';
import { Buffer } from 'node:buffer';
import assert from 'node:assert/strict';

const directory = resolve(process.argv[2]);
const frames = JSON.parse(await readFile(join(directory, 'frames.json'), 'utf8'));
assert.ok(frames.length > 1);
const decoded = await Promise.all(
  frames.map(async (frame) =>
    sharp(join(directory, frame.file)).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
  ),
);
const { width, height, channels } = decoded[0].info;
assert.ok(
  decoded.every(
    (frame) =>
      frame.info.width === width &&
      frame.info.height === height &&
      frame.info.channels === channels,
  ),
);
const buffer = Buffer.concat(decoded.map((frame) => frame.data));
const delay = frames.map((frame, i) =>
  Math.max(40, i === frames.length - 1 ? 900 : frames[i + 1].time - frame.time),
);
const output = resolve(
  directory,
  '..',
  `${directory.split(/[\\/]/).at(-1).replace('-frames', '')}.webp`,
);
await sharp(buffer, {
  raw: { width, height: height * frames.length, channels, pageHeight: height },
})
  .webp({ quality: 65, loop: 0, delay, effort: 3 })
  .toFile(output);
const metadata = await sharp(output, { animated: true }).metadata();
assert.ok(metadata.pages > 1);
await writeFile(
  output + '.json',
  JSON.stringify(
    {
      format: 'animated WebP',
      frames: frames.length,
      width,
      height,
      durationMs: delay.reduce((a, b) => a + b, 0),
      source: 'Actual browser screenshot sequence',
    },
    null,
    2,
  ),
);
console.log(`${output}: ${metadata.pages} captured frames`);
