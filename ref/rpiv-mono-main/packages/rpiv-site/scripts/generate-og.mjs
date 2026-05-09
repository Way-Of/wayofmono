#!/usr/bin/env node
// Generates packages/rpiv-site/public/og.png (1200x630) from a hero screenshot,
// and packages/rpiv-site/public/apple-touch-icon.png (180x180) from a π glyph.
// Run: node packages/rpiv-site/scripts/generate-og.mjs

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(here, "../public");

const ink = { r: 0x1c, g: 0x1a, b: 0x17, alpha: 1 };
const ochre = "#a8896c";

const heroSrc = process.env.HERO_SRC ?? resolve(here, "../../../../Downloads/2026-05-04_00-15-56.jpg");

const og = await sharp(heroSrc)
	.resize(1200, 630, { fit: "contain", background: ink })
	.png()
	.toBuffer();
const ogOut = resolve(publicDir, "og.png");
writeFileSync(ogOut, og);
console.log(`wrote ${ogOut} (${og.length} bytes)`);

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
	<rect width="180" height="180" rx="28" fill="#1c1a17"/>
	<text x="90" y="125" text-anchor="middle" font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="120" font-weight="600" fill="${ochre}">π</text>
</svg>`;

const icon = await sharp(Buffer.from(iconSvg)).png().toBuffer();
const iconOut = resolve(publicDir, "apple-touch-icon.png");
writeFileSync(iconOut, icon);
console.log(`wrote ${iconOut} (${icon.length} bytes)`);
