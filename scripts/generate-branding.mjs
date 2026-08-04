#!/usr/bin/env node
/**
 * Procedurally generates NatalChart brand assets (icon, favicon, splash, adaptive, logo).
 * Run: npm run generate:branding
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'assets', 'images');

const COLORS = {
  background: '#0a0a14',
  ring: '#3a3a6a',
  ringSoft: '#26263a',
  accent: '#6b9fff',
  accentDeep: '#2563eb',
  planet: '#e8e8f4',
  sun: '#f5c542',
  moon: '#c8d0e8',
};

/** Deterministic pseudo-random in [0, 1) from integer seed. */
function hash01(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function polar(cx, cy, angleDeg, r) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/**
 * Build the natal-chart mark as SVG markup.
 * @param {number} size - viewBox size
 * @param {{ padded?: boolean, showStars?: boolean, detail?: 'full' | 'simple' }} options
 */
function buildMarkSvg(size, options = {}) {
  const { padded = false, showStars = true, detail = 'full' } = options;
  const cx = size / 2;
  const cy = size / 2;
  // Adaptive icons need content inside ~66% safe zone
  const outerR = padded ? size * 0.32 : size * 0.38;
  const midR = outerR * 0.72;
  const innerR = outerR * 0.42;
  const coreR = outerR * 0.16;
  const stroke = Math.max(1.5, size * 0.012);
  const tickOuter = outerR;
  const tickInner = midR + (outerR - midR) * 0.35;

  const parts = [];

  parts.push(
    `<rect width="${size}" height="${size}" fill="${COLORS.background}"/>`,
  );

  // Soft vignette
  parts.push(`
    <defs>
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${COLORS.accentDeep}" stop-opacity="0.35"/>
        <stop offset="55%" stop-color="${COLORS.accentDeep}" stop-opacity="0.08"/>
        <stop offset="100%" stop-color="${COLORS.background}" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${COLORS.sun}" stop-opacity="0.9"/>
        <stop offset="40%" stop-color="${COLORS.accent}" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="${COLORS.accentDeep}" stop-opacity="0"/>
      </radialGradient>
    </defs>
  `);
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="${(outerR * 1.15).toFixed(2)}" fill="url(#glow)"/>`,
  );

  if (showStars && detail === 'full') {
    for (let i = 0; i < 28; i++) {
      const a = hash01(i * 3 + 1) * 360;
      const d = outerR * (1.05 + hash01(i * 5 + 2) * 0.35);
      const p = polar(cx, cy, a, d);
      // Keep stars inside the square with a margin
      if (p.x < size * 0.06 || p.x > size * 0.94) continue;
      if (p.y < size * 0.06 || p.y > size * 0.94) continue;
      const r = size * (0.003 + hash01(i * 7 + 3) * 0.004);
      const op = 0.25 + hash01(i * 11 + 4) * 0.55;
      parts.push(
        `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${r.toFixed(2)}" fill="${COLORS.planet}" opacity="${op.toFixed(2)}"/>`,
      );
    }
  }

  // Zodiac / house rings
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="${outerR.toFixed(2)}" fill="none" stroke="${COLORS.ring}" stroke-width="${stroke.toFixed(2)}"/>`,
  );
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="${midR.toFixed(2)}" fill="none" stroke="${COLORS.ringSoft}" stroke-width="${(stroke * 0.85).toFixed(2)}"/>`,
  );
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="${innerR.toFixed(2)}" fill="none" stroke="${COLORS.ring}" stroke-width="${(stroke * 0.75).toFixed(2)}"/>`,
  );

  // 12 house divisions
  for (let i = 0; i < 12; i++) {
    const angle = i * 30;
    const a = polar(cx, cy, angle, tickInner);
    const b = polar(cx, cy, angle, tickOuter);
    const isAxis = i % 3 === 0;
    parts.push(
      `<line x1="${a.x.toFixed(2)}" y1="${a.y.toFixed(2)}" x2="${b.x.toFixed(2)}" y2="${b.y.toFixed(2)}" stroke="${isAxis ? COLORS.accent : COLORS.ring}" stroke-width="${(isAxis ? stroke * 1.15 : stroke * 0.7).toFixed(2)}" stroke-linecap="round" opacity="${isAxis ? 0.95 : 0.65}"/>`,
    );
  }

  // Ascendant emphasis (left → center)
  if (detail === 'full') {
    const ascOuter = polar(cx, cy, 180, outerR);
    const ascInner = polar(cx, cy, 180, innerR * 0.9);
    parts.push(
      `<line x1="${ascOuter.x.toFixed(2)}" y1="${ascOuter.y.toFixed(2)}" x2="${ascInner.x.toFixed(2)}" y2="${ascInner.y.toFixed(2)}" stroke="${COLORS.accent}" stroke-width="${(stroke * 1.4).toFixed(2)}" stroke-linecap="round"/>`,
    );
  }

  // Planet markers on the mid ring (procedural fixed positions)
  const planetAngles = [18, 74, 132, 205, 268, 325];
  for (let i = 0; i < planetAngles.length; i++) {
    const p = polar(cx, cy, planetAngles[i], (midR + innerR) / 2);
    const r = size * (detail === 'simple' ? 0.018 : 0.014);
    const fill = i === 0 ? COLORS.sun : i === 1 ? COLORS.moon : COLORS.planet;
    parts.push(
      `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${r.toFixed(2)}" fill="${fill}"/>`,
    );
    if (detail === 'full' && i === 0) {
      parts.push(
        `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${(r * 2.2).toFixed(2)}" fill="none" stroke="${COLORS.sun}" stroke-width="${(stroke * 0.45).toFixed(2)}" opacity="0.55"/>`,
      );
    }
  }

  // Center core
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="${(coreR * 2.2).toFixed(2)}" fill="url(#coreGlow)"/>`,
  );
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="${coreR.toFixed(2)}" fill="${COLORS.background}" stroke="${COLORS.accent}" stroke-width="${stroke.toFixed(2)}"/>`,
  );

  // Tiny sun disc in the core
  const sunR = coreR * 0.42;
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="${sunR.toFixed(2)}" fill="${COLORS.sun}"/>`,
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
${parts.join('\n')}
</svg>`;
}

