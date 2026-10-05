// Gera os SVGs do README no mesmo visual do portfolio (B:\projetos\portfolio).
// Uso: node scripts/build.mjs   (Node 18+, sem dependências)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(ROOT, 'scripts', 'assets');
const OUT = join(ROOT, 'images');
const USER = 'Moraeszz2';

const b64 = (file) => readFileSync(join(ASSETS, file)).toString('base64');
const icons = JSON.parse(readFileSync(join(ASSETS, 'icons.json'), 'utf8'));
const metrics = JSON.parse(readFileSync(join(ASSETS, 'metrics.json'), 'utf8'));
const charIndex = new Map([...metrics.chars].map((c, i) => [c, i]));

// ---------- texto ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const FONT_KEY = { grotesk: 'grotesk400', groteskBold: 'grotesk700', pirata: 'pirata', marker: 'marker', mono: null };
const measure = (text, font, size, spacing = 0) => {
  let w = 0;
  for (const ch of text) {
    if (font === 'mono') { w += 0.6 * size; continue; }
    const i = charIndex.get(ch);
    const table = metrics[FONT_KEY[font]];
    w += ((i === undefined ? 100 : table[i]) / 100) * size;
  }
  return w + spacing * [...text].length;
};
const truncate = (text, font, size, max) => {
  if (measure(text, font, size) <= max) return text;
  let t = text;
  while (t.length && measure(`${t}…`, font, size) > max) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
};

// ---------- fontes ----------
const FONTS = {
  grotesk: () => `@font-face{font-family:'Space Grotesk';font-weight:300 700;src:url(data:font/woff2;base64,${b64('grotesk.woff2')}) format('woff2')}`,
  mono: () => `@font-face{font-family:'Chivo Mono';font-weight:100 900;src:url(data:font/woff2;base64,${b64('chivo.woff2')}) format('woff2')}`,
  pirata: () => `@font-face{font-family:'Pirata One';src:url(data:font/woff2;base64,${b64('pirata.woff2')}) format('woff2')}`,
  marker: () => `@font-face{font-family:'Permanent Marker';src:url(data:font/woff2;base64,${b64('marker.woff2')}) format('woff2')}`,
};

const BASE_CSS = `
  .sans{font-family:'Space Grotesk','Segoe UI',sans-serif}
  .mono{font-family:'Chivo Mono',Consolas,monospace}
  .gothic{font-family:'Pirata One',serif;letter-spacing:.02em}
  .marker{font-family:'Permanent Marker',cursive}
  .emoji{font-family:'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif}
  .fb{transform-box:fill-box;transform-origin:center}
  .wobble{animation:wobble 3s ease-in-out infinite}
  .heartbeat{animation:heartbeat 1.4s ease-in-out infinite}
  .twinkle{animation:twinkle 3.5s ease-in-out infinite}
  .flicker{animation:flicker 4s linear infinite}
  .blink{animation:blink 1s steps(1) infinite}
  .ping{animation:ping 1s cubic-bezier(0,0,.2,1) infinite}
  .bob{animation:bob 3s ease-in-out infinite}
  .float{animation:float 4s ease-in-out infinite}
  .ga{animation:glitch-a 3.2s infinite steps(1);clip-path:inset(0 0 60% 0);opacity:0}
  .gb{animation:glitch-b 2.7s infinite steps(1);clip-path:inset(55% 0 0 0);opacity:0}
  @keyframes wobble{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
  @keyframes heartbeat{0%,100%{transform:scale(1)}14%{transform:scale(1.25)}28%{transform:scale(1)}42%{transform:scale(1.18)}70%{transform:scale(1)}}
  @keyframes twinkle{0%,100%{opacity:.15;transform:scale(.6)}50%{opacity:1;transform:scale(1.2)}}
  @keyframes flicker{0%,18%,22%,25%,53%,57%,100%{opacity:1}20%,24%,55%{opacity:.35}}
  @keyframes blink{50%{opacity:0}}
  @keyframes ping{0%{transform:scale(1);opacity:.75}75%,100%{transform:scale(2);opacity:0}}
  @keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
  @keyframes glitch-a{0%{opacity:0;transform:translate(0)}8%{opacity:1;transform:translate(-4px,1px)}10%{opacity:1;transform:translate(4px,-1px)}12%{opacity:0;transform:translate(0)}62%{opacity:1;transform:translate(5px,0);clip-path:inset(20% 0 50% 0)}64%{opacity:1;transform:translate(-3px,0);clip-path:inset(0 0 60% 0)}66%{opacity:0;transform:translate(0)}}
  @keyframes glitch-b{0%{opacity:0;transform:translate(0)}32%{opacity:1;transform:translate(4px,1px);clip-path:inset(70% 0 5% 0)}34%{opacity:1;transform:translate(-5px,-1px)}36%{opacity:0;transform:translate(0);clip-path:inset(55% 0 0 0)}82%{opacity:1;transform:translate(-4px,0)}84%{opacity:0;transform:translate(0)}}
`;

// fundo comum: gradiente da Home + noise + scanlines + vinheta
const backdrop = (w, h, from = '#0d0410', to = '#12030a') => `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient>
    <pattern id="scan" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="1" fill="#fff" fill-opacity=".03"/></pattern>
    <radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
    <filter id="noise" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .55 0"/></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>`;
const overlays = (w, h) => `
  <rect width="${w}" height="${h}" filter="url(#noise)" opacity=".05"/>
  <rect width="${w}" height="${h}" fill="url(#scan)"/>
  <rect width="${w}" height="${h}" fill="url(#vig)" opacity=".8"/>`;

// partículas (FloatingElements): pontinhos rosa/roxo + emojis apagados
const particles = (w, h, seed = 1) => {
  let s = seed * 9301;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let out = '';
  for (let i = 0; i < 14; i++) {
    const color = i % 3 === 0 ? '#8b5cf6' : '#e11d48';
    out += `<circle class="twinkle fb" cx="${(rnd() * w).toFixed(0)}" cy="${(rnd() * h).toFixed(0)}" r="${(1.5 + rnd() * 1.5).toFixed(1)}" fill="${color}" fill-opacity=".7" style="animation-delay:${(rnd() * 3.5).toFixed(1)}s"/>`;
  }
  for (let i = 0; i < 18; i++) {
    out += `<rect x="${(rnd() * w).toFixed(0)}" y="${(rnd() * h).toFixed(0)}" width="1" height="${(14 + rnd() * 18).toFixed(0)}" fill="#fda4af" fill-opacity=".06" transform="rotate(12)"/>`;
  }
  return out;
};

const ghost = (x, y, emoji, size, delay = 0, opacity = 0.18) =>
  `<g class="bob" style="animation-delay:${delay}s"><text class="emoji" x="${x}" y="${y}" font-size="${size}" opacity="${opacity}">${emoji}</text></g>`;

const icon = (name, x, y, size, color, extra = '') => {
  const ic = icons[name];
  const stroke = ic.attr?.stroke === 'currentColor';
  const paint = stroke
    ? `fill="none" stroke="${color}" stroke-width="${ic.attr.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"`
    : `fill="${color}"`;
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${ic.viewBox}" ${paint} ${extra}>${ic.body}</svg>`;
};

const svg = (w, h, fonts, body, extraCss = '', label = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}">
<style>${fonts.map((f) => FONTS[f]()).join('')}${BASE_CSS}${extraCss}</style>
${body}
</svg>
`;

// título gótico com glitch (SectionTitle.jsx)
const titleDefs = `
  <linearGradient id="blood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4d6d"/><stop offset=".45" stop-color="#e11d48"/><stop offset="1" stop-color="#7f1d1d"/></linearGradient>
  <filter id="titleglow" x="-20%" y="-40%" width="140%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="#e11d48" flood-opacity=".55"/></filter>`;

const glitchText = (text, x, y, cls, size, fill, extra = '') => `
  <g>
    <text class="${cls}" x="${x}" y="${y}" font-size="${size}" fill="${fill}" ${extra}>${esc(text)}</text>
    <text class="${cls} ga fb" x="${x}" y="${y}" font-size="${size}" fill="#ff2e4d" ${extra}>${esc(text)}</text>
    <text class="${cls} gb fb" x="${x}" y="${y}" font-size="${size}" fill="#8b5cf6" ${extra}>${esc(text)}</text>
  </g>`;

