/**
 * Bộ vẽ hoa phượng màu nước — chuyển nguyên từ bản thiết kế trên canvas
 * "Hoa Phượng – Thiết Kế Lại", trang "Bản màu nước".
 *
 * Cánh hoa "loang" bằng bộ lọc SVG: mép gợn không đều, màu đọng đậm ở rìa như
 * vệt nước khô, hạt màu lấm tấm và quầng loang nhẹ ra ngoài. Mọi id đều mang
 * tiền tố vì nhiều SVG cùng nằm trên trang (xem PhuongBranch).
 *
 * Nội dung là chuỗi SVG tĩnh do chính file này dựng, không có dữ liệu người dùng.
 */

const n1 = (v: number) => String(Math.round(v * 10) / 10);

const PETAL_D =
  "M0,0 C-1.2,-5 -2.2,-10 -3,-14 C-10,-15 -18,-21 -19.5,-30 C-21,-38 -17,-45 -11,-46 C-9,-51 -3,-53 0,-49.5 C3,-53 9,-51.5 11,-46.5 C17,-46 21.5,-39 20,-31 C18.5,-22 11,-15.5 3,-14 C2.2,-10 1.2,-5 0,0 Z";
const PETAL_D2 =
  "M0,0 C-1.4,-5 -2.5,-10 -3.4,-14 C-11,-15.5 -19.5,-22.5 -20.6,-31.5 C-21.6,-40 -16,-46.8 -9.8,-47 C-7.2,-52.6 -1.2,-53.6 1.4,-50 C4.8,-53.2 10.8,-51 12.6,-45.4 C18.6,-43.8 22,-36.6 20,-29 C18,-21 10.4,-15.4 2.8,-14 C2,-10 1,-5 0,0 Z";
const VEIN_D =
  "M0,-10 C-0.5,-22 -1,-33 -0.6,-43 M-2,-17 C-6.5,-25 -10.5,-32 -12.5,-39 M2,-17 C6.5,-25 10.5,-32 12.5,-39";
const STREAK_D =
  "M0,-9 L-0.6,-24 M-2,-13 L-6,-27 M2,-13 L6,-27 M-3.5,-17 L-11,-29 M3.5,-17 L11,-29 M-1,-27 L-3,-38 M1.5,-27 L4,-39 M-6,-30 L-10,-37 M6,-30 L10,-37";
const BUD_D = "M0,-9 C-5,-12 -6.5,-20 -3.5,-25.5 C-2,-28 2,-28 3.5,-25.5 C6.5,-20 5,-12 0,-9 Z";
const SEPAL_D = "M0,2 C-5,5 -8,11 -8,17 C-5,13 -2,8 0,2 Z M0,2 C5,5 8,11 8,17 C5,13 2,8 0,2 Z";

/** [đường nhị, điểm điều khiển cuối x, y, đầu nhị x, y] — để xoay bao phấn theo sợi */
type Stamen = [string, number, number, number, number];
const STAMENS: Array<Stamen> = [
  ["M0,0 C-8,10 -19,21 -26,36", -19, 21, -26, 36],
  ["M0,0 C-6,14 -13,30 -16,48", -13, 30, -16, 48],
  ["M0,0 C-3,16 -6,34 -5,54", -6, 34, -5, 54],
  ["M0,0 C1,18 3,36 5,55", 3, 36, 5, 55],
  ["M0,0 C4,16 10,32 14,49", 10, 32, 14, 49],
  ["M0,0 C7,12 16,25 23,39", 16, 25, 23, 39],
  ["M0,0 C-10,6 -22,13 -31,24", -22, 13, -31, 24],
];
const HALF_STAMENS: Array<Stamen> = [
  ["M0,0 C-5,-16 -10,-30 -9,-46", -10, -30, -9, -46],
  ["M0,0 C1,-18 2,-34 6,-50", 2, -34, 6, -50],
  ["M0,0 C-2,-20 -3,-38 -1,-55", -3, -38, -1, -55],
];

