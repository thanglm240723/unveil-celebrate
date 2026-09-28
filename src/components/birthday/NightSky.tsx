import { memo } from "react";
import { washFilter } from "./watercolor";

/**
 * Bầu trời sao cho toàn trang.
 *
 * Mọi giá trị ngẫu nhiên đều sinh từ một PRNG có seed cố định và được tính
 * MỘT LẦN ở cấp module, nên:
 *   - server và client dựng ra y hệt nhau (không vỡ hydration),
 *   - sao không nhảy lung tung mỗi khi component cha render lại
 *     (màn 2 gõ chữ khiến cha render ~46 lần trong 2.7 giây).
 */

interface Star {
  x: string;
  y: string;
  w: string;
  bg: string;
  glow: number;
  op: string;
  cls: string;
  dur: string;
  del: string;
}

interface Meteor {
  cls: string;
  x: string;
  y: string;
  w: string;
  dur: string;
  del: string;
}

interface Spark {
  x: number;
  y: number;
  r: string;
  c: string;
  del: string;
}

function rng(seed: number) {
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

/** `extraFrom` trở đi là lớp sao chỉ hiện trên màn hình rộng. */
function buildStars(count: number, seed: number, extraFrom: number): Array<Star> {
  const r = rng(seed);
  const out: Array<Star> = [];

  for (let i = 0; i < count; i++) {
    let x: number;
    let y: number;

    if (r() < 0.34) {
      // sao nằm trong dải ngân hà
      x = r() * 118 - 9;
      y = 4 + (x / 100) * 34 + (r() + r() + r() - 1.5) * 11;
    } else {
      x = r() * 100;
      y = r() * 100;
    }

    const roll = r();
    let w: number;
    let op: number;
    let tw: string;
    let glow = 0;

    if (roll < 0.62) {
      w = 1.4 + r() * 0.5;
      op = 0.3 + r() * 0.25;
      tw = "tw-b";
      glow = w * 1.8;
    } else if (roll < 0.9) {
      w = 2.2;
      op = 0.55 + r() * 0.3;
      tw = "tw-a";
      glow = w * 2.4;
    } else {
      w = 3 + r() * 1.4;
      op = 0.85 + r() * 0.15;
      tw = "tw-c";
      glow = w * 2.8;
    }

    const cr = r();
    const bg =
      cr < 0.72
        ? "oklch(0.97 0.012 90)"
        : cr < 0.9
          ? "oklch(0.92 0.055 245)"
          : "oklch(0.93 0.09 88)";

    // làm thưa sao nền ở khoảng giữa màn, nơi đặt chòm sao Thiên Bình —
    // không thì hình cái cân lẫn vào đám sao ngẫu nhiên, nhìn không ra,
    // và nội dung ở giữa cũng nổi lên hơn
    const dx = (x - 50) / 26;
    const dy = (y - 50) / 30;
    const near = Math.sqrt(dx * dx + dy * dy);
    if (near < 1) op *= 0.35 + near * 0.65;

    const cls = ["star", r() < 0.42 ? `tw ${tw}` : "", i >= extraFrom ? "star-wide" : ""]
      .filter(Boolean)
      .join(" ");

    out.push({
      x: x.toFixed(2),
      y: y.toFixed(2),
      w: w.toFixed(2),
      bg,
      glow,
      op: op.toFixed(3),
      cls,
      dur: (2.6 + r() * 4).toFixed(2),
      del: (r() * 9).toFixed(2),
    });
  }

  return out;
}

function buildMeteors(count: number, seed: number, extraFrom: number): Array<Meteor> {
  const r = rng(seed);
  const out: Array<Meteor> = [];
  for (let i = 0; i < count; i++) {
    out.push({
      // sáu đường bay dựng sẵn, đều chếch xuống bên phải như mưa sao băng thật
      cls: `shoot m${1 + Math.floor(r() * 6)}${i >= extraFrom ? " shoot-wide" : ""}`,
      x: (r() * 80 - 7).toFixed(1),
      y: (r() * 46 - 4).toFixed(1),
      w: (80 + r() * 120).toFixed(0),
      dur: (7 + r() * 6).toFixed(2),
      del: (r() * 12).toFixed(2),
    });
  }
  return out;
}

function buildSparks(seed: number): Array<Spark> {
  const r = rng(seed);
  const spots = [
    [16, 14],
    [78, 21],
    [30, 70],
    [86, 62],
    [58, 8],
    [10, 44],
  ];
  return spots.map(([x, y]) => ({
    x: x!,
    y: y!,
    r: (26 + r() * 20).toFixed(1),
    c: (3.6 + r() * 2.2).toFixed(1),
    del: (r() * 4).toFixed(2),
  }));
}

const STARS = buildStars(260, 20260906, 150);
const METEORS = buildMeteors(11, 5150, 8);
const SPARKS = buildSparks(77);

/**
 * Chòm sao Thiên Bình, làm điểm nhấn nhỏ ở góc trời.
 *
 * Đòn cân là tam giác α–β–γ dựng từ RA/Dec thật (J2000) của sáu sao chính,
 * hai đĩa buông xuống từ α và γ — nên khung xương đúng như trên trời. Phần
 * hình cái cân (chóp, trục, bệ, vành đĩa) vẽ thêm theo lối nét khắc.
 */
const LIBRA_LINES = [
  "M200 58 L36 122", // β Zubeneschamali — α Zubenelgenubi
  "M36 122 L364 118", // α — γ
  "M364 118 L200 58", // γ — β, khép thanh cân
  "M36 122 L60 268", // α — υ, đĩa cân trái
  "M364 118 L346 238", // γ — σ Brachium, đĩa cân phải
];

/* Nét vẽ hình: mảnh và mờ hơn nét nối sao, để cái cân hiện ra mà không
   lấn át khung xương chòm sao. */
const LIBRA_FIGURE = [
  // chóp trang trí trên đỉnh đòn cân
  "M191 48 L200 27 L209 48",
  "M188 48 q12 7 24 0",
  "M188 48 q-7 -5 -2 -10 M212 48 q7 -5 2 -10",
  // đòn cân
  "M36 122 L200 58 L364 118",
  // trục giữa, viên trám, chân trụ
  "M200 70 V210",
  "M200 210 l15 19 l-15 19 l-15 -19 z",
  "M200 248 V292",
  // bệ tròn
  "M150 292 a50 18 0 1 0 100 0 a50 18 0 1 0 -100 0",
  // đĩa cân trái: ba dây treo, vành đĩa, lòng đĩa
  "M36 122 L-6 266 M36 122 L126 266 M36 122 L60 292",
  "M-6 268 a66 22 0 1 0 132 0 a66 22 0 1 0 -132 0",
  "M-6 270 q66 46 132 0",
  // đĩa cân phải
  "M364 118 L296 238 M364 118 L396 238 M364 118 L346 258",
  "M296 238 a50 18 0 1 0 100 0 a50 18 0 1 0 -100 0",
  "M296 240 q50 38 100 0",
];

/* Nét khắc chi tiết: nét đôi của đòn cân, vành trong của bệ, và các vạch
   khắc quanh bệ. Dưới khoảng 280px chúng dính vào nhau thành vệt bẩn nên
   CSS ẩn cả nhóm này đi ở màn hẹp (.libra-detail). */
const LIBRA_DETAIL = [
  "M41 133 L200 70 L359 129",
  "M164 292 a36 13 0 1 0 72 0 a36 13 0 1 0 -72 0",
  ...Array.from({ length: 16 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 16;
    const c = Math.cos(a);
    const v = Math.sin(a) * 0.36;
    return `M${(200 + c * 38).toFixed(1)} ${(292 + v * 38).toFixed(1)} L${(200 + c * 48).toFixed(1)} ${(292 + v * 48).toFixed(1)}`;
  }),
];

/**
 * Trình tự sáng dần khi mở trang: β sáng trước, nét nối chạy tới đâu sao ở đó
 * bừng lên, khép tam giác cán cân, buông hai dây đĩa, rồi hình cái cân hiện mờ.
 * Sau đó mỗi sao lấp lánh lệch nhịp và thỉnh thoảng loé tia chữ thập.
 * Trạng thái mặc định (không animation) là chòm sao đã sáng đủ — máy bật
 * "giảm chuyển động" sẽ thấy ngay bản này.
 */
const LIBRA_STARS = [
  { cx: 200, cy: 58, r: 6.4, beta: true, on: 0.5, tw: 4.2, fl: 8.5, fd: 1.2 },
  { cx: 36, cy: 122, r: 5.8, on: 1.55, tw: 5.1, fl: 10.5, fd: 4.6 },
  { cx: 364, cy: 118, r: 5.2, on: 2.75, tw: 3.8, fl: 9.2, fd: 2.9 },
  { cx: 60, cy: 268, r: 4.6, on: 3.65, tw: 4.7, fl: 11.8, fd: 6.3 },
  { cx: 346, cy: 238, r: 4.4, on: 3.9, tw: 5.6, fl: 12.6, fd: 8.1 },
  { cx: 200, cy: 292, r: 3.2, on: 4.35, tw: 4.0, fl: 13.4, fd: 10.4 },
];
/** [trễ, thời lượng] vẽ từng nét nối, cùng thứ tự với LIBRA_LINES */
const LINE_TIMING = [
  [1.0, 0.6],
  [1.95, 0.85],
  [3.05, 0.6],
  [3.25, 0.45],
  [3.5, 0.45],
];
const FIGURE_DELAY = 4.4;

const FLARE_D =
  "M0,-16 C0.6,-3 3,-0.6 16,0 C3,0.6 0.6,3 0,16 C-0.6,3 -3,0.6 -16,0 C-3,-0.6 -0.6,-3 0,-16 Z";

function Libra() {
  const lines = LIBRA_LINES.map((d, i) => (
    <path
      key={i}
      className="libra-line"
      pathLength={100}
      d={d}
      style={{
        animationDelay: `${LINE_TIMING[i]![0]}s`,
        animationDuration: `${LINE_TIMING[i]![1]}s`,
      }}
    />
  ));
  return (
    <svg className="libra" viewBox="-40 10 480 320" aria-hidden>
      <defs>
        <radialGradient id="ls-halo">
          <stop offset="0" stopColor="#fff6e0" stopOpacity="0.95" />
          <stop offset="0.18" stopColor="#fff1cf" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#ffe9bd" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ffe9bd" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ls-halo-b">
          <stop offset="0" stopColor="#e6fff6" stopOpacity="0.95" />
          <stop offset="0.18" stopColor="#c9f7ea" stopOpacity="0.5" />
          <stop offset="0.45" stopColor="#bff5e8" stopOpacity="0.12" />
          <stop offset="1" stopColor="#bff5e8" stopOpacity="0" />
        </radialGradient>
        <filter id="ls-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <g className="libra-figure" style={{ animationDelay: `${FIGURE_DELAY}s` }}>
        {LIBRA_FIGURE.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g className="libra-figure libra-detail" style={{ animationDelay: `${FIGURE_DELAY}s` }}>
        {LIBRA_DETAIL.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      <g className="libra-lines">
        <g filter="url(#ls-glow)" strokeWidth="4" strokeOpacity="0.28">
          {lines}
        </g>
        <g strokeWidth="1.5" strokeOpacity="0.6">
          {lines}
        </g>
      </g>
      {LIBRA_STARS.map((s, i) => {
        const core = s.beta ? "#e3fff5" : "#fffaf0";
        const on = { animationDelay: `${s.on}s` };
        return (
          <g key={i} transform={`translate(${s.cx},${s.cy})`}>
            <g className="libra-star" style={on}>
              <circle
                className="libra-ring"
                r={s.r * 1.6}
                stroke={s.beta ? "#c8f6e8" : "#fff1d6"}
                style={on}
              />
              <g
                className="libra-tw"
                style={{ animationDuration: `${s.tw}s`, animationDelay: `${s.on + 1.2}s` }}
              >
                <circle r={s.r * 4.4} fill={`url(#${s.beta ? "ls-halo-b" : "ls-halo"})`} />
                <circle r={s.r} fill={core} />
              </g>
              <g
                className="libra-flare"
                style={{ animationDuration: `${s.fl}s`, animationDelay: `${s.on + 1.5 + s.fd}s` }}
              >
                <path d={FLARE_D} fill={core} transform={`scale(${s.r / 5})`} />
              </g>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/** Mảng màu loang như màu nước thấm giấy — thay cho các quầng sáng mờ tròn trịa. */
const WASHES = [
  { cx: 760, cy: 30, rx: 540, ry: 230, c: "#6b4bb0", o: 0.26 },
  { cx: 640, cy: 190, rx: 860, ry: 80, c: "#a495e0", o: 0.09, rot: -11 },
  { cx: 300, cy: 880, rx: 340, ry: 230, c: "#c0507f", o: 0.2 },
  { cx: 1290, cy: 560, rx: 250, ry: 320, c: "#3d5ea8", o: 0.2 },
  { cx: 90, cy: 420, rx: 170, ry: 260, c: "#8a3f8f", o: 0.13 },
  { cx: 1060, cy: 300, rx: 150, ry: 150, c: "#e0a55a", o: 0.08 },
];
const WASH_HTML =
  `<defs>${washFilter("sky-wash", { seed: 9, freq: 0.008, disp: 120, blur: 18 })}</defs>` +
  WASHES.map(
    (b) =>
      `<g filter="url(#sky-wash)" opacity="${b.o}"><ellipse cx="${b.cx}" cy="${b.cy}" rx="${b.rx}" ry="${b.ry}" fill="${b.c}"${
        b.rot ? ` transform="rotate(${b.rot} ${b.cx} ${b.cy})"` : ""
      }/></g>`,
  ).join("");

/** `focused` dành khoảng trống cho bánh; `calm` làm dịu toàn bộ màn thư. */
export const NightSky = memo(function NightSky({
  calm = false,
  focused = false,
  dimmed = false,
}: {
  calm?: boolean;
  focused?: boolean;
  dimmed?: boolean;
}) {
  return (
    <div
      className={`night-sky ${calm ? "is-calm" : ""} ${focused ? "is-focused" : ""} ${dimmed ? "is-dimmed" : ""}`}
      aria-hidden
    >
      {/* quầng sáng nền — dùng background-image, không phải background-color */}
      <div className="neb neb-violet" />
      <div className="neb neb-rose" />
      <div className="neb neb-gold" />
      <div className="neb milky-way" />
      <svg
        className="sky-wash"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        dangerouslySetInnerHTML={{ __html: WASH_HTML }}
      />

      {!calm && <Libra />}

      {STARS.map((s, i) => (
        <div
          key={i}
          className={s.cls}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.w}px`,
            height: `${s.w}px`,
            background: s.bg,
            boxShadow: s.glow ? `0 0 ${s.glow}px ${s.bg}` : undefined,
            opacity: s.op,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.del}s`,
          }}
        />
      ))}

      {SPARKS.map((k, i) => (
        <div
          key={i}
          className="spark"
          style={{ left: `${k.x}%`, top: `${k.y}%`, animationDelay: `${k.del}s` }}
        >
          <span className="ray" style={{ width: `${k.r}px` }} />
          <span className="ray v" style={{ width: `${k.r}px` }} />
          <span className="core" style={{ width: `${k.c}px`, height: `${k.c}px` }} />
        </div>
      ))}

      {METEORS.map((m, i) => (
        <div
          key={i}
          className={m.cls}
          style={{
            left: `${m.x}%`,
            top: `${m.y}%`,
            width: `${m.w}px`,
            animationDuration: `${m.dur}s`,
            animationDelay: `${m.del}s`,
          }}
        />
      ))}

      <div className="sky-vignette" />
    </div>
  );
});