/** Horizontal wordmark logo for README / marketing. */
function buildLogoSvg() {
  const width = 960;
  const height = 280;
  const markSize = 220;
  const mark = buildMarkSvg(markSize, {
    padded: false,
    showStars: true,
    detail: 'full',
  });
  // Extract inner content (without xml header / outer svg)
  const inner = mark
    .replace(/^<\?xml[^>]*>\s*/, '')
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${COLORS.background}"/>
  <g transform="translate(40, 30)">
    ${inner}
  </g>
  <g transform="translate(300, 0)">
    <text x="0" y="155" font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="600" fill="${COLORS.planet}">NatalChart</text>
    <text x="2" y="200" font-family="ui-sans-serif, system-ui, sans-serif" font-size="22" fill="${COLORS.accent}" letter-spacing="3">NATAL CHART CALCULATOR</text>
  </g>
</svg>`;
}

async function writePngFromSvg(svg, filePath, size) {
  const buffer = await sharp(Buffer.from(svg))
    .resize(size, size, { fit: 'fill' })
    .png()
    .toBuffer();
  await writeFile(filePath, buffer);
  return buffer.length;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const fullSvg = buildMarkSvg(1024, {
    padded: false,
    showStars: true,
    detail: 'full',
  });
  const adaptiveSvg = buildMarkSvg(1024, {
    padded: true,
    showStars: false,
    detail: 'full',
  });
  const simpleSvg = buildMarkSvg(256, {
    padded: false,
    showStars: false,
    detail: 'simple',
  });
  const logoSvg = buildLogoSvg();

  const outputs = [
    {
      name: 'icon.png',
      size: 1024,
      svg: fullSvg,
    },
    {
      name: 'adaptive-icon.png',
      size: 1024,
      svg: adaptiveSvg,
    },
    {
      name: 'splash-icon.png',
      size: 512,
      svg: fullSvg,
    },
    {
      name: 'favicon.png',
      size: 48,
      svg: simpleSvg,
    },
  ];

  console.log(`Writing brand assets → ${path.relative(ROOT, OUT_DIR)}`);

  for (const out of outputs) {
    const filePath = path.join(OUT_DIR, out.name);
    const bytes = await writePngFromSvg(out.svg, filePath, out.size);
    console.log(`  ✓ ${out.name} (${out.size}×${out.size}, ${bytes} bytes)`);
  }

  const logoPath = path.join(OUT_DIR, 'logo.svg');
  await writeFile(logoPath, logoSvg, 'utf8');
  console.log(`  ✓ logo.svg`);

  // Keep a source mark SVG for inspection / reuse
  const markPath = path.join(OUT_DIR, 'icon.svg');
  await writeFile(markPath, fullSvg, 'utf8');
  console.log(`  ✓ icon.svg`);

  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