const sectionTitle = (cx, top, title, emoji, subtitle) => {
  const size = 96;
  const tw = measure(title, 'pirata', size) * 1.02;
  const base = top + 80;
  const ex1 = cx - tw / 2 - 58;
  const ex2 = cx + tw / 2 + 58;
  const lineY = base + 30;
  const crosses = [50, 120, 200, 280, 350]
    .map((c, i) => `<g class="cross" style="animation-delay:${0.6 + i * 0.15}s"><line x1="${c - 6}" y1="6" x2="${c + 6}" y2="18" stroke="#9ca3af" stroke-width="1.5"/><line x1="${c + 6}" y1="6" x2="${c - 6}" y2="18" stroke="#9ca3af" stroke-width="1.5"/></g>`)
    .join('');
  return `
  <g>
    <g transform="translate(${ex1} ${base - 30})"><text class="emoji wobble fb" font-size="48" text-anchor="middle" y="16">${emoji}</text></g>
    <g filter="url(#titleglow)">${glitchText(title, cx, base, 'gothic', size, 'url(#blood)', 'text-anchor="middle"')}</g>
    <g transform="translate(${ex2} ${base - 30})"><text class="emoji wobble fb" font-size="48" text-anchor="middle" y="16" style="animation-delay:-1.5s">${emoji}</text></g>
    <g transform="translate(${cx - 160} ${lineY}) scale(.8)">
      <path class="draw" d="M0 12 Q 50 2 100 12 T 200 12 T 300 12 T 400 12" fill="none" stroke="#e11d48" stroke-width="2"/>
      ${crosses}
    </g>
    ${subtitle ? `<text class="marker" x="${cx}" y="${lineY + 58}" font-size="18" fill="#9ca3af" text-anchor="middle" transform="rotate(-1 ${cx} ${lineY + 52})">${esc(subtitle)}</text>` : ''}
  </g>`;
};
const titleCss = `
  .draw{stroke-dasharray:420;stroke-dashoffset:420;animation:draw 1.4s ease-in-out .3s forwards}
  @keyframes draw{to{stroke-dashoffset:0}}
  .cross{opacity:0;animation:pop .4s ease-out forwards}
  @keyframes pop{to{opacity:1}}`;

// ---------- HERO ----------
const BAT = 'M0 0 C6 -10 14 -10 18 -2 C20 -6 24 -6 26 -2 C30 -10 38 -10 44 0 C36 -2 32 2 30 6 C27 3 25 4 22 8 C19 4 17 3 14 6 C12 2 8 -2 0 0Z';

