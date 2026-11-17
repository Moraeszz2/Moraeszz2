// Gera os SVGs do README do perfil no mesmo visual do site (dev-moraes-tec.com.br).
// Uso: node scripts/build.mjs   (Node 18+, sem dependências)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = join(ROOT, 'scripts', 'assets');
const OUT = join(ROOT, 'images');

const C = {
  ink: '#0F0F12',
  panel: '#18181B',
  line: '#27272A',
  border: '#3F3F46',
  text: '#FAFAF9',
  soft: '#D4D4D8',
  muted: '#A1A1AA',
  accent: '#F43F5E',
  ok: '#34D399',
  wip: '#FCD34D',
};

const W = 840;
const b64 = (file) => readFileSync(join(ASSETS, file)).toString('base64');
const icons = JSON.parse(readFileSync(join(ASSETS, 'icons.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const FONTS = `
@font-face{font-family:'Bricolage Grotesque';font-weight:200 800;src:url(data:font/woff2;base64,${b64('bricolage.woff2')}) format('woff2')}
@font-face{font-family:'IBM Plex Mono';font-weight:400;src:url(data:font/woff2;base64,${b64('plexmono.woff2')}) format('woff2')}`;

const CSS = `
.sans{font-family:'Bricolage Grotesque','Segoe UI',sans-serif}
.mono{font-family:'IBM Plex Mono',Consolas,monospace}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes glow{0%,100%{stroke-opacity:1}50%{stroke-opacity:.45}}
@keyframes caret{0%,49%{opacity:1}50%,100%{opacity:0}}
.pulse{animation:pulse 2s ease-in-out infinite}
.glow{animation:glow 2.4s ease-in-out infinite}
.caret{animation:caret 1s steps(1) infinite}
.rise{opacity:0;animation:rise .7s ease-out forwards}
@media (prefers-reduced-motion:reduce){.pulse,.glow,.caret{animation:none}.rise{animation:none;opacity:1}}`;

const svg = (w, h, body, title) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>${FONTS}${CSS}</style>
${body}
</svg>
`;

const text = (x, y, content, { size = 16, weight = 400, fill = C.text, cls = 'sans', anchor = 'start', spacing } = {}) =>
  `<text x="${x}" y="${y}" class="${cls}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${spacing ? ` letter-spacing="${spacing}"` : ''}>${content}</text>`;

// Ícone de um pacote do react-icons (Si* preenchido, Fi* em traço).
const icon = (name, color) => {
  const { attr = {}, body } = icons[name];
  const stroked = attr.stroke === 'currentColor';
  return stroked
    ? `<g fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</g>`
    : `<g fill="${color}">${body}</g>`;
};

const logo = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
  <rect x="1" y="1" width="62" height="62" rx="14" fill="${C.ink}" stroke="${C.border}" stroke-width="2"/>
  <path d="M 17 19 H 23 Q 29 19 29 25 V 39 Q 29 45 23 45 H 17 M 29 32 H 38" fill="none" stroke="${C.text}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="16" cy="19" r="6.5" fill="${C.text}"/><circle cx="16" cy="45" r="6.5" fill="${C.text}"/>
  <rect x="37" y="18" width="15" height="28" rx="5" fill="${C.accent}"/>
</g>`;

// ---------- topo ----------
const hero = () => {
  const H = 430;
  const dx = 506;
  const dy = 88;
  const cols = [46, 150, 254];
  const top = [['Site'], ['App'], ['Painel', 'interno']];
  const bottom = [['Banco de', 'dados'], ['Tarefas', 'automáticas'], ['Integrações', 'externas']];
  const label = (lines, cx, cy, size, fill, weight = 600) => {
    const first = cy - ((lines.length - 1) * 16) / 2;
    return lines.map((l, i) => text(cx, first + i * 16 + size * 0.35, esc(l), { size, weight, fill, anchor: 'middle' })).join('');
  };
  const flow = (path, dur, delay) =>
    `<circle r="3.4" fill="${C.accent}"><animateMotion dur="${dur}s" begin="${delay}s" repeatCount="indefinite" path="${path}"/></circle>`;

  const diagram = `<g transform="translate(${dx} ${dy})">
    <g fill="none" stroke="${C.muted}" stroke-width="2" stroke-linecap="round" opacity=".6">
      ${cols.map((x) => `<path d="M ${x} 52 V 78"/>`).join('')}
      <path d="M 46 78 H 254"/><path d="M 150 78 V 102"/>
      <path d="M 150 176 V 202"/><path d="M 46 202 H 254"/>
      ${cols.map((x) => `<path d="M ${x} 202 V 228"/>`).join('')}
    </g>
    ${cols.map((x, i) => flow(`M ${x} 52 V 78 H 150 V 104`, 2.2, -i * 0.73)).join('')}
    ${cols.map((x, i) => flow(`M 150 176 V 202 H ${x} V 230`, 2.2, -1.1 - i * 0.73)).join('')}
    ${cols.map((x, i) => `<rect x="${x - 46}" y="0" width="92" height="52" rx="12" fill="${C.line}"/>${label(top[i], x, 26, 14, C.text)}`).join('')}
    <rect x="1" y="104" width="298" height="72" rx="12" fill="${C.ink}" stroke="${C.accent}" stroke-width="2" class="glow"/>
    ${text(150, 136, 'API', { size: 20, weight: 800, anchor: 'middle' })}
    ${text(150, 158, 'regras do negócio e segurança', { size: 11.5, fill: C.muted, cls: 'mono', anchor: 'middle' })}
    ${cols.map((x, i) => `<rect x="${x - 46}" y="230" width="92" height="64" rx="12" fill="${C.panel}" stroke="${C.border}"/>${label(bottom[i], x, 262, 13, '#E4E4E7', 500)}`).join('')}
  </g>`;

  const body = `
  <defs>
    <radialGradient id="halo" cx="82%" cy="18%" r="70%"><stop offset="0" stop-color="${C.accent}" stop-opacity=".16"/><stop offset="1" stop-color="${C.accent}" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 H 0 V 24" fill="none" stroke="#FFFFFF" stroke-opacity=".035"/></pattern>
  </defs>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="22" fill="${C.ink}" stroke="${C.line}"/>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="22" fill="url(#grid)"/>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="22" fill="url(#halo)"/>

  ${logo(36, 30, 0.62)}
  ${text(86, 56, 'Guilherme Moraes', { size: 18, weight: 800 })}
  <g transform="translate(${W - 36} 50)">
    <rect x="-236" y="-16" width="236" height="32" rx="16" fill="${C.ink}" stroke="${C.border}"/>
    <circle cx="-218" cy="0" r="4.5" fill="${C.ok}" class="pulse"/>
    ${text(-206, 4.5, 'agenda aberta para projetos', { size: 12.5, fill: C.soft, cls: 'mono' })}
  </g>

  <g class="rise" style="animation-delay:.05s">
    ${text(36, 150, 'Sistemas e integrações', { size: 38, weight: 800, spacing: -1.2 })}
    ${text(36, 192, 'sob medida pra quem', { size: 38, weight: 800, spacing: -1.2 })}
    ${text(36, 234, `<tspan fill="${C.accent}">vende online.</tspan>`, { size: 38, weight: 800, spacing: -1.2 })}
  </g>
  <g class="rise" style="animation-delay:.25s">
    ${text(36, 280, 'Desenvolvedor full stack com 4 anos de experiência:', { size: 15.5, fill: C.soft })}
    ${text(36, 302, 'lojas, painéis, APIs e integrações com ERP, frete', { size: 15.5, fill: C.soft })}
    ${text(36, 324, 'e pagamentos. Do primeiro rascunho ao sistema no ar.', { size: 15.5, fill: C.soft })}
  </g>
  <g class="rise" style="animation-delay:.45s">
    ${text(36, 388, `<tspan fill="${C.accent}">$</tspan> node · nestjs · react · typescript<tspan class="caret" fill="${C.accent}"> ▍</tspan>`, { size: 13, fill: C.muted, cls: 'mono' })}
  </g>
  ${diagram}
  ${text(dx + 150, 406, 'da tela que o cliente usa ao banco de dados', { size: 11.5, fill: C.muted, cls: 'mono', anchor: 'middle' })}`;
  return svg(W, H, body, 'Guilherme Moraes — sistemas e integrações sob medida pra quem vende online');
};

// ---------- botões ----------
const button = (label, { primary = false, iconName } = {}) => {
  const w = 268;
  const h = 52;
  const fill = primary ? C.accent : C.ink;
  const color = primary ? C.ink : C.text;
  const textX = iconName ? w / 2 + 12 : w / 2;
  const body = `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${(h - 2) / 2}" fill="${fill}" stroke="${primary ? C.accent : C.border}" stroke-width="1.5"/>
  ${iconName ? `<g transform="translate(${textX - label.length * 4.6 - 30} ${h / 2 - 10}) scale(.84)">${icon(iconName, color)}</g>` : ''}
  ${text(textX, h / 2 + 5.5, esc(label), { size: 16, weight: 700, fill: color, anchor: 'middle' })}`;
  return svg(w, h, body, label);
};

// ---------- serviços ----------
const services = () => {
  const items = [
    ['Integração com marketplaces', ['Produtos, estoque e pedidos com Mercado', 'Livre, Shopee e outros, sem cadastro duplo.']],
    ['Sistemas sob medida', ['Painéis, sistemas internos e portais feitos', 'pro jeito que a sua empresa trabalha.']],
    ['APIs e integrações', ['ERP, transportadora e meio de pagamento', 'conectados, com fila pra nada se perder.']],
    ['Modernização de legado', ['Aquele sistema que ninguém quer mexer:', 'organizado, testado e pronto pra crescer.']],
  ];
  const H = 386;
  const cw = 410;
  const ch = 134;
  const cards = items
    .map(([title, lines], i) => {
      const x = (i % 2) * (cw + 20);
      const y = 96 + Math.floor(i / 2) * (ch + 20);
      return `<g transform="translate(${x} ${y})"><g class="rise" style="animation-delay:${0.1 + i * 0.12}s">
        <rect x=".5" y=".5" width="${cw - 1}" height="${ch - 1}" rx="18" fill="${C.panel}" stroke="${C.line}"/>
        ${text(24, 36, `0${i + 1}`, { size: 13, fill: C.accent, cls: 'mono' })}
        ${text(24, 68, esc(title), { size: 21, weight: 800, spacing: -0.4 })}
        ${lines.map((l, k) => text(24, 96 + k * 20, esc(l), { size: 14, fill: C.muted })).join('')}
      </g></g>`;
    })
    .join('');
  const body = `${text(0, 38, 'O que eu faço', { size: 34, weight: 800, spacing: -1 })}
  ${text(0, 70, 'Cada projeto começa com uma conversa: você explica o problema, eu proponho a solução.', { size: 15, fill: C.muted })}
  ${cards}`;
  return svg(W, H, body, 'Serviços: integração com marketplaces, sistemas sob medida, APIs e integrações, modernização de legado');
};

// ---------- ModaGrid ----------
const modagrid = () => {
  const H = 318;
  const chips = (x, y, labels, color) => {
    let cx = x;
    return labels
      .map((l) => {
        const w = 22 + l.length * 8.2;
        const el = `<g transform="translate(${cx} ${y})"><rect x=".5" y=".5" width="${w - 1}" height="31" rx="15.5" fill="${C.panel}" stroke="${color}" stroke-opacity=".6"/>${text(w / 2, 21, esc(l), { size: 13.5, weight: 600, anchor: 'middle' })}</g>`;
        cx += w + 8;
        return el;
      })
      .join('');
  };
  const body = `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="22" fill="${C.ink}" stroke="${C.line}"/>
  <g transform="translate(36 36)">
    <rect width="${28 + 'saas · em testes com lojistas'.length * 7.23 + 14}" height="28" rx="14" fill="${C.line}"/>
    <circle cx="16" cy="14" r="4.5" fill="${C.wip}" class="pulse"/>
    ${text(28, 18.5, 'saas · em testes com lojistas', { size: 12, fill: C.soft, cls: 'mono' })}
  </g>
  ${text(32, 124, 'ModaGrid', { size: 64, weight: 800, spacing: -3 })}
  ${text(36, 160, 'Integradora de marketplaces que estou construindo em dupla: o lojista cadastra o', { size: 15, fill: C.soft })}
  ${text(36, 182, 'produto uma vez e recebe os pedidos de todos os canais num painel só.', { size: 15, fill: C.soft })}
  ${text(36, 224, 'INTEGRADOS', { size: 11.5, fill: C.ok, cls: 'mono', spacing: 1 })}
  ${chips(36, 236, ['Mercado Livre', 'Shopee', 'SkyHub', 'Via Varejo'], C.ok)}
  ${text(520, 224, 'EM ANDAMENTO', { size: 11.5, fill: C.wip, cls: 'mono', spacing: 1 })}
  ${chips(520, 236, ['Amazon', 'Magalu', 'KaBuM!'], C.wip)}
  ${text(W - 36, 46, 'vende em marketplace?', { size: 12.5, fill: C.muted, cls: 'mono', anchor: 'end' })}
  ${text(W - 36, 70, 'teste de graça →', { size: 16, weight: 700, fill: C.accent, anchor: 'end' })}`;
  return svg(W, H, body, 'ModaGrid: integradora de marketplaces. Integrados: Mercado Livre, Shopee, SkyHub e Via Varejo. Em andamento: Amazon, Magalu e KaBuM!');
};

// ---------- stack ----------
const stack = () => {
  const items = [
    ['SiNodedotjs', 'Node.js', '#5FA04E'], ['SiNestjs', 'NestJS', '#E0234E'], ['SiTypescript', 'TypeScript', '#3178C6'],
    ['SiReact', 'React', '#61DAFB'], ['SiVuedotjs', 'Vue.js', '#4FC08D'], ['SiGo', 'Go', '#00ADD8'],
    ['SiMysql', 'MySQL', '#4479A1'], ['SiMongodb', 'MongoDB', '#47A248'], ['SiRabbitmq', 'RabbitMQ', '#FF6600'], ['SiDocker', 'Docker', '#2496ED'],
  ];
  const H = 200;
  const cols = 5;
  const gap = 12;
  const cw = (W - (cols - 1) * gap) / cols;
  const cells = items
    .map(([name, label, color], i) => {
      const x = (i % cols) * (cw + gap);
      const y = 64 + Math.floor(i / cols) * 66;
      return `<g transform="translate(${x} ${y})"><g class="rise" style="animation-delay:${0.05 * i}s">
        <rect x=".5" y=".5" width="${cw - 1}" height="53" rx="14" fill="${C.panel}" stroke="${C.line}"/>
        <g transform="translate(18 15)">${icon(name, color)}</g>
        ${text(52, 32, label, { size: 15, weight: 600 })}
      </g></g>`;
    })
    .join('');
  return svg(W, H, `${text(0, 38, 'Stack', { size: 34, weight: 800, spacing: -1 })}${cells}`, 'Stack: Node.js, NestJS, TypeScript, React, Vue.js, Go, MySQL, MongoDB, RabbitMQ e Docker');
};

mkdirSync(OUT, { recursive: true });
const files = {
  'hero.svg': hero(),
  'servicos.svg': services(),
  'modagrid.svg': modagrid(),
  'stack.svg': stack(),
  'btn-orcamento.svg': button('Pedir orçamento →', { primary: true }),
  'btn-linkedin.svg': button('LinkedIn', { iconName: 'FiLinkedin' }),
  'btn-email.svg': button('E-mail', { iconName: 'FiMail' }),
};
for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(OUT, name), content);
  console.log(`gerado  images/${name}`);
}