/** Cuống phụ dọc sống lá: [x, y, góc trên, góc dưới, tỉ lệ] */
const PINNAE: Array<[number, number, number, number, number]> = [
  [12, 0.4, -58, 60, 0.8],
  [24, 0.9, -57, 61, 0.95],
  [36, 1.5, -57, 61, 1],
  [48, 2.3, -56, 62, 1],
  [60, 3.2, -55, 63, 0.98],
  [72, 4.2, -55, 63, 0.94],
  [84, 5.4, -54, 64, 0.88],
  [96, 6.7, -54, 64, 0.8],
  [108, 8.1, -53, 65, 0.72],
  [120, 9.6, -52, 66, 0.62],
  [132, 11.3, -52, 66, 0.52],
  [144, 13, -51, 67, 0.42],
];

/** Một cuống phụ của lá kép: vệt loang dài, mép gợn thành từng lá chét nhỏ. */
function pinnaPath() {
  const L = 36;
  const up: Array<string> = [];
  const dn: Array<string> = [];
  for (let x = 0; x <= L + 1e-6; x += 1.5) {
    const t = x / L;
    const w =
      3.5 * Math.pow(Math.max(0, Math.sin(Math.PI * (0.1 + 0.9 * t))), 0.85) * (1 - 0.18 * t);
    const su = 0.7 + 0.3 * Math.abs(Math.sin((Math.PI * x) / 3));
    const sd = 0.7 + 0.3 * Math.abs(Math.sin((Math.PI * (x + 1.5)) / 3));
    up.push(`${n1(x)},${n1(-w * su)}`);
    dn.push(`${n1(x)},${n1(w * sd)}`);
  }
  return `M${up.join(" L")} L${dn.reverse().join(" L")} Z`;
}
const PINNA_D = pinnaPath();

/** Giọt màu văng — toạ độ cố định để server và client dựng giống hệt nhau. */
const SPLAT: Array<[number, number, number, string, number]> = [
  [-30, 12, 1.2, "#e2401f", 0.6],
  [22, -18, 0.8, "#f26a36", 0.5],
  [38, 9, 2.4, "#c92a17", 0.45],
  [-12, -26, 0.9, "#ff8a4c", 0.55],
  [8, 22, 1.4, "#e2401f", 0.4],
  [-42, -6, 0.7, "#f26a36", 0.6],
  [30, 26, 1, "#ff8a4c", 0.5],
  [-20, 30, 2.1, "#e2401f", 0.38],
  [14, -6, 0.6, "#c92a17", 0.7],
  [46, -14, 1.1, "#f26a36", 0.42],
  [-6, 12, 0.8, "#ff8a4c", 0.6],
  [-34, 24, 1.3, "#c92a17", 0.45],
];

function paintFilter(
  id: string,
  seed: number,
  o: {
    freq?: number;
    disp?: number;
    rim?: [number, number, number];
    rimA?: number;
    rimBlur?: number;
    halo?: number;
  } = {},
) {
  const {
    freq = 0.06,
    disp = 5.5,
    rim = [0.62, 0.5, 0.5],
    rimA = 1.5,
    rimBlur = 2.2,
    halo = 0.36,
  } = o;
  return `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" result="n"/>
<feDisplacementMap in="SourceGraphic" in2="n" scale="${disp}" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feGaussianBlur in="d" stdDeviation="${rimBlur}" result="b"/>
<feComposite in="d" in2="b" operator="out" result="e"/>
<feComponentTransfer in="e" result="rim"><feFuncR type="linear" slope="${rim[0]}"/><feFuncG type="linear" slope="${rim[1]}"/><feFuncB type="linear" slope="${rim[2]}"/><feFuncA type="linear" slope="${rimA}"/></feComponentTransfer>
<feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="2" seed="${seed + 40}" result="g"/>
<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.9 -1" result="ga"/>
<feComponentTransfer in="d" result="dk"><feFuncR type="linear" slope="0.72"/><feFuncG type="linear" slope="0.6"/><feFuncB type="linear" slope="0.6"/></feComponentTransfer>
<feComposite in="dk" in2="ga" operator="in" result="gr"/>
<feGaussianBlur in="d" stdDeviation="3.4" result="hb"/>
<feComponentTransfer in="hb" result="halo"><feFuncA type="linear" slope="${halo}"/></feComponentTransfer>
<feMerge><feMergeNode in="halo"/><feMergeNode in="d"/><feMergeNode in="gr"/><feMergeNode in="rim"/></feMerge>
</filter>`;
}