const spiderWeb = (x, y, size, rotate = 0, opacity = 1) => {
  const spokes = [0, 15, 30, 45, 60, 75, 90];
  const rings = [30, 58, 88, 120, 150];
  const xy = (r, deg) => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180)];
  const lines = spokes.map((d) => { const [a, b] = xy(160, d); return `M0 0 L${a.toFixed(1)} ${b.toFixed(1)}`; }).join(' ');
  const ringPaths = rings.map((r) => spokes.slice(0, -1).map((d, i) => {
    const [x1, y1] = xy(r, d); const [x2, y2] = xy(r, spokes[i + 1]); const [qx, qy] = xy(r * 0.86, d + 7.5);
    return `${i === 0 ? `M${x1.toFixed(1)} ${y1.toFixed(1)}` : ''} Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }).join(' ')).join(' ');
  return `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${size / 160})" opacity="${opacity}"><path d="${lines} ${ringPaths}" fill="none" stroke="#e2e8f0" stroke-opacity=".28" stroke-width="${0.8 * 160 / size}"/></g>`;
};

const pumpkin = (x, y, size, delay = 0) =>
  `<g class="bob" style="animation-delay:${delay}s"><text class="emoji" x="${x}" y="${y}" font-size="${size}">🎃</text></g>`;

function buildHero() {
  const W = 1280, H = 660;
  const moon = { cx: 60, cy: 240, r: 200 };
  const L = 262; // coluna da esquerda
  const cardX = 812, cardY = 170, cardW = 420;

  const json = [
    [0, `<tspan fill="#fcd34d">{</tspan>`],
    [1, `<tspan fill="#d8b4fe">"name"</tspan><tspan fill="#6b7280">: </tspan><tspan fill="#fecdd3">"Guilherme Moraes da Silva"</tspan><tspan fill="#6b7280">,</tspan>`],
    [1, `<tspan fill="#d8b4fe">"role"</tspan><tspan fill="#6b7280">: </tspan><tspan fill="#fecdd3">"Full-Stack Developer"</tspan><tspan fill="#6b7280">,</tspan>`],
    [1, `<tspan fill="#d8b4fe">"skills"</tspan><tspan fill="#6b7280">: </tspan><tspan fill="#e879f9">[</tspan>`],
    [2, `<tspan fill="#fecdd3">"React"</tspan><tspan fill="#6b7280">,</tspan>`],
    [2, `<tspan fill="#fecdd3">"Node"</tspan><tspan fill="#6b7280">,</tspan>`],
    [2, `<tspan fill="#fecdd3">"TypeScript"</tspan>`],
    [1, `<tspan fill="#e879f9">]</tspan><tspan fill="#6b7280">,</tspan>`],
    [1, `<tspan fill="#d8b4fe">"mood"</tspan><tspan fill="#6b7280">: </tspan><tspan fill="#f43f5e">"💀 always shipping"</tspan><tspan fill="#6b7280">,</tspan>`],
    [1, `<tspan fill="#d8b4fe">"theme"</tspan><tspan fill="#6b7280">: </tspan><tspan fill="#f43f5e">"dark"</tspan><tspan fill="#6b7280">,</tspan>`],
    [1, `<tspan fill="#d8b4fe">"company"</tspan><tspan fill="#6b7280">: </tspan><tspan fill="#fecdd3">"Webcontinental"</tspan>`],
    [0, `<tspan fill="#fcd34d">}</tspan>`],
  ];
  const lh = 23, codeTop = cardY + 102, fs = 14, ch = 0.6 * fs;
  const codeLines = json.map(([indent, content], i) => {
    const y = codeTop + i * lh;
    const last = i === json.length - 1;
    const guides = Array.from({ length: indent }, (_, l) => `<line x1="${cardX + 48 + l * ch * 2}" y1="${y - 17}" x2="${cardX + 48 + l * ch * 2}" y2="${y + 8}" stroke="#fff" stroke-opacity=".07"/>`).join('');
    const delay = (1.2 + i * 0.22).toFixed(2);
    return `
      ${last ? `<rect x="${cardX}" y="${y - 17}" width="${cardW}" height="${lh}" fill="#f43f5e" fill-opacity=".06"/>` : ''}
      <text class="mono" x="${cardX + 36}" y="${y}" font-size="${fs}" fill="${last ? '#fb7185' : '#4b5563'}" text-anchor="end">${i + 1}</text>
      ${guides}
      <text class="mono" x="${cardX + 48 + indent * ch * 2}" y="${y}" font-size="${fs}" xml:space="preserve">${content}</text>
      ${last ? `<rect class="blink" x="${cardX + 48 + ch + 2}" y="${y - 14}" width="2" height="18" fill="#fb7185"/>` : ''}
      <rect class="wipe" x="${cardX + 44}" y="${y - 18}" width="${cardW - 46}" height="${lh}" fill="#0b0609" style="animation-delay:${delay}s"/>`;
  }).join('');

  const badges = [
    { e: '⛓️', x: cardX + cardW - 34, y: cardY - 50, size: 72, fs: 38, from: '#4c0519', to: '#000', border: '#be123c', delay: 0, beat: true },
    { e: '💀', x: cardX - 34, y: cardY + 362, size: 72, fs: 38, from: '#3b0764', to: '#000', border: '#7e22ce', delay: 0.8 },
    { e: '🥀', x: cardX + cardW - 6, y: cardY + 150, size: 56, fs: 24, from: '#000', to: '#4c0519', border: '#9f1239', delay: 1.6 },
    { e: '🦇', x: cardX + 70, y: cardY - 62, size: 56, fs: 24, from: '#000', to: '#3b0764', border: '#6b21a8', delay: 2.2 },
  ].map((b, i) => `
    <g class="float" style="animation-delay:-${b.delay}s">
      <defs><linearGradient id="bdg${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${b.from}"/><stop offset="1" stop-color="${b.to}"/></linearGradient></defs>
      <rect x="${b.x}" y="${b.y}" width="${b.size}" height="${b.size}" rx="16" fill="url(#bdg${i})" stroke="${b.border}" stroke-opacity=".6" filter="url(#badgeshadow)"/>
      <text class="emoji ${b.beat ? 'heartbeat fb' : ''}" x="${b.x + b.size / 2}" y="${b.y + b.size / 2 + b.fs * 0.36}" font-size="${b.fs}" text-anchor="middle">${b.e}</text>
    </g>`).join('');

  const pillText = 'DESENVOLVEDOR FULL-STACK';
  const pillW = measure(pillText, 'mono', 15, 15 * 0.25) + 76;

  const tagline = 'NÃO É UMA FASE, É UMA STACK';
  const tagW = measure(tagline, 'marker', 24, 0) ;

  const stars = [[-8, 12], [5, -10], [-14, 70], [20, 108], [78, -12], [104, 35], [92, 96], [50, -18]]
    .map(([t, l], i) => `<circle class="twinkle fb" cx="${moon.cx - moon.r + (l / 100) * moon.r * 2}" cy="${moon.cy - moon.r + (t / 100) * moon.r * 2}" r="2" fill="#ffe4e6" filter="url(#starglow)" style="animation-delay:${[0, 1.2, 2.1, 0.6, 1.8, 2.7, 0.9, 3.3][i]}s"/>`).join('');

  const bats = [[0.30, 0, 9, 1], [0.55, 3.2, 11, 0.7], [0.42, 6.5, 8, 0.85]]
    .map(([top, delay, dur, sc]) => `<g class="mbat" style="animation-delay:${delay}s;animation-duration:${dur}s"><g transform="translate(${moon.cx - 22} ${moon.cy - moon.r + top * moon.r * 2}) scale(${sc})"><path class="mflap fb" d="${BAT}" fill="#000"/></g></g>`).join('');

  const css = `
    .rise{animation:rise 2.2s cubic-bezier(.22,1,.36,1) both}
    @keyframes rise{from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1}}
    .halo{transform-origin:${moon.cx}px ${moon.cy}px;animation:halo 7s ease-in-out infinite alternate}
    @keyframes halo{from{transform:scale(.94);opacity:.65}to{transform:scale(1.06);opacity:1}}
    .rim{transform-origin:${moon.cx}px ${moon.cy}px;animation:rim 3.5s ease-in-out infinite alternate}
    @keyframes rim{from{transform:scale(.95);opacity:.45}to{transform:scale(1.05);opacity:1}}
    .breathe{transform-origin:${moon.cx}px ${moon.cy}px;animation:breathe 8s ease-in-out infinite alternate}
    @keyframes breathe{from{transform:translateY(0) scale(1) rotate(-2.5deg)}to{transform:translateY(-10px) scale(1.04) rotate(2.5deg)}}
    .mult{mix-blend-mode:multiply}.scr{mix-blend-mode:screen}
    .mbat{opacity:0;animation:mbat 9s linear infinite}
    @keyframes mbat{0%{transform:translate(-${moon.r * 0.8}px,30px) scale(.5) rotate(-8deg);opacity:0}12%{opacity:1}50%{transform:translate(0,-25px) scale(.85) rotate(6deg)}88%{opacity:1}100%{transform:translate(${moon.r * 0.8}px,10px) scale(1.1) rotate(-4deg);opacity:0}}
    .mflap{animation:mflap .22s ease-in-out infinite alternate}
    @keyframes mflap{from{transform:scale(1,1)}to{transform:scale(1.15,.55)}}
    .spider{transform-origin:0 0;animation:spider 7s ease-in-out infinite}
    @keyframes spider{0%,100%{transform:translateY(-40px) rotate(2deg)}50%{transform:translateY(0) rotate(-2deg)}}
    .letter{animation:drop .6s cubic-bezier(.34,1.56,.64,1) both}
    @keyframes drop{from{transform:translateY(-80px) rotate(-20deg);opacity:0}to{transform:none;opacity:1}}
    .blur-in{animation:blurin .8s ease-out .8s both}
    @keyframes blurin{from{opacity:0;filter:blur(12px);transform:scale(1.4)}to{opacity:1;filter:blur(0);transform:scale(1)}}
    .fade{animation:fade .6s ease-out both}
    @keyframes fade{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
    .under{stroke-dasharray:330;stroke-dashoffset:330;animation:under .8s ease-out 1.7s forwards}
    @keyframes under{to{stroke-dashoffset:0}}
    .wipe{transform-box:fill-box;transform-origin:right;animation:wipe .22s linear both}
    @keyframes wipe{from{transform:scaleX(1)}to{transform:scaleX(0)}}
    .card{animation:card .9s ease-out .6s both}
    @keyframes card{from{opacity:0;transform:translateX(80px)}to{opacity:1;transform:none}}
    .scroll{animation:scrollhint 1.8s ease-in-out infinite}
    @keyframes scrollhint{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}
    .shine{animation:shine 3.5s ease-in-out infinite}
    @keyframes shine{0%{transform:translateX(-160px)}60%,100%{transform:translateX(260px)}}
  `;

  const letters = [...'Guilherme'];
  let lx = L;
  const nameLetters = letters.map((c, i) => {
    const x = lx; lx += measure(c, 'groteskBold', 92) * 1.04;
    return `<text class="sans letter fb" x="${x.toFixed(1)}" y="300" font-size="92" font-weight="700" fill="#fff" style="animation-delay:${(0.2 + i * 0.07).toFixed(2)}s">${c}</text>`;
  }).join('');

  const body = `
  ${backdrop(W, H, '#000000', '#14040a')}
  <defs>
    <radialGradient id="halo" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#dc2626" stop-opacity=".3"/><stop offset=".3" stop-color="#7f1d1d" stop-opacity=".15"/><stop offset=".6" stop-color="#7f1d1d" stop-opacity="0"/></radialGradient>
    <radialGradient id="rimg" cx=".68" cy=".72" r=".5"><stop offset="0" stop-color="#ffcdeb" stop-opacity=".6"/><stop offset=".28" stop-color="#ec4899" stop-opacity=".3"/><stop offset=".58" stop-color="#ec4899" stop-opacity="0"/></radialGradient>
    <linearGradient id="tint" x1=".18" y1=".08" x2=".82" y2=".92"><stop offset="0" stop-color="#a80d08"/><stop offset=".25" stop-color="#c41a10"/><stop offset=".38" stop-color="#d92a18"/><stop offset=".52" stop-color="#ec4a33"/><stop offset=".68" stop-color="#f58f80"/><stop offset=".85" stop-color="#fff1ee"/></linearGradient>
    <radialGradient id="fire" cx=".3" cy=".45" r=".45"><stop offset="0" stop-color="#ff5a1e" stop-opacity=".18"/><stop offset="1" stop-color="#ff5a1e" stop-opacity="0"/></radialGradient>
    <radialGradient id="shine" cx=".78" cy=".8" r=".42"><stop offset="0" stop-color="#ffe1f0" stop-opacity=".45"/><stop offset="1" stop-color="#ffe1f0" stop-opacity="0"/></radialGradient>
    <radialGradient id="shade" cx=".62" cy=".64" r=".7"><stop offset=".55" stop-color="#280004" stop-opacity="0"/><stop offset="1" stop-color="#280004" stop-opacity=".55"/></radialGradient>
    <clipPath id="moonclip"><circle cx="${moon.cx}" cy="${moon.cy}" r="${moon.r}"/></clipPath>
    <filter id="photo" color-interpolation-filters="sRGB"><feComponentTransfer><feFuncR type="linear" slope="1.7825" intercept="-.075"/><feFuncG type="linear" slope="1.7825" intercept="-.075"/><feFuncB type="linear" slope="1.7825" intercept="-.075"/></feComponentTransfer></filter>
    <filter id="moonglow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="30"/></filter>
    <filter id="blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="18"/></filter>
    <filter id="starglow" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="neon" x="-10%" y="-40%" width="120%" height="180%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="a"/><feFlood flood-color="#ff4d6d" flood-opacity=".9"/><feComposite in2="a" operator="in" result="g1"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="b"/><feFlood flood-color="#e11d48" flood-opacity=".7"/><feComposite in2="b" operator="in" result="g2"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="16" result="c"/><feFlood flood-color="#e11d48" flood-opacity=".45"/><feComposite in2="c" operator="in" result="g3"/>
      <feMerge><feMergeNode in="g3"/><feMergeNode in="g2"/><feMergeNode in="g1"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="pillglow" x="-20%" y="-60%" width="140%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#e11d48" flood-opacity=".25"/></filter>
    <filter id="cardshadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="25" stdDeviation="25" flood-color="#000" flood-opacity=".8"/><feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="#e11d48" flood-opacity=".2"/></filter>
    <filter id="badgeshadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#4c0519" flood-opacity=".6"/></filter>
    <filter id="btnshadow" x="-30%" y="-60%" width="160%" height="260%"><feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#e11d48" flood-opacity=".45"/></filter>
    <linearGradient id="btn" x1="0" x2="1"><stop offset="0" stop-color="#be123c"/><stop offset=".5" stop-color="#e11d48"/><stop offset="1" stop-color="#6d28d9"/></linearGradient>
    <linearGradient id="shinegrad" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="thread" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cbd5e1" stop-opacity="0"/><stop offset=".5" stop-color="#cbd5e1" stop-opacity=".4"/><stop offset="1" stop-color="#cbd5e1" stop-opacity=".6"/></linearGradient>
    <clipPath id="btnclip"><rect x="${L}" y="560" width="210" height="44" rx="8"/></clipPath>
    <clipPath id="cardclip"><rect x="${cardX}" y="${cardY}" width="${cardW}" height="404" rx="16"/></clipPath>
  </defs>

  ${particles(W, H, 3)}
  ${ghost(985, 395, '👻', 26, 0.4)}
  ${ghost(1150, 120, '🥀', 22, 1.3)}
  ${ghost(1160, 600, '💀', 28, 2.2, 0.12)}
  ${ghost(170, 590, '🦇', 24, 1.1, 0.12)}

  <!-- lua de sangue -->
  <g class="rise">
    <circle class="halo" cx="${moon.cx}" cy="${moon.cy}" r="${moon.r * 1.9}" fill="url(#halo)"/>
    <circle class="rim" cx="${moon.cx}" cy="${moon.cy}" r="${moon.r * 1.36}" fill="url(#rimg)" filter="url(#blur)"/>
    ${stars}
    <g class="breathe">
      <circle cx="${moon.cx}" cy="${moon.cy}" r="${moon.r}" fill="#be1818" fill-opacity=".55" filter="url(#moonglow)"/>
      <g clip-path="url(#moonclip)" style="isolation:isolate">
        <image href="data:image/jpeg;base64,${b64('moon.jpg')}" x="${moon.cx - moon.r * 1.03}" y="${moon.cy - moon.r * 1.03}" width="${moon.r * 2.06}" height="${moon.r * 2.06}" preserveAspectRatio="xMidYMid slice" filter="url(#photo)"/>
        <rect class="mult" x="${moon.cx - moon.r * 1.6}" y="${moon.cy - moon.r * 1.6}" width="${moon.r * 3.2}" height="${moon.r * 3.2}" fill="url(#tint)"/>
        <circle class="scr" cx="${moon.cx}" cy="${moon.cy}" r="${moon.r}" fill="url(#fire)"/>
        <circle class="scr" cx="${moon.cx}" cy="${moon.cy}" r="${moon.r}" fill="url(#shine)"/>
        <circle cx="${moon.cx}" cy="${moon.cy}" r="${moon.r}" fill="url(#shade)"/>
      </g>
    </g>
    ${bats}
  </g>

  ${spiderWeb(0, 70, 190)}
  ${spiderWeb(W, H, 130, 180, 0.7)}

  <!-- aranha pendurada -->
  <g transform="translate(${W * 0.38} 0)"><g class="spider">
    <rect x="-.5" y="0" width="1" height="150" fill="url(#thread)"/>
    <text class="emoji" x="0" y="176" font-size="28" text-anchor="middle" style="filter:brightness(0) drop-shadow(0 0 6px rgba(225,29,72,.6))">🕷️</text>
  </g></g>

  <!-- coluna esquerda -->
  <g class="fade" style="animation-duration:.6s">
    <rect x="${L}" y="${150}" width="${pillW}" height="50" rx="25" fill="#000" fill-opacity=".6" stroke="#be123c" stroke-opacity=".5" filter="url(#pillglow)"/>
    <circle class="ping fb" cx="${L + 30}" cy="175" r="5" fill="#f43f5e"/>
    <circle cx="${L + 30}" cy="175" r="5" fill="#f43f5e"/>
    <text class="mono flicker" x="${L + 48}" y="180.5" font-size="15" fill="#fecdd3" letter-spacing="3.75">${pillText}</text>
  </g>

  ${nameLetters}
  <g class="blur-in fb" filter="url(#neon)">${glitchText('Moraes da Silva', L - 2, 385, 'gothic', 84, '#e11d48')}</g>

  <g transform="rotate(-3 ${L} 430)" class="fade" style="animation-delay:1.3s">
    <text class="marker" x="${L}" y="438" font-size="24" fill="#d1d5db">${tagline}</text>
    <g transform="translate(${L + tagW + 22} 430)"><text class="emoji heartbeat fb" font-size="24" text-anchor="middle" y="8">🥀</text></g>
    <path class="under" d="M${L + 2} 452 C ${L + 60} 446, ${L + 120} 456, ${L + 180} 449 S ${L + 270} 454, ${L + 320} 448" fill="none" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
  </g>

  <g class="fade" style="animation-delay:1.5s">
    <text class="sans" x="${L}" y="502" font-size="17" fill="#9ca3af">Desenvolvedor apaixonado por criar soluções web modernas e</text>
    <text class="sans" x="${L}" y="530" font-size="17" fill="#9ca3af">escaláveis, com foco em experiência do usuário e performance.</text>
  </g>

  <g class="fade" style="animation-delay:1.7s">
    <g filter="url(#btnshadow)"><rect x="${L}" y="560" width="210" height="44" rx="8" fill="url(#btn)" stroke="#fb7185" stroke-opacity=".4"/></g>
    <g clip-path="url(#btnclip)"><rect class="shine" x="${L}" y="560" width="70" height="44" fill="url(#shinegrad)" transform="skewX(-20)"/></g>
    ${icon('DownloadOutlined', L + 30, 573, 18, '#fff')}
    <text class="sans" x="${L + 56}" y="588" font-size="17" font-weight="600" fill="#fff">Baixar currículo</text>
    <rect x="${L + 228}" y="558" width="48" height="48" rx="12" fill="#000" fill-opacity=".6" stroke="#e11d48" stroke-opacity=".5"/>
    ${icon('GithubOutlined', L + 241, 571, 22, '#fda4af')}
    <rect x="${L + 290}" y="558" width="48" height="48" rx="12" fill="#000" fill-opacity=".6" stroke="#e11d48" stroke-opacity=".5"/>
    ${icon('LinkedinOutlined', L + 303, 571, 22, '#fda4af')}
  </g>

  <!-- editor developer.json -->
  <g class="card">
    <g filter="url(#cardshadow)"><rect x="${cardX}" y="${cardY}" width="${cardW}" height="404" rx="16" fill="#0b0609"/></g>
    <g clip-path="url(#cardclip)">
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="46" fill="#000" fill-opacity=".8"/>
      <line x1="${cardX}" y1="${cardY + 46}" x2="${cardX + cardW}" y2="${cardY + 46}" stroke="#881337" stroke-opacity=".5"/>
      <circle cx="${cardX + 22}" cy="${cardY + 23}" r="6" fill="#e11d48"/><circle cx="${cardX + 42}" cy="${cardY + 23}" r="6" fill="#6b21a8"/><circle cx="${cardX + 62}" cy="${cardY + 23}" r="6" fill="#3f3f46"/>
      <rect x="${cardX + 84}" y="${cardY + 8}" width="168" height="38" fill="#0b0609"/>
      <rect x="${cardX + 84}" y="${cardY + 8}" width="168" height="2" fill="#f43f5e"/>
      <text class="mono" x="${cardX + 100}" y="${cardY + 32}" font-size="12"><tspan fill="#fcd34d" fill-opacity=".9">{}</tspan><tspan fill="#ffe4e6" dx="8">developer.json</tspan><tspan fill="#6b7280" dx="8">×</tspan></text>
      <text class="mono" x="${cardX + 272}" y="${cardY + 32}" font-size="12" fill="#4b5563"><tspan fill="#a78bfa" fill-opacity=".7">#</tspan> mood.css</text>
      <text class="mono" x="${cardX + 16}" y="${cardY + 66}" font-size="11" fill="#6b7280">src <tspan fill="#374151">›</tspan> about <tspan fill="#374151">›</tspan> <tspan fill="#9ca3af">developer.json</tspan></text>
      <line x1="${cardX}" y1="${cardY + 76}" x2="${cardX + cardW}" y2="${cardY + 76}" stroke="#fff" stroke-opacity=".05"/>
      ${codeLines}
      <rect x="${cardX}" y="${cardY + 376}" width="${cardW}" height="28" fill="#4c0519" fill-opacity=".8"/>
      <line x1="${cardX}" y1="${cardY + 376}" x2="${cardX + cardW}" y2="${cardY + 376}" stroke="#881337" stroke-opacity=".6"/>
      <text class="mono" x="${cardX + 16}" y="${cardY + 394}" font-size="11" fill="#fecdd3" fill-opacity=".8">⎇ main   <tspan fill="#34d399" fill-opacity=".8">✓ 0 problems</tspan></text>
      <text class="mono" x="${cardX + cardW - 16}" y="${cardY + 394}" font-size="11" fill="#fecdd3" fill-opacity=".8" text-anchor="end" xml:space="preserve">Ln 12, Col 2   UTF-8   JSON</text>
    </g>
    <rect x="${cardX + .5}" y="${cardY + .5}" width="${cardW - 1}" height="403" rx="16" fill="none" stroke="#881337" stroke-opacity=".6"/>
    ${badges}
  </g>

  ${pumpkin(30, 640, 34, 2)}
  ${pumpkin(86, 636, 26, 2.3)}

  <g class="scroll">
    <text class="emoji" x="${W / 2}" y="620" font-size="20" text-anchor="middle">🦇</text>
    <text class="mono" x="${W / 2 + 3}" y="642" font-size="10" fill="#fb7185" fill-opacity=".8" letter-spacing="4" text-anchor="middle">ROLAR</text>
  </g>
  ${overlays(W, H)}`;

  return svg(W, H, ['grotesk', 'mono', 'pirata', 'marker'], body, css, 'Guilherme Moraes da Silva — Desenvolvedor Full-Stack');
}

// ---------- MARQUEE (EmoMarquee) ----------
function buildMarquee({ reverse = false, tilt = -2 } = {}) {
  const W = 1200, H = 96;
  const phrases = ['não é uma fase, é uma stack', 'dark mode pra sempre', 'console.log("funcionou!")', 'zero bugs em produção', 'git commit -m "agora vai"'];
  const seps = ['🕸️', '✖', '🥀', '⛓', '💀'];
  const size = 20, spacing = size * 0.1, gap = 40;
  const items = phrases.flatMap((p, i) => [{ t: p.toUpperCase(), phrase: true }, { t: seps[i], phrase: false }]);
  let x = 0;
  const placed = [];
  for (const it of items) {
    const w = it.phrase ? measure(it.t, 'marker', size, spacing) : size * 1.15;
    placed.push({ ...it, x });
    x += w + gap;
  }
  const loop = x;
  const render = (offset) => placed.map((p) => p.phrase
    ? `<text class="marker" x="${(p.x + offset).toFixed(1)}" y="${H / 2 + 7}" font-size="${size}" fill="#e5e7eb" letter-spacing="${spacing}" xml:space="preserve">${esc(p.t)}</text>`
    : `<text class="${p.t === '✖' || p.t === '⛓' ? 'sans' : 'emoji'}" x="${(p.x + offset).toFixed(1)}" y="${H / 2 + 7}" font-size="${size}" fill="#f43f5e">${p.t}</text>`).join('');
  const css = `.track{animation:mq ${reverse ? 34 : 28}s linear infinite ${reverse ? 'reverse' : ''}}@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-${loop.toFixed(1)}px)}}`;
  const body = `
  <defs><filter id="bandglow" x="-5%" y="-80%" width="110%" height="260%"><feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="#e11d48" flood-opacity=".25"/></filter></defs>
  <g transform="rotate(${tilt} ${W / 2} ${H / 2}) translate(${W / 2} ${H / 2}) scale(1.06) translate(${-W / 2} ${-H / 2})">
    <rect x="-20" y="${H / 2 - 26}" width="${W + 40}" height="52" fill="#000" filter="url(#bandglow)"/>
    <rect x="-20" y="${H / 2 - 26}" width="${W + 40}" height="2" fill="#be123c" fill-opacity=".7"/>
    <rect x="-20" y="${H / 2 + 24}" width="${W + 40}" height="2" fill="#be123c" fill-opacity=".7"/>
    <svg x="0" y="${H / 2 - 24}" width="${W}" height="48" viewBox="0 ${H / 2 - 24} ${W} 48" overflow="hidden"><g class="track">${render(0)}${render(loop)}${render(loop * 2)}</g></svg>
  </g>`;
  return svg(W, H, ['marker', 'grotesk'], body, css, phrases.join(' · '));
}

// ---------- SKILLS ----------
const SKILLS = [
  { name: 'GOLANG', icon: 'SiGo', color: '#00ADD8', category: 'backend' },
  { name: 'REACT', icon: 'SiReact', color: '#61DAFB', category: 'frontend' },
  { name: 'TYPESCRIPT', icon: 'SiTypescript', color: '#3178C6', category: 'frontend' },
  { name: 'DOCKER', icon: 'SiDocker', color: '#2496ED', category: 'tools' },
  { name: 'MYSQL', icon: 'SiMysql', color: '#4479A1', category: 'tools' },
  { name: 'NODEJS', icon: 'SiNodedotjs', color: '#339933', category: 'backend' },
  { name: 'MONGODB', icon: 'SiMongodb', color: '#47A248', category: 'tools' },
  { name: 'RABBIT', icon: 'SiRabbitmq', color: '#FF6600', category: 'tools' },
  { name: 'NESTJS', icon: 'SiNestjs', color: '#E0234E', category: 'backend' },
  { name: 'JAVASCRIPT', icon: 'SiJavascript', color: '#F7DF1E', category: 'frontend' },
];

function buildSkills() {
  const W = 1200;
  const cats = [
    { key: 'frontend', label: 'Frontend', emoji: '🦇', cmd: 'npm run dev' },
    { key: 'backend', label: 'Backend', emoji: '⛓️', cmd: 'go run ./cmd' },
    { key: 'tools', label: 'Ferramentas', emoji: '🕸️', cmd: 'docker compose up' },
  ];
  const maxItems = Math.max(...cats.map((c) => SKILLS.filter((s) => s.category === c.key).length));
  const top = 250, gap = 28, pw = (1152 - gap * 2) / 3, chipH = 64, chipGap = 12;
  const ph = 20 + 36 + 22 + 16 + 20 + maxItems * chipH + (maxItems - 1) * chipGap + 20;
  const stripY = top + ph + 60;
  const H = stripY + 70;

  const panels = cats.map((c, ci) => {
    const x = 24 + ci * (pw + gap);
    const items = SKILLS.filter((s) => s.category === c.key);
    const chips = items.map((s, i) => {
      const cy = top + 20 + 36 + 22 + 16 + 20 + i * (chipH + chipGap);
      return `
      <g class="chip" style="animation-delay:${(0.35 + i * 0.08 + ci * 0.15).toFixed(2)}s">
        <rect x="${x + 20}" y="${cy}" width="${pw - 40}" height="${chipH}" rx="12" fill="#09090b" fill-opacity=".8" stroke="#fff" stroke-opacity=".05"/>
        <rect x="${x + 34}" y="${cy + 12}" width="40" height="40" rx="8" fill="${s.color}" fill-opacity=".094"/>
        <rect x="${x + 34.5}" y="${cy + 12.5}" width="39" height="39" rx="7.5" fill="none" stroke="${s.color}" stroke-opacity=".25"/>
        <g filter="url(#iglow${s.icon})">${icon(s.icon, x + 44, cy + 22, 20, s.color)}</g>
        ${glitchText(s.name, x + 86, cy + 37, 'sans', 14, '#e5e7eb', 'font-weight="700" letter-spacing="2.8"')}
      </g>`;
    }).join('');
    return `
    <g class="panel" style="animation-delay:${ci * 0.15}s">
      <rect x="${x}" y="${top}" width="${pw}" height="${ph}" rx="16" fill="#000" fill-opacity=".7" stroke="#881337" stroke-opacity=".5"/>
      <circle cx="${x + pw - 4}" cy="${top + 4}" r="80" fill="url(#corner)"/>
      <g transform="translate(${x + 34} ${top + 44})"><text class="emoji wobble fb" font-size="24" text-anchor="middle" y="9">${c.emoji}</text></g>
      <text class="gothic" x="${x + 58}" y="${top + 56}" font-size="32" fill="#fff">${c.label}</text>
      <text class="mono" x="${x + pw - 20}" y="${top + 50}" font-size="12" fill="#fb7185" fill-opacity=".7" text-anchor="end">${String(items.length).padStart(2, '0')}</text>
      <text class="mono" x="${x + 20}" y="${top + 80}" font-size="11"><tspan fill="#f43f5e">❯</tspan><tspan fill="#4b5563"> ${c.cmd}</tspan></text>
      <rect x="${x + 20}" y="${top + 98}" width="${pw - 40}" height="1" fill="url(#divider)"/>
      ${chips}
    </g>`;
  }).join('');

  const strip = [...SKILLS, ...SKILLS, ...SKILLS];
  const step = 36 + 56;
  const loop = SKILLS.length * step;
  const stripIcons = strip.map((s, i) => `<g opacity=".4">${icon(s.icon, i * step, stripY, 36, s.color)}</g>`).join('');

  const glows = [...new Set(SKILLS.map((s) => s.icon))].map((ic) => {
    const s = SKILLS.find((k) => k.icon === ic);
    return `<filter id="iglow${ic}" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${s.color}" flood-opacity=".5"/></filter>`;
  }).join('');

  const css = `${titleCss}
    .panel{animation:panel .9s cubic-bezier(.34,1.3,.64,1) both}
    @keyframes panel{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
    .chip{animation:chip .5s cubic-bezier(.34,1.56,.64,1) both}
    @keyframes chip{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:none}}
    .strip{animation:strip 28s linear infinite}
    @keyframes strip{from{transform:translateX(0)}to{transform:translateX(-${loop}px)}}`;

  const body = `
  ${backdrop(W, H, '#14040a', '#0d0410')}
  <defs>
    ${titleDefs}
    ${glows}
    <radialGradient id="corner" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#e11d48" stop-opacity=".18"/><stop offset="1" stop-color="#e11d48" stop-opacity="0"/></radialGradient>
    <linearGradient id="divider" x1="0" x2="1"><stop offset="0" stop-color="#be123c" stop-opacity=".6"/><stop offset=".5" stop-color="#881337" stop-opacity=".3"/><stop offset="1" stop-color="#881337" stop-opacity="0"/></linearGradient>
    <linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".15" stop-color="#fff"/><stop offset=".85" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="stripmask"><rect x="0" y="${stripY - 10}" width="${W}" height="60" fill="url(#fade)"/></mask>
  </defs>
  ${particles(W, H, 7)}
  ${ghost(60, 160, '🥀', 22, 0.5, 0.15)}
  ${ghost(1140, 200, '👻', 24, 1.5, 0.12)}
  ${sectionTitle(W / 2, 20, 'Habilidades', '⛓️', 'Tecnologias e ferramentas que domino')}
  ${panels}
  <g mask="url(#stripmask)"><g class="strip">${stripIcons}</g></g>
  ${overlays(W, H)}`;

  return svg(W, H, ['grotesk', 'mono', 'pirata', 'marker'], body, css, 'Habilidades');
}

// ---------- REPOS ----------
const LANG_COLORS = { 'C#': '#178600', JavaScript: '#f1e05a', TypeScript: '#3178c6', Go: '#00ADD8', PHP: '#4F5D95', Vue: '#41b883', HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', Python: '#3572A5', 'Inno Setup': '#264b99' };
const colorOf = (l) => LANG_COLORS[l] ?? '#e11d48';

const relative = (iso) => {
  const fmt = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  const days = (new Date(iso).getTime() - Date.now()) / 86_400_000;
  const units = [['year', 365], ['month', 30], ['week', 7], ['day', 1]];
  const [unit, size] = units.find(([, len]) => Math.abs(days) >= len) ?? ['hour', 1 / 24];
  return fmt.format(Math.round(days / size), unit);
};

async function fetchRepo() {
  const headers = { Accept: 'application/vnd.github+json', 'User-Agent': USER };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const get = async (url) => { const r = await fetch(url, { headers }); if (!r.ok) throw new Error(`${r.status} ${url}`); return r.json(); };
  const repos = (await get(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`))
    .filter((r) => !r.fork && !r.archived && r.name.toLowerCase() !== USER.toLowerCase());
  if (!repos.length) return null;
  const r = repos[0];
  const base = `https://api.github.com/repos/${USER}/${r.name}`;
  const [languages, commits] = await Promise.all([get(`${base}/languages`).catch(() => ({})), get(`${base}/commits?per_page=4`).catch(() => [])]);
  return {
    name: r.name, description: r.description, url: r.html_url, stars: r.stargazers_count, forks: r.forks_count,
    language: r.language, pushedAt: r.pushed_at, topics: r.topics ?? [], languages,
    commits: commits.map((c) => ({ sha: c.sha.slice(0, 7), message: c.commit.message.split('\n')[0], date: c.commit.author?.date ?? c.commit.committer?.date })),
  };
}

function buildRepos(repo) {
  const W = 1200, H = 640;
  const cx = 88, cy = 270, cw = 1024, chh = 320;
  const lw = Math.round((cw * 1) / 2.05);
  const rx = cx + lw;
  const rw = cw - lw;

  const total = Object.values(repo.languages).reduce((a, b) => a + b, 0);
  const shares = total
    ? Object.entries(repo.languages).map(([name, bytes]) => ({ name, percent: (bytes / total) * 100 })).sort((a, b) => b.percent - a.percent)
    : repo.language ? [{ name: repo.language, percent: 100 }] : [];

  const L = cx + 32;
  const pillText = `Último push · ${relative(repo.pushedAt)}`;
  const pillW = measure(pillText, 'mono', 11) + 40;
  const barW = lw - 64;
  let bx = L;
  const bar = shares.map((s) => { const w = (s.percent / 100) * barW; const r = `<rect x="${bx.toFixed(1)}" y="${cy + 196}" width="${w.toFixed(1)}" height="8" fill="${colorOf(s.name)}"/>`; bx += w; return r; }).join('');
  let lgx = L;
  const legend = shares.slice(0, 4).map((s) => {
    const label = `${s.name}`; const pct = `${s.percent.toFixed(1)}%`;
    const out = `<circle cx="${lgx + 4}" cy="${cy + 223}" r="4" fill="${colorOf(s.name)}"/><text class="mono" x="${lgx + 13}" y="${cy + 227}" font-size="11"><tspan fill="#e5e7eb">${esc(label)}</tspan><tspan fill="#9ca3af"> ${pct}</tspan></text>`;
    lgx += 13 + measure(`${label} ${pct}`, 'mono', 11) + 18;
    return out;
  }).join('');

  const desc = repo.description || 'Ainda sem descrição.';
  const commitLines = repo.commits.map((c, i) => {
    const y = cy + 108 + i * 42;
    const msg = truncate(c.message, 'mono', 12, rw - 120);
    return `<g class="line" style="animation-delay:${(0.4 + (i + 1) * 0.25).toFixed(2)}s">
      <text class="mono" x="${rx + 20}" y="${y}" font-size="12" fill="#fcd34d">${c.sha}</text>
      <text class="mono" x="${rx + 82}" y="${y}" font-size="12" fill="#e5e7eb">${esc(msg)}</text>
      <text class="mono" x="${rx + 82}" y="${y + 17}" font-size="12" fill="#4b5563">${esc(relative(c.date))}</text>
    </g>`;
  }).join('');
  const promptY = cy + 108 + repo.commits.length * 42 + 6;

  const css = `${titleCss}
    .card{animation:card .9s cubic-bezier(.34,1.2,.64,1) both}
    @keyframes card{from{opacity:0;transform:translateY(60px)}to{opacity:1;transform:none}}
    .line{opacity:0;animation:line .4s ease-out forwards}
    @keyframes line{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:none}}
    .shine{animation:shine 3.5s ease-in-out infinite}
    @keyframes shine{0%{transform:translateX(-120px)}60%,100%{transform:translateX(200px)}}`;

  const body = `
  ${backdrop(W, H, '#0d0410', '#12030a')}
  <defs>
    ${titleDefs}
    <filter id="blob" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
    <filter id="cardshadow" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="25" stdDeviation="28" flood-color="#000" flood-opacity=".6"/></filter>
    <clipPath id="cardclip"><rect x="${cx}" y="${cy}" width="${cw}" height="${chh}" rx="16"/></clipPath>
    <clipPath id="btnclip"><rect x="${L}" y="${cy + 252}" width="80" height="34" rx="6"/></clipPath>
    <linearGradient id="btn" x1="0" x2="1"><stop offset="0" stop-color="#be123c"/><stop offset="1" stop-color="#e11d48"/></linearGradient>
    <linearGradient id="shinegrad" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="barclip"><rect x="${L}" y="${cy + 196}" width="${barW}" height="8" rx="4"/></clipPath>
  </defs>
  ${particles(W, H, 11)}
  ${ghost(70, 560, '🎃', 30, 0.8, 0.25)}
  ${ghost(1120, 600, '💀', 30, 1.8, 0.15)}
  ${ghost(1130, 280, '🕯️', 24, 0.3, 0.2)}
  ${sectionTitle(W / 2, 10, 'Repositórios', '🕷️', 'Projetos e experimentos desenvolvidos')}

  <g class="card">
    <g filter="url(#cardshadow)"><rect x="${cx}" y="${cy}" width="${cw}" height="${chh}" rx="16" fill="#000" fill-opacity=".75"/></g>
    <g clip-path="url(#cardclip)">
      <circle cx="${cx + 50}" cy="${cy + 50}" r="140" fill="#be123c" fill-opacity=".15" filter="url(#blob)"/>

      <rect x="${L}" y="${cy + 32}" width="${pillW}" height="26" rx="13" fill="#4c0519" fill-opacity=".4" stroke="#9f1239" stroke-opacity=".6"/>
      <circle class="ping fb" cx="${L + 16}" cy="${cy + 45}" r="4" fill="#f43f5e"/><circle cx="${L + 16}" cy="${cy + 45}" r="4" fill="#f43f5e"/>
      <text class="mono" x="${L + 28}" y="${cy + 49}" font-size="11" fill="#fecdd3">${esc(pillText)}</text>
      <text class="mono" x="${L + pillW + 14}" y="${cy + 49}" font-size="11" fill="#6b7280">★ ${repo.stars} · ⑂ ${repo.forks}</text>

      ${glitchText(repo.name, L, cy + 128, 'gothic', 60, '#fff')}
      <text class="sans" x="${L}" y="${cy + 166}" font-size="16" fill="${repo.description ? '#d1d5db' : '#6b7280'}" ${repo.description ? '' : 'font-style="italic"'}>${esc(truncate(desc, 'grotesk', 16, lw - 64))}</text>

      <rect x="${L}" y="${cy + 196}" width="${barW}" height="8" rx="4" fill="#18181b"/>
      <g clip-path="url(#barclip)">${bar}</g>
      ${legend}

      <rect x="${L}" y="${cy + 252}" width="80" height="34" rx="6" fill="url(#btn)"/>
      <g clip-path="url(#btnclip)"><rect class="shine" x="${L}" y="${cy + 252}" width="50" height="34" fill="url(#shinegrad)" transform="skewX(-20)"/></g>
      ${icon('GithubOutlined', L + 14, cy + 262, 14, '#fff')}
      <text class="sans" x="${L + 34}" y="${cy + 274}" font-size="13" font-weight="600" fill="#fff">Code</text>
      <rect x="${L + 90}" y="${cy + 252.5}" width="88" height="33" rx="6" fill="none" stroke="#3f3f46"/>
      ${icon('CopyOutlined', L + 104, cy + 262, 14, '#d1d5db')}
      <text class="sans" x="${L + 125}" y="${cy + 274}" font-size="13" fill="#d1d5db">Clonar</text>

      <rect x="${rx}" y="${cy}" width="${rw}" height="${chh}" fill="#07040a"/>
      <line x1="${rx}" y1="${cy}" x2="${rx}" y2="${cy + chh}" stroke="#881337" stroke-opacity=".4"/>
      <rect x="${rx}" y="${cy}" width="${rw}" height="42" fill="#000" fill-opacity=".6"/>
      <line x1="${rx}" y1="${cy + 42}" x2="${rx + rw}" y2="${cy + 42}" stroke="#fff" stroke-opacity=".05"/>
      <circle cx="${rx + 22}" cy="${cy + 21}" r="5" fill="#e11d48"/><circle cx="${rx + 38}" cy="${cy + 21}" r="5" fill="#6b21a8"/><circle cx="${rx + 54}" cy="${cy + 21}" r="5" fill="#3f3f46"/>
      <text class="mono" x="${rx + 72}" y="${cy + 25}" font-size="12" fill="#6b7280">~/repos/${esc(repo.name)}</text>
      <rect x="${rx}" y="${cy + 42}" width="${rw}" height="${chh - 42}" fill="url(#scan)"/>
      <g class="line" style="animation-delay:.4s"><text class="mono" x="${rx + 20}" y="${cy + 74}" font-size="12" fill="#9ca3af"><tspan fill="#f43f5e">❯</tspan> git log --oneline -${repo.commits.length || 1}</text></g>
      ${commitLines}
      <g class="line" style="animation-delay:${(0.4 + (repo.commits.length + 1) * 0.25).toFixed(2)}s">
        <text class="mono" x="${rx + 20}" y="${promptY}" font-size="12" fill="#f43f5e">❯</text>
        <rect class="blink" x="${rx + 36}" y="${promptY - 11}" width="8" height="14" fill="#fb7185"/>
      </g>
    </g>
    <rect x="${cx + .5}" y="${cy + .5}" width="${cw - 1}" height="${chh - 1}" rx="16" fill="none" stroke="#881337" stroke-opacity=".5"/>
  </g>
  ${overlays(W, H)}`;

  return svg(W, H, ['grotesk', 'mono', 'pirata', 'marker'], body, css, `Repositórios — ${repo.name}`);
}

// botão "Ver todos no GitHub →"
function buildViewAll() {
  const W = 300, H = 64;
  const body = `
  <defs><filter id="g" x="-20%" y="-60%" width="140%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#e11d48" flood-opacity=".25"/></filter></defs>
  <rect x="24" y="10" width="252" height="44" rx="22" fill="#000" fill-opacity=".6" stroke="#be123c" stroke-opacity=".5" filter="url(#g)"/>
  ${icon('GithubOutlined', 50, 23, 18, '#fecdd3')}
  <text class="sans" x="76" y="38" font-size="15" font-weight="600" fill="#fecdd3">Ver todos no GitHub</text>
  <text class="sans arrow" x="234" y="38" font-size="15" font-weight="600" fill="#fecdd3">→</text>`;
  const css = '.arrow{animation:arrow 1.6s ease-in-out infinite}@keyframes arrow{0%,100%{transform:translateX(0)}50%{transform:translateX(4px)}}';
  return svg(W, H, ['grotesk'], body, css, 'Ver todos no GitHub');
}

// botões sociais (About)
function buildSocial(iconName, label) {
  const S = 60;
  const body = `
  <defs><filter id="g" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#e11d48" flood-opacity=".35"/></filter></defs>
  <rect x="8" y="8" width="44" height="44" rx="12" fill="#000" stroke="#9f1239" stroke-opacity=".6" stroke-width="2" filter="url(#g)"/>
  ${icon(iconName, 20, 20, 20, '#fb7185')}`;
  return svg(S, S, [], body, '', label);
}

// ---------- ABOUT ----------
function buildAbout() {
  const W = 1200, H = 680;
  const gx = 88, top = 230;
  const av = { cx: gx + 120, cy: top + 150, r: 112 };
  const cardX = gx + 240 + 56, cardW = 1024 - 240 - 56, cardY = top + 20, cardH = 372;

  const p1 = ['Desenvolvedor Full Stack com experiência em criar aplicações web modernas e', 'escaláveis. Apaixonado por tecnologia e sempre em busca de novos desafios.'];
  const p2 = ['Especializado em JavaScript, React, Node.js e bancos de dados relacionais.', 'Comprometido em escrever código limpo e manterível, seguindo as melhores', 'práticas do mercado.'];
  const tx = cardX + 56;
  const para = (lines, y0, delay) => `<g class="blurin" style="animation-delay:${delay}s">${lines.map((l, i) => `<text class="sans" x="${tx}" y="${y0 + i * 25}" font-size="16" fill="#d1d5db">${esc(l)}</text>`).join('')}</g>`;

  const orbit = ['🕷️', '🥀', '⛓️', '🦇'].map((e, i) => {
    const a = (i * Math.PI) / 2;
    const R = av.r + 40;
    return `<g transform="translate(${(av.cx + R * Math.sin(a)).toFixed(1)} ${(av.cy - R * Math.cos(a)).toFixed(1)})"><g class="counter"><text class="emoji" font-size="24" text-anchor="middle" y="9">${e}</text></g></g>`;
  }).join('');

  const statW = (cardW - 56 - 32 - 16) / 2;
  const stats = [['NOME', 'Guilherme Moraes da Silva', 16], ['EMAIL', 'dev.moraes.codes@gmail.com', 14]].map(([label, value, fs], i) => {
    const x = tx + i * (statW + 16), y = cardY + 262;
    return `<g class="pop" style="animation-delay:${0.8 + i * 0.15}s">
      <rect x="${x}" y="${y}" width="${statW}" height="80" rx="12" fill="#09090b" fill-opacity=".8" stroke="#881337" stroke-opacity=".4"/>
      <text class="sans" x="${x + 17}" y="${y + 32}" font-size="13" font-weight="600" fill="#fb7185" letter-spacing="1.3">${label}</text>
      <text class="sans" x="${x + 17}" y="${y + 56}" font-size="${fs}" font-weight="700" fill="#fff">${esc(value)}</text>
    </g>`;
  }).join('');

  const css = `${titleCss}
    .spin{transform-origin:${av.cx}px ${av.cy}px;animation:spin 6s linear infinite}
    .orbit{transform-origin:${av.cx}px ${av.cy}px;animation:spin 22s linear infinite}
    .counter{animation:spin 22s linear infinite reverse}
    @keyframes spin{to{transform:rotate(360deg)}}
    .diary{transform-box:fill-box;transform-origin:center;animation:diary 4s ease-in-out infinite}
    @keyframes diary{0%,100%{transform:rotate(6deg)}50%{transform:rotate(2deg)}}
    .blurin{animation:blurin .7s ease-out both}
    @keyframes blurin{from{opacity:0;filter:blur(8px);transform:translateY(10px)}to{opacity:1;filter:none;transform:none}}
    .pop{animation:popin .6s cubic-bezier(.34,1.56,.64,1) both}
    @keyframes popin{from{opacity:0;transform:translateY(20px) scale(.9)}to{opacity:1;transform:none}}
    .avatar{animation:avatar 1s cubic-bezier(.34,1.3,.64,1) both}
    @keyframes avatar{from{opacity:0;transform:scale(.5) rotate(-30deg)}to{opacity:1;transform:none}}`;

  const body = `
  ${backdrop(W, H, '#0b0514', '#12030a')}
  <defs>
    ${titleDefs}
    <linearGradient id="ring" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e11d48"/><stop offset=".5" stop-color="#000"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient>
    <linearGradient id="ring2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000"/></linearGradient>
    <clipPath id="avclip"><circle cx="${av.cx}" cy="${av.cy}" r="${av.r}"/></clipPath>
    <filter id="gray" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope="1.25" intercept="-.125"/><feFuncG type="linear" slope="1.25" intercept="-.125"/><feFuncB type="linear" slope="1.25" intercept="-.125"/></feComponentTransfer></filter>
    <linearGradient id="avtint" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#881337" stop-opacity=".5"/><stop offset="1" stop-color="#881337" stop-opacity="0"/></linearGradient>
    <filter id="ringblur"><feGaussianBlur stdDeviation="2"/></filter>
    <filter id="cardglow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="#e11d48" flood-opacity=".12"/></filter>
    <pattern id="lines" x="0" y="${cardY}" width="10" height="32" patternUnits="userSpaceOnUse"><rect y="31" width="10" height="1" fill="#e11d48" fill-opacity=".08"/></pattern>
    <clipPath id="cardclip"><rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="16"/></clipPath>
  </defs>
  ${particles(W, H, 5)}
  ${ghost(100, 420, '⛓️', 34, 0.4, 0.15)}
  ${ghost(1150, 270, '🕯️', 26, 1.2, 0.2)}
  ${ghost(1140, 560, '💀', 28, 2, 0.12)}
  ${ghost(60, 540, '🎃', 30, 1.6, 0.2)}
  ${sectionTitle(W / 2, 20, 'SOBRE', '👻')}

  <g class="avatar">
    <g class="spin">
      <circle cx="${av.cx}" cy="${av.cy}" r="${av.r + 3}" fill="none" stroke="url(#ring)" stroke-width="8" filter="url(#ringblur)"/>
      <circle cx="${av.cx}" cy="${av.cy}" r="${av.r + 3}" fill="none" stroke="url(#ring)" stroke-width="7"/>
    </g>
    <circle cx="${av.cx}" cy="${av.cy}" r="${av.r}" fill="#000"/>
    <g clip-path="url(#avclip)">
      <image href="data:image/jpeg;base64,${b64('avatar.jpg')}" x="${av.cx - av.r + 4}" y="${av.cy - av.r + 4}" width="${av.r * 2 - 8}" height="${av.r * 2 - 8}" filter="url(#gray)"/>
      <circle cx="${av.cx}" cy="${av.cy}" r="${av.r - 4}" fill="url(#avtint)" style="mix-blend-mode:multiply"/>
    </g>
    <circle cx="${av.cx}" cy="${av.cy}" r="${av.r - 2}" fill="none" stroke="#000" stroke-width="4"/>
    <g class="orbit">${orbit}</g>
  </g>

  <g class="blurin" style="animation-delay:.15s">
    <g filter="url(#cardglow)"><rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="16" fill="#050205"/></g>
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="16" fill="#060306" fill-opacity=".96"/>
    <g clip-path="url(#cardclip)">
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" fill="url(#lines)"/>
      <rect x="${cardX + 32}" y="${cardY}" width="1" height="${cardH}" fill="#be123c" fill-opacity=".3"/>
    </g>
    <rect x="${cardX + .5}" y="${cardY + .5}" width="${cardW - 1}" height="${cardH - 1}" rx="16" fill="none" stroke="#881337" stroke-opacity=".5"/>
    <text class="marker diary" x="${cardX + cardW - 140}" y="${cardY + 4}" font-size="14" fill="#f43f5e" fill-opacity=".8">querido diário...</text>
    <text class="gothic" x="${tx}" y="${cardY + 70}" font-size="40" fill="#fff">Conheça um pouco sobre mim</text>
    ${para(p1, cardY + 118, 0.4)}
    ${para(p2, cardY + 182, 0.65)}
    ${stats}
  </g>
  ${overlays(W, H)}`;

  return svg(W, H, ['grotesk', 'pirata', 'marker'], body, css, 'Sobre — Guilherme Moraes da Silva');
}

// ---------- FOOTER ----------
function buildFooter() {
  const W = 1200, H = 150;
  const drips = Array.from({ length: 7 }, (_, i) => {
    const x = (W / 7) * (i + 0.5);
    const h = 18 + (i % 3) * 8;
    return `<rect class="drip" x="${x - 3}" y="-6" width="6" height="${h + 6}" rx="3" fill="url(#drip)" style="animation-duration:${3 + (i % 4)}s;animation-delay:${i * 0.7}s"/>`;
  }).join('');
  const year = new Date().getFullYear();
  const css = `.drip{transform-box:fill-box;transform-origin:top;animation:drip 3s ease-in-out infinite}@keyframes drip{0%,100%{transform:scaleY(0)}50%{transform:scaleY(1)}}`;
  const body = `
  <defs><linearGradient id="drip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#be123c"/><stop offset="1" stop-color="#881337"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="#000"/>
  <rect width="${W}" height="1" fill="#881337" fill-opacity=".5"/>
  ${drips}
  ${pumpkin(40, 128, 30)}
  ${pumpkin(W - 76, 128, 30, 0.3)}
  <text class="marker" x="${W / 2}" y="78" font-size="17" fill="#9ca3af" text-anchor="middle" xml:space="preserve">feito com <tspan class="emoji" fill="#f43f5e">💀</tspan> &amp; muito café</text>
  <text class="sans" x="${W / 2}" y="108" font-size="14" fill="#6b7280" text-anchor="middle">© ${year} - <tspan fill="#f43f5e">Guilherme Moraes da Silva</tspan></text>`;
  return svg(W, H, ['grotesk', 'marker'], body, css, 'feito com 💀 & muito café');
}

// ---------- main ----------
// O README usa só Sobre e Habilidades; as outras funções ficam aqui para voltar com elas se quiser.
mkdirSync(OUT, { recursive: true });
const files = {
  'about.svg': buildAbout(),
  'skills.svg': buildSkills(),
  'social-mail.svg': buildSocial('FiMail', 'Email'),
  'social-github.svg': buildSocial('FiGithub', 'GitHub'),
  'social-linkedin.svg': buildSocial('FiLinkedin', 'LinkedIn'),
};
for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(OUT, name), content);
  console.log(`${name.padEnd(22)} ${(content.length / 1024).toFixed(0)} KB`);
}
