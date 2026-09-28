import { useEffect, useState, type CSSProperties } from "react";
import { PETAL_KINDS, PETAL_VIEWBOX, wcDefs } from "./watercolor";

/**
 * Bộ defs màu nước dùng chung cho mọi cánh rơi trên trang — mỗi cánh chỉ là
 * một <svg> nhỏ trỏ vào đây. Hai lớp cánh (rơi nhẹ, gió cuốn) có thể cùng hiện
 * lúc chuyển màn nên mỗi lớp mang tiền tố riêng.
 */
function SharedDefs({ p }: { p: string }) {
  return (
    <svg
      width="0"
      height="0"
      className="absolute"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: `<defs>${wcDefs(p)}</defs>` }}
    />
  );
}

function PetalArt({ p, kind }: { p: string; kind: number }) {
  const k = PETAL_KINDS[kind % PETAL_KINDS.length]!;
  return (
    <svg
      viewBox={PETAL_VIEWBOX}
      width="100%"
      height="100%"
      className="block overflow-visible"
      aria-hidden
    >
      <g filter={`url(#${p}-${k.filter})`}>
        <use href={`#${p}-${k.ref}`} />
      </g>
    </svg>
  );
}

interface Petal {
  left: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  kind: number;
  opacity: number;
}

function makePetals(count: number, slow: boolean): Array<Petal> {
  return Array.from({ length: count }, (_, i) => {
    // dồn cánh về hai mép, chừa khoảng giữa cho nội dung; chỉ ~1/5 số cánh
    // được bay qua vùng trung tâm để cảnh vẫn có chiều sâu
    const center = i % 5 === 4;
    const left = center
      ? 30 + Math.random() * 40
      : i % 2 === 0
        ? Math.random() * 26
        : 74 + Math.random() * 26;
    return {
      left,
      size: 13 + Math.random() * 10,
      delay: Math.random() * (slow ? 6 : 5),
      duration: (slow ? 22 : 7) + Math.random() * (slow ? 10 : 6),
      drift: (Math.random() < 0.5 ? -1 : 1) * (18 + Math.random() * 46),
      spin: 180 + Math.random() * 360,
      kind: Math.floor(Math.random() * PETAL_KINDS.length),
      opacity: center ? 0.5 : 0.75 + Math.random() * 0.25,
    };
  });
}

/**
 * Cánh hoa phượng rơi ở lớp nền. Sinh trong effect chứ không phải lúc render:
 * app chạy SSR nên Math.random() ở thân component sẽ lệch giữa server và client.
 */
export function Petals() {
  const [petals, setPetals] = useState<Array<Petal>>([]);

  useEffect(() => {
    const slow = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    const count = slow ? 6 : narrow ? 15 : 26;
    setPetals(makePetals(count, slow));
  }, []);

  return (
    <div className="petal-field" aria-hidden>
      <SharedDefs p="pf" />
      {petals.map((p, i) => (
        <div
          key={i}
          className="petal"
          style={
            {
              left: `${p.left}%`,
              width: p.size * (6 / 7),
              height: p.size,
              opacity: p.opacity,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as CSSProperties
          }
        >
          <PetalArt p="pf" kind={p.kind} />
        </div>
      ))}
    </div>
  );
}

interface GustPetal {
  x: number;
  y: number;
  size: number;
  kind: number;
  far: boolean;
  near: boolean;
  style: CSSProperties;
}

function makeGust(count: number, w: number, h: number): Array<GustPetal> {
  const r = Math.random;
  return Array.from({ length: count }, () => {
    // dồn về giữa dải chéo từ góc dưới trái lên góc trên phải
    const t = (r() + r()) / 2;
    const x = -0.04 * w + t * 1.08 * w;
    const y =
      h * (0.94 - t * 0.88) +
      0.09 * h * Math.sin(t * Math.PI * 2.2) +
      (r() + r() + r() - 1.5) * 0.17 * h;
    const depth = r();
    const far = depth < 0.22;
    const near = depth > 0.82;
    const size = far ? 9 + r() * 5 : near ? 28 + r() * 12 : 14 + r() * 10;
    const r0 = Math.floor(r() * 360);
    const rm = r0 + 160 + Math.floor(r() * 200);
    return {
      x,
      y,
      size,
      kind: Math.floor(r() * PETAL_KINDS.length),
      far,
      near,
      style: {
        "--x0": `${-Math.round((0.39 + r() * 0.25) * w)}px`,
        "--y0": `${Math.round((0.38 + r() * 0.24) * h)}px`,
        "--x1": `${Math.round((0.39 + r() * 0.26) * w)}px`,
        "--y1": `${-Math.round((0.37 + r() * 0.27) * h)}px`,
        "--r0": `${r0}deg`,
        "--rm": `${rm}deg`,
        "--r1": `${rm + 180 + Math.floor(r() * 260)}deg`,
        animationDelay: `${0.1 + t * 0.6 + r() * 0.45}s`,
        animationDuration: `${1.5 + r() * 0.8}s`,
      } as CSSProperties,
    };
  });
}

/**
 * Đợt gió cuốn cánh phượng ngay khi nến tắt: cánh bay chéo qua màn hình, lật
 * xoay, sớm muộn lệch nhau thành một làn sóng, che bước chuyển sang màn hoa.
 * Máy bật "giảm chuyển động" thì không chạy.
 */
export function PetalGust() {
  const [petals, setPetals] = useState<Array<GustPetal>>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const narrow = window.matchMedia("(max-width: 767px)").matches;
    setPetals(makeGust(narrow ? 32 : 64, window.innerWidth, window.innerHeight));
  }, []);

  if (!petals.length) return null;

  return (
    <div className="petal-gust" aria-hidden>
      <SharedDefs p="pg" />
      {petals.map((p, i) => (
        <div
          key={i}
          className="gust-petal"
          style={{
            ...p.style,
            left: p.x - (p.size * 3) / 7,
            top: p.y - p.size / 2,
            width: p.size * (6 / 7),
            height: p.size,
          }}
        >
          {/* độ mờ/nhoè nằm ở lớp trong: lớp ngoài do animation điều khiển opacity */}
          <div
            className="h-full w-full"
            style={{
              opacity: p.far ? 0.55 : undefined,
              filter: p.near ? "blur(1.3px)" : undefined,
            }}
          >
            <PetalArt p="pg" kind={p.kind} />
          </div>
        </div>
      ))}
    </div>
  );
}
