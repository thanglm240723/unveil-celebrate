/**
 * Hình chòm sao Thiên Bình + bầu trời sao nền.
 * Dùng chung cho cả ba artboard trong design/gen.mjs.
 */

/* ---------- bầu trời sao (PRNG có seed, dựng ra y hệt mỗi lần chạy) ---------- */

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

export const SKY_W = 1440;
export const SKY_H = 760;

function starfield(count, seed, W, H) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    let x, y;
    if (r() < 0.4) {
      // dải ngân hà chếch lên bên phải, như trong ảnh mẫu
      x = r() * (W + 120) - 60;
      y = 190 + (x / W) * 250 + (r() + r() + r() - 1.5) * 120;
    } else {
      x = r() * W;
      y = r() * H;
    }
    if (y < -20 || y > H + 20) continue;

    // thưa sao ngay giữa khung, chỗ đặt chòm sao — không thì hình cái cân
    // lẫn vào đám sao ngẫu nhiên, nhìn không ra
    const dx = (x - W / 2) / (W * 0.22);
    const dy = (y - H / 2) / (H * 0.34);
    const near = Math.sqrt(dx * dx + dy * dy);

    const roll = r();
    const rad = roll < 0.66 ? 0.7 + r() * 0.6 : roll < 0.93 ? 1.4 + r() * 0.5 : 2.1 + r() * 1.1;
    let op = roll < 0.66 ? 0.24 + r() * 0.26 : roll < 0.93 ? 0.5 + r() * 0.3 : 0.82 + r() * 0.18;
    if (near < 1) op *= 0.35 + near * 0.65;

    const cr = r();
    const fill = cr < 0.7 ? "#eef4ff" : cr < 0.9 ? "#bcd7ff" : "#ffe9bd";
    out.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(2)}" fill="${fill}" opacity="${op.toFixed(2)}"/>`,
    );
  }
  return out.join("\n      ");
}

/** Lớp sao nền phủ kín khung cảnh. */
export function starSkySvg(seed) {
  return `<svg class="stars" viewBox="0 0 ${SKY_W} ${SKY_H}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      ${starfield(240, seed, SKY_W, SKY_H)}
    </svg>`;
}

/* ---------- chòm sao Thiên Bình ----------
   Cái cân vẽ theo lối nét khắc: đòn cân là tam giác α–β–γ như trên trời thật,
   hai đĩa buông xuống từ α và γ. `ln` là nét nối các sao chính (sáng),
   `ol` là nét vẽ hình (mảnh hơn), `st` là các ngôi sao mốc.               */

const LIBRA = {
  outline: [
    // chóp trang trí trên đỉnh đòn cân
    "M191 48 L200 27 L209 48",
    "M188 48 q12 7 24 0",
    "M188 48 q-7 -5 -2 -10 M212 48 q7 -5 2 -10",
    // đòn cân, hai nét
    "M36 122 L200 58 L364 118",
    "M41 133 L200 70 L359 129",
    // trục giữa, viên trám, chân trụ
    "M200 70 V210",
    "M200 210 l15 19 l-15 19 l-15 -19 z",
    "M200 248 V292",
    // bệ tròn
    "M150 292 a50 18 0 1 0 100 0 a50 18 0 1 0 -100 0",
    "M164 292 a36 13 0 1 0 72 0 a36 13 0 1 0 -72 0",
    // đĩa cân trái: ba dây treo, vành đĩa, lòng đĩa
    "M36 122 L-6 266 M36 122 L126 266 M36 122 L60 292",
    "M-6 268 a66 22 0 1 0 132 0 a66 22 0 1 0 -132 0",
    "M-6 270 q66 46 132 0",
    // đĩa cân phải
    "M364 118 L296 238 M364 118 L396 238 M364 118 L346 258",
    "M296 238 a50 18 0 1 0 100 0 a50 18 0 1 0 -100 0",
    "M296 240 q50 38 100 0",
  ],
  ticks: { cx: 200, cy: 292, r0: 38, r1: 48, n: 16 },
  lines: [
    "M200 58 L36 122",
    "M36 122 L364 118",
    "M364 118 L200 58",
    "M36 122 L60 268",
    "M364 118 L346 238",
  ],
  stars: [
    // β Zubeneschamali — sao sáng nhất chòm, đỉnh đòn cân
    { x: 200, y: 58, r: 6.4, kind: "beta" },
    { x: 36, y: 122, r: 5.8 },
    { x: 364, y: 118, r: 5.2 },
    { x: 60, y: 268, r: 4.6 },
    { x: 346, y: 238, r: 4.4 },
    { x: 200, y: 292, r: 3.2 },
  ],
};

/** Vạch khắc quanh bệ cân, toả đều trên một hình bầu dục nhìn nghiêng. */
function ticks(t) {
  const out = [];
  for (let i = 0; i < t.n; i++) {
    const a = (Math.PI * 2 * i) / t.n;
    const c = Math.cos(a);
    const s = Math.sin(a) * 0.36;
    out.push(
      `<path d="M${(t.cx + c * t.r0).toFixed(1)} ${(t.cy + s * t.r0).toFixed(1)} L${(t.cx + c * t.r1).toFixed(1)} ${(t.cy + s * t.r1).toFixed(1)}"/>`,
    );
  }
  return out.join("");
}

/** Tỉ lệ khung hình của chòm sao — dùng để đặt chiều cao khối .art. */
export const LIBRA_RATIO = 320 / 480;

export function libraSvg() {
  const outline = LIBRA.outline.map((d) => `<path d="${d}"/>`).join("");
  const lines = LIBRA.lines.map((d) => `<path d="${d}"/>`).join("");
  const stars = LIBRA.stars
    .map((s) => `<circle cx="${s.x}" cy="${s.y}" r="${s.r}" class="${s.kind ? `s s-${s.kind}` : "s"}"/>`)
    .join("");
  return `<svg class="libra" viewBox="-40 10 480 320" preserveAspectRatio="xMidYMid meet" aria-hidden="true" stroke="{{tint}}">
      <g class="ln">${lines}</g>
      <g class="ol">${outline}${ticks(LIBRA.ticks)}</g>
      <g class="st">${stars}</g>
    </svg>`;
}