function leafFilter(id: string, seed: number) {
  return `<filter id="${id}" x="-15%" y="-25%" width="130%" height="150%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="${seed}" result="n"/>
<feDisplacementMap in="SourceGraphic" in2="n" scale="3.6" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feGaussianBlur in="d" stdDeviation="1.4" result="b"/>
<feComposite in="d" in2="b" operator="out" result="e"/>
<feComponentTransfer in="e" result="rim"><feFuncR type="linear" slope="0.55"/><feFuncG type="linear" slope="0.66"/><feFuncB type="linear" slope="0.58"/><feFuncA type="linear" slope="1.2"/></feComponentTransfer>
<feGaussianBlur in="d" stdDeviation="2.8" result="hb"/>
<feComponentTransfer in="hb" result="halo"><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
<feMerge><feMergeNode in="halo"/><feMergeNode in="d"/><feMergeNode in="rim"/></feMerge>
</filter>`;
}

/** Mảng màu loang: vẽ khối đặc, hạ độ trong ở nhóm ngoài để tính được viền nước. */
export function washFilter(
  id: string,
  o: { seed: number; freq: number; disp: number; blur: number },
) {
  return `<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="${o.freq}" numOctaves="4" seed="${o.seed}" result="n"/>
<feDisplacementMap in="SourceGraphic" in2="n" scale="${o.disp}" xChannelSelector="R" yChannelSelector="B" result="d"/>
<feGaussianBlur in="d" stdDeviation="${o.blur}" result="s"/>
<feGaussianBlur in="d" stdDeviation="${n1(o.blur * 0.22)}" result="s2"/>
<feComposite in="s2" in2="s" operator="out" result="e"/>
<feComponentTransfer in="e" result="rim"><feFuncR type="linear" slope="1.3"/><feFuncG type="linear" slope="1.22"/><feFuncB type="linear" slope="1.15"/><feFuncA type="linear" slope="0.8"/></feComponentTransfer>
<feTurbulence type="fractalNoise" baseFrequency="${Math.round(o.freq * 320) / 100}" numOctaves="3" seed="${o.seed + 7}" result="m"/>
<feColorMatrix in="m" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.5 -0.15" result="ma"/>
<feComposite in="s" in2="ma" operator="in" result="bl"/>
<feMerge><feMergeNode in="bl"/><feMergeNode in="rim"/></feMerge>
</filter>`;
}

function stamens(p: string, list: Array<Stamen>, width: number) {
  const strokes = list
    .map(
      ([d], i) =>
        `<path d="${d}" stroke="${i % 2 ? "#f07236" : "#dc4523"}" stroke-width="${width}"/>`,
    )
    .join("");
  const anthers = list
    .map(([, cx, cy, x, y]) => {
      const a = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;
      return `<ellipse cx="${x}" cy="${y}" rx="1.7" ry="2.6" transform="rotate(${n1(a)} ${x} ${y})" fill="url(#${p}-gAnther)"/>`;
    })
    .join("");
  return `<g fill="none" stroke-linecap="round" stroke-opacity="0.9">${strokes}</g>${anthers}`;
}

