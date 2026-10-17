import { memo } from "react";
import { cornerArt, envelopeBackArt, envelopeFrontArt, wcDefs } from "./watercolor";

/**
 * Hoa phượng màu nước (bản thiết kế "Bản màu nước" trên canvas).
 *
 * Mỗi SVG tự mang bộ defs riêng với id có tiền tố theo biến thể: nhiều SVG cùng
 * nằm trên trang, và một bản có thể đang `display: none` — gradient/bộ lọc trỏ
 * vào bản bị ẩn sẽ không vẽ được. Chuỗi SVG dựng một lần ở cấp module.
 */

const VIEW = {
  corner: { box: "0 0 560 480", id: "pc", art: cornerArt },
  envelopeBack: { box: "-300 -260 620 460", id: "peb", art: envelopeBackArt },
  envelopeFront: { box: "-300 -260 620 460", id: "pef", art: envelopeFrontArt },
} as const;

const HTML_SMOOTH = Object.fromEntries(
  Object.entries(VIEW).map(([k, v]) => [k, `<defs>${wcDefs(v.id, false)}</defs>${v.art(v.id)}`]),
) as Record<keyof typeof VIEW, string>;

const HTML_HD = Object.fromEntries(
  Object.entries(VIEW).map(([k, v]) => [k, `<defs>${wcDefs(v.id, true)}</defs>${v.art(v.id)}`]),
) as Record<keyof typeof VIEW, string>;

export const PhuongBranch = memo(function PhuongBranch({
  variant,
  className,
  hd = false,
}: {
  variant: keyof typeof VIEW;
  className?: string;
  hd?: boolean;
}) {
  const map = hd ? HTML_HD : HTML_SMOOTH;
  return (
    <svg
      className={className}
      viewBox={VIEW[variant].box}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: map[variant] }}
    />
  );
});

const ICON_HTML_SMOOTH = `<defs>${wcDefs("pi", false)}</defs><use href="#pi-flA" transform="rotate(-8) scale(0.95)"/>`;
const ICON_HTML_HD = `<defs>${wcDefs("pi", true)}</defs><use href="#pi-flA" transform="rotate(-8) scale(0.95)"/>`;

/** Một bông phượng lẻ, dùng thay icon hoa ở phần chữ. */
export function PhuongBloomIcon({ className, hd = false }: { className?: string; hd?: boolean }) {
  return (
    <svg
      className={className}
      viewBox="-66 -66 132 132"
      style={{ overflow: "visible" }}
      aria-hidden
      dangerouslySetInnerHTML={{ __html: hd ? ICON_HTML_HD : ICON_HTML_SMOOTH }}
    />
  );
}
