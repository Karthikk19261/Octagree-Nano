// Convert all JPGs/PNGs in images/ to WebP siblings (same name, .webp extension).
// Skips when target is fresh. Logs old/new size.
import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMG_DIR = join(__dirname, '..', 'images');

const HERO_QUALITY = 78;
const PRODUCT_QUALITY = 82;
const THUMB_QUALITY = 80;

function pickQuality(name) {
  if (/^1920x/.test(name)) return HERO_QUALITY;
  if (/^EP|partners|Award|Dealer/i.test(name)) return THUMB_QUALITY;
  return PRODUCT_QUALITY;
}

async function exists(p) { try { await stat(p); return true; } catch { return false; } }

async function main() {
  const entries = await readdir(IMG_DIR);
  let saved = 0, total = 0, count = 0;
  for (const file of entries) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;
    const src = join(IMG_DIR, file);
    const { name } = parse(file);
    const dst = join(IMG_DIR, name + '.webp');
    if (await exists(dst)) {
      const a = await stat(src);
      const b = await stat(dst);
      if (b.mtimeMs >= a.mtimeMs) continue;
    }
    const q = pickQuality(file);
    try {
      const inputBuf = await sharp(src).rotate().toBuffer();
      const meta = await sharp(inputBuf).metadata();
      let pipe = sharp(inputBuf);
      // cap hero width at 1920, others at 1600
      const cap = /^1920x/.test(file) ? 1920 : 1600;
      if (meta.width && meta.width > cap) pipe = pipe.resize({ width: cap });
      await pipe.webp({ quality: q, effort: 5 }).toFile(dst);
      const before = (await stat(src)).size;
      const after = (await stat(dst)).size;
      saved += before - after; total += before; count++;
      console.log(`${file.padEnd(40)} ${(before/1024).toFixed(0)} KB → ${(after/1024).toFixed(0)} KB  (-${(((before-after)/before)*100).toFixed(0)}%)`);
    } catch (err) {
      console.warn(`skip ${file}: ${err.message}`);
    }
  }
  if (count) console.log(`\n${count} files. Saved ${(saved/1024).toFixed(0)} KB (${((saved/total)*100).toFixed(0)}% smaller).`);
  else console.log('All images already optimized.');
}

main().catch(err => { console.error(err); process.exit(1); });