/** Toàn bộ <defs> màu nước cho một SVG, mọi id mang tiền tố `p`. */
export function wcDefs(p: string) {
  const u = (k: string) => `url(#${p}-${k})`;
  const h = (k: string) => `#${p}-${k}`;
  const blur = (k: string, sd: number, pad = 30) =>
    `<filter id="${p}-${k}" x="-${pad}%" y="-${pad}%" width="${100 + pad * 2}%" height="${100 + pad * 2}%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
  const fl = (k: string) => `<g filter="${u(k)}">`;

  return `
<linearGradient id="${p}-gPet" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8c1409"/><stop offset="0.2" stop-color="#c02316"/><stop offset="0.52" stop-color="#e23b1d"/><stop offset="0.84" stop-color="#fb6536"/><stop offset="1" stop-color="#ff8a55"/></linearGradient>
<linearGradient id="${p}-gPet2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9c1a0c"/><stop offset="0.25" stop-color="#d3301b"/><stop offset="0.6" stop-color="#f0542b"/><stop offset="1" stop-color="#ff9e66"/></linearGradient>
<linearGradient id="${p}-gFlag" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f2c890"/><stop offset="0.3" stop-color="#fff0cc"/><stop offset="0.72" stop-color="#ffe6ad"/><stop offset="1" stop-color="#ffc585"/></linearGradient>
<radialGradient id="${p}-gPool"><stop offset="0" stop-color="#7e1107" stop-opacity="0.55"/><stop offset="1" stop-color="#7e1107" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-gLift"><stop offset="0" stop-color="#ffb48c" stop-opacity="0.62"/><stop offset="1" stop-color="#ffb48c" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-gBlush"><stop offset="0" stop-color="#ff6a34" stop-opacity="0.5"/><stop offset="1" stop-color="#ff6a34" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-gFlagLift"><stop offset="0" stop-color="#fffaf0" stop-opacity="0.7"/><stop offset="1" stop-color="#fffaf0" stop-opacity="0"/></radialGradient>
<radialGradient id="${p}-gCore"><stop offset="0" stop-color="#ffc978"/><stop offset="0.45" stop-color="#b3261a"/><stop offset="1" stop-color="#6e120b" stop-opacity="0.9"/></radialGradient>
<radialGradient id="${p}-gAnther"><stop offset="0" stop-color="#ffd88a"/><stop offset="1" stop-color="#e2872f"/></radialGradient>
<linearGradient id="${p}-gBud" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#5e8a3f"/><stop offset="0.5" stop-color="#7da34a"/><stop offset="0.82" stop-color="#cf5a2b"/><stop offset="1" stop-color="#e46a3b"/></linearGradient>
${paintFilter(`${p}-fPaintA`, 3)}
${paintFilter(`${p}-fPaintB`, 17, { freq: 0.055, disp: 6 })}
${paintFilter(`${p}-fPaintC`, 29, { freq: 0.065, disp: 5 })}
${paintFilter(`${p}-fPaintF`, 61, { rim: [0.95, 0.66, 0.46], rimA: 1.3, halo: 0.28 })}
${paintFilter(`${p}-fBud`, 71, { freq: 0.09, disp: 2.6, rimBlur: 1.1, rimA: 1.1, halo: 0.3 })}
${leafFilter(`${p}-fLeafA`, 5)}
${leafFilter(`${p}-fLeafB`, 23)}
<filter id="${p}-fLine" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="2" seed="13" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="${p}-fBranch" x="-8%" y="-12%" width="116%" height="124%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="31" result="n"/>
<feDisplacementMap in="SourceGraphic" in2="n" scale="3" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feTurbulence type="fractalNoise" baseFrequency="0.9 0.22" numOctaves="2" seed="4" result="t"/>
<feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.9" result="ta"/>
<feComposite in="d" in2="ta" operator="in" result="dry"/>
<feGaussianBlur in="d" stdDeviation="1.8" result="hb"/>
<feComponentTransfer in="hb" result="halo"><feFuncA type="linear" slope="0.25"/></feComponentTransfer>
<feMerge><feMergeNode in="halo"/><feMergeNode in="dry"/></feMerge>
</filter>
${washFilter(`${p}-fWashS`, { seed: 41, freq: 0.02, disp: 46, blur: 10 })}
${blur("fBlurS", 0.45)}
${blur("fBlur3", 3)}
${blur("fBlur8", 8, 70)}

<path id="${p}-shape" d="${PETAL_D}"/>
<path id="${p}-shape2" d="${PETAL_D2}"/>
<clipPath id="${p}-cPet"><use href="${h("shape")}"/></clipPath>
<clipPath id="${p}-cPet2"><use href="${h("shape2")}"/></clipPath>

<g id="${p}-petR">
<use href="${h("shape")}" fill="${u("gPet")}" fill-opacity="0.93"/>
<g clip-path="${u("cPet")}">
<ellipse cx="0" cy="-9" rx="9" ry="12" fill="${u("gPool")}"/>
<ellipse cx="-5" cy="-37" rx="13" ry="9.5" fill="${u("gLift")}"/>
<ellipse cx="10" cy="-27" rx="6" ry="8" fill="${u("gPool")}" opacity="0.55"/>
</g>
<path d="${VEIN_D}" fill="none" stroke="#8a160b" stroke-opacity="0.2" stroke-width="0.9" stroke-linecap="round"/>
</g>
<g id="${p}-petR2">
<use href="${h("shape2")}" fill="${u("gPet2")}" fill-opacity="0.92"/>
<g clip-path="${u("cPet2")}">
<ellipse cx="1" cy="-10" rx="9" ry="11" fill="${u("gPool")}"/>
<ellipse cx="6" cy="-38" rx="12" ry="9" fill="${u("gLift")}"/>
<ellipse cx="-11" cy="-30" rx="6" ry="7" fill="${u("gPool")}" opacity="0.5"/>
</g>
<path d="${VEIN_D}" transform="rotate(4)" fill="none" stroke="#8a160b" stroke-opacity="0.18" stroke-width="0.9" stroke-linecap="round"/>
</g>
<g id="${p}-petF">
<use href="${h("shape")}" fill="${u("gFlag")}" fill-opacity="0.96"/>
<g clip-path="${u("cPet")}">
<ellipse cx="0" cy="-19" rx="12" ry="13" fill="${u("gBlush")}"/>
<ellipse cx="-4" cy="-41" rx="11" ry="7" fill="${u("gFlagLift")}"/>
</g>
<path d="${STREAK_D}" fill="none" stroke="#d33019" stroke-opacity="0.78" stroke-width="1.35" stroke-linecap="round" filter="${u("fBlurS")}"/>
</g>

<g id="${p}-st">${stamens(p, STAMENS, 1.25)}</g>
<g id="${p}-stH">${stamens(p, HALF_STAMENS, 1.15)}</g>

<g id="${p}-flA">
${fl("fPaintA")}<use href="${h("petR")}" transform="rotate(144) scale(0.98)"/></g>
${fl("fPaintB")}<use href="${h("petR2")}" transform="rotate(-144) scale(1.02)"/></g>
${fl("fPaintC")}<use href="${h("petR")}" transform="rotate(74)"/></g>
${fl("fPaintA")}<use href="${h("petR2")}" transform="rotate(-70) scale(0.97)"/></g>
${fl("fPaintF")}<use href="${h("petF")}" transform="rotate(-3) scale(1.05)"/></g>
${fl("fLine")}<use href="${h("st")}"/></g>
<circle r="4.6" fill="${u("gCore")}"/>
</g>
<g id="${p}-flB">
${fl("fPaintC")}<use href="${h("petR2")}" transform="rotate(152) scale(0.95)"/></g>
${fl("fPaintA")}<use href="${h("petR")}" transform="rotate(-138) scale(1.04)"/></g>
${fl("fPaintB")}<use href="${h("petR2")}" transform="rotate(80) scale(0.98)"/></g>
${fl("fPaintC")}<use href="${h("petR")}" transform="rotate(-64) scale(0.94)"/></g>
${fl("fPaintF")}<use href="${h("petF")}" transform="rotate(6) scale(1.02)"/></g>
${fl("fLine")}<use href="${h("st")}" transform="rotate(5)"/></g>
<circle r="4.4" fill="${u("gCore")}"/>
</g>
<g id="${p}-fh">
<path d="M0,4 C0,12 -1,20 -3,30" fill="none" stroke="#5f8a40" stroke-width="1.6" stroke-linecap="round"/>
${fl("fPaintB")}<use href="${h("petR")}" transform="rotate(-42) scale(0.62 0.72)"/></g>
${fl("fPaintC")}<use href="${h("petR2")}" transform="rotate(40) scale(0.6 0.7)"/></g>
${fl("fLine")}<use href="${h("stH")}"/></g>
${fl("fPaintA")}<use href="${h("petR")}" transform="rotate(-16) scale(0.66 0.8)"/></g>
${fl("fPaintB")}<use href="${h("petR2")}" transform="rotate(18) scale(0.64 0.78)"/></g>
${fl("fPaintF")}<use href="${h("petF")}" transform="rotate(2) scale(0.62 0.76)"/></g>
<path d="${SEPAL_D}" fill="#628f3f" fill-opacity="0.9"/>
</g>
<g id="${p}-bd">
<path d="M0,0 L0,-11" stroke="#5f8a40" stroke-width="1.3" stroke-linecap="round"/>
<path d="${BUD_D}" fill="${u("gBud")}" fill-opacity="0.94"/>
</g>
<g id="${p}-bc">
<path d="M0,0 C0,-8 0,-14 -1,-20" fill="none" stroke="#5f8a40" stroke-width="1.6" stroke-linecap="round"/>
${fl("fBud")}<use href="${h("bd")}" transform="translate(-1,-12) rotate(60) scale(0.6)"/></g>
${fl("fBud")}<use href="${h("bd")}" transform="translate(-1,-18) rotate(-34) scale(0.8)"/></g>
${fl("fBud")}<use href="${h("bd")}" transform="translate(-1,-20) rotate(26) scale(0.7)"/></g>
${fl("fBud")}<use href="${h("bd")}" transform="translate(-1,-20) rotate(-4) scale(0.95)"/></g>
</g>

<path id="${p}-pn" d="${PINNA_D}" fill-opacity="0.8"/>
<g id="${p}-lv">
<path d="M0,0 Q75,2 150,14" fill="none" stroke="#4f7a3a" stroke-opacity="0.8" stroke-width="1.3" stroke-linecap="round"/>
${PINNAE.map(
  ([x, y, a, b, s]) =>
    `<use href="${h("pn")}" transform="translate(${x},${y}) rotate(${a}) scale(${s})"/><use href="${h("pn")}" transform="translate(${x},${y}) rotate(${b}) scale(${s})"/>`,
).join("")}
<use href="${h("pn")}" transform="translate(150,14) rotate(9) scale(0.45)"/>
</g>
<g id="${p}-splat">${SPLAT.map(([x, y, r, c, o]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" fill-opacity="${o}"/>`).join("")}</g>`;
}

/* ---------------- bố cục ---------------- */

/** [loại, x, y, góc, tỉ lệ, màu lá cũ (chỉ cho "lv")] */
type Item = [string, number, number, number, number, string?];

const LEAF_FILL: Record<string, string> = {
  "#4d7c3d": "#5a8c46",
  "#5a8a45": "#6b9c52",
  "#62924c": "#7dac5e",
};

function items(p: string, list: Array<Item>) {
  let li = 0;
  let fi = 0;
  return list
    .map(([k, x, y, r, s, fill]) => {
      const t = `translate(${x},${y}) rotate(${r}) scale(${s})`;
      if (k === "lv")
        return `<g filter="url(#${p}-fLeaf${li++ % 2 ? "B" : "A"})"><use href="#${p}-lv" fill="${LEAF_FILL[fill ?? ""] ?? fill}" transform="${t}"/></g>`;
      if (k === "fl") return `<use href="#${p}-fl${fi++ % 2 ? "B" : "A"}" transform="${t}"/>`;
      if (k === "fh") return `<use href="#${p}-fh" transform="${t}"/>`;
      return `<use href="#${p}-bc" transform="${t}"/>`;
    })
    .join("");
}

/** quầng màu loang dưới mỗi bông, như màu thấm vào giấy ướt */
const bleed = (list: Array<Item>) =>
  list
    .filter(([k]) => k === "fl" || k === "fh")
    .map(([, x, y, , s]) => `<circle cx="${x}" cy="${y}" r="${n1(40 * s)}"/>`)
    .join("");

function backLayer(p: string, leaves: Array<Array<number>>, blooms: Array<Array<number>>) {
  const tf = ([x, y, r, s]: Array<number>) => `translate(${x},${y}) rotate(${r}) scale(${s})`;
  return `<g filter="url(#${p}-fBlur3)" opacity="0.55">${leaves.map((l) => `<use href="#${p}-lv" fill="#34563f" transform="${tf(l)}"/>`).join("")}</g>
<g filter="url(#${p}-fBlur3)" opacity="0.42">${blooms.map((b) => `<use href="#${p}-flB" transform="${tf(b)}"/>`).join("")}</g>`;
}

const stems = (p: string, list: Array<[string, number]>) =>
  `<g filter="url(#${p}-fBranch)" fill="none" stroke="#4a3327" stroke-linecap="round">${list.map(([d, w]) => `<path d="${d}" stroke-width="${w}"/>`).join("")}</g>`;

/* nhành rủ từ mép phải (màn lời chúc), khung 560×480 */
const CORNER_FRONT: Array<Item> = [
  ["lv", 560, 164, 152, 1.05, "#4d7c3d"],
  ["lv", 468, 116, 104, 0.95, "#5a8a45"],
  ["lv", 420, 94, 198, 0.85, "#4d7c3d"],
  ["lv", 330, 72, 138, 0.92, "#5a8a45"],
  ["lv", 244, 56, 212, 0.75, "#62924c"],
  ["lv", 196, 34, 128, 0.72, "#4d7c3d"],
  ["lv", 300, 72, 58, 0.8, "#5a8a45"],
  ["lv", 476, 122, 36, 0.8, "#4d7c3d"],
  ["lv", 472, 210, 150, 0.6, "#62924c"],
  ["bc", 452, 302, 196, 0.85],
  ["fh", 502, 300, 162, 0.72],
  ["fl", 430, 236, -28, 0.64],
  ["fl", 478, 266, 8, 0.8],
  ["bc", 372, 108, 205, 0.6],
  ["fl", 446, 160, -40, 0.58],
  ["fl", 400, 122, -14, 0.72],
  ["bc", 240, 212, 200, 0.7],
  ["fh", 292, 216, 152, 0.62],
  ["fl", 262, 190, 6, 0.7],
  ["fh", 142, 54, 206, 0.55],
  ["bc", 212, 24, -56, 0.6],
  ["fl", 178, 36, -20, 0.52],
];

export function cornerArt(p: string) {
  return `<g filter="url(#${p}-fWashS)" opacity="0.16"><ellipse cx="420" cy="200" rx="230" ry="170" fill="#ff5a2e"/></g>
${backLayer(
  p,
  [
    [560, 150, 165, 1.15],
    [380, 84, 118, 1],
    [260, 58, 96, 0.9],
    [520, 146, 78, 1],
    [180, 30, 160, 0.8],
  ],
  [
    [512, 232, 40, 0.58],
    [356, 86, 20, 0.6],
    [228, 150, -50, 0.54],
  ],
)}
${stems(p, [
  ["M600,164 C540,156 476,118 420,92", 9],
  ["M420,92 C364,66 298,72 240,54", 6],
  ["M240,54 C196,40 160,18 128,-12", 3.5],
  ["M468,116 C480,160 486,210 476,262", 4],
  ["M300,70 C296,110 284,150 262,182", 2.6],
])}
<g filter="url(#${p}-fLine)" fill="none" stroke="#a37a57" stroke-opacity="0.45" stroke-width="1.2" stroke-linecap="round"><path d="M598,160 C540,152 478,114 421,88"/><path d="M420,89 C364,63 298,69 240,51"/></g>
<g filter="url(#${p}-fBlur8)" opacity="0.3" fill="#ff4a26">${bleed(CORNER_FRONT)}</g>
${items(p, CORNER_FRONT)}
<g filter="url(#${p}-fLine)"><use href="#${p}-splat" transform="translate(452,334)"/></g>
<g filter="url(#${p}-fLine)"><use href="#${p}-splat" transform="translate(262,250) rotate(40) scale(0.8)"/></g>
<g filter="url(#${p}-fPaintB)"><use href="#${p}-petR" transform="translate(338,300) rotate(120) scale(0.34)"/></g>
<g filter="url(#${p}-fPaintC)"><use href="#${p}-petR2" transform="translate(196,268) rotate(-40) scale(0.3)"/></g>`;
}

/* nhành cài sau phong bì — gốc toạ độ ở tâm phong bì */
const ENV_BEHIND: Array<Item> = [
  ["lv", 150, -112, -150, 0.72, "#5a8a45"],
  ["lv", 176, -134, -72, 0.8, "#4d7c3d"],
  ["lv", 206, -104, 4, 0.78, "#5a8a45"],
  ["lv", 220, -100, 48, 0.6, "#4d7c3d"],
  ["lv", -196, 134, 158, 0.66, "#5a8a45"],
  ["lv", -230, 152, 112, 0.55, "#4d7c3d"],
  ["bc", -222, 168, 200, 0.55],
  ["fh", -246, 160, -120, 0.48],
];
const ENV_FRONT: Array<Item> = [
  ["lv", 172, -124, 166, 0.48, "#62924c"],
  ["bc", 286, -98, 112, 0.66],
  ["fh", 274, -150, 52, 0.58],
  ["fl", 252, -104, 44, 0.62],
  ["fh", 222, -196, -12, 0.52],
  ["fl", 196, -148, -18, 0.78],
];

export function envelopeBackArt(p: string) {
  return `<g filter="url(#${p}-fWashS)" opacity="0.16"><ellipse cx="220" cy="-140" rx="150" ry="120" fill="#ff5a2e"/></g>
${backLayer(
  p,
  [
    [150, -112, -100, 0.85],
    [190, -140, -30, 0.9],
    [-200, 138, 190, 0.7],
  ],
  [
    [150, -178, -60, 0.54],
    [240, -70, 70, 0.5],
  ],
)}
${stems(p, [
  ["M-262,176 C-140,96 30,-10 150,-112", 5.5],
  ["M150,-112 C176,-134 200,-156 228,-184", 3.4],
  ["M150,-112 C186,-102 230,-96 282,-100", 2.8],
  ["M205,-158 C232,-160 254,-156 272,-148", 1.8],
  ["M-190,130 C-212,150 -236,160 -262,160", 2],
])}
<g filter="url(#${p}-fBlur8)" opacity="0.3" fill="#ff4a26">${bleed(ENV_BEHIND)}</g>
${items(p, ENV_BEHIND)}`;
}

export function envelopeFrontArt(p: string) {
  return `<g filter="url(#${p}-fBlur8)" opacity="0.3" fill="#ff4a26">${bleed(ENV_FRONT)}</g>
${items(p, ENV_FRONT)}
<g filter="url(#${p}-fLine)"><use href="#${p}-splat" transform="translate(300,-60) scale(0.8)"/></g>`;
}

/** Ba kiểu cánh rơi (son, son dáng hai, cánh cờ) và bộ lọc đi kèm. */
export const PETAL_KINDS = [
  { ref: "petR", filter: "fPaintA" },
  { ref: "petR", filter: "fPaintB" },
  { ref: "petR2", filter: "fPaintC" },
  { ref: "petF", filter: "fPaintF" },
] as const;
export const PETAL_VIEWBOX = "-30 -62 60 70";
