/**
 * Dựng các artboard .dc.html cho bản thiết kế "Chòm Sao Thiên Bình Giữa Màn".
 * Chạy: node design/gen.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { libraSvg, starSkySvg } from "./constellation.mjs";

const OUT = dirname(fileURLToPath(import.meta.url));

/* ---------- CSS dùng chung ---------- */

const BASE_CSS = `
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "Be Vietnam Pro", system-ui, sans-serif; }
    a { color: oklch(0.85 0.14 88); text-decoration: none; }
    a:hover { color: oklch(0.92 0.1 90); }

    .scene {
      position: relative;
      overflow: hidden;
      background: linear-gradient(180deg,
        oklch(0.115 0.038 283) 0%,
        oklch(0.16 0.045 285) 46%,
        oklch(0.205 0.055 293) 100%);
    }

    /* ba khối quầng sáng của theme */
    .neb { position: absolute; filter: blur(46px); pointer-events: none; }
    .neb-violet { left: 50%; top: -8rem; width: 42rem; height: 24rem; margin-left: -21rem; opacity: 0.6;
      background-image: radial-gradient(circle, oklch(0.5 0.12 310 / 35%) 0%, transparent 70%); }
    .neb-rose { left: 25%; bottom: 0; width: 18rem; height: 18rem; margin-left: -9rem; opacity: 0.5;
      background-image: radial-gradient(circle, oklch(0.6 0.16 350 / 30%) 0%, transparent 70%); }
    .neb-gold { right: 25%; top: 33%; width: 16rem; height: 16rem; margin-right: -8rem; opacity: 0.4;
      background-image: radial-gradient(circle, oklch(0.75 0.14 88 / 22%) 0%, transparent 70%); }
    .milky { left: -10%; top: 4%; width: 130%; height: 300px; opacity: 0.5; transform: rotate(-11deg);
      filter: blur(34px);
      background-image: linear-gradient(180deg, transparent, oklch(0.55 0.07 295 / 26%) 45%, transparent); }

    .stars { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }

    /* chòm sao luôn nằm chính giữa màn; nội dung phủ lên trên */
    .art { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); pointer-events: none; }
    .libra { display: block; width: 100%; height: auto; overflow: visible;
      fill: none; stroke-linecap: round; stroke-linejoin: round; }

    /* nét nối các sao chính sáng và dày hơn nét vẽ hình */
    .libra .ln { stroke-width: 1.9; opacity: 0.8; }
    .libra .ol { stroke-width: 1.25; opacity: 0.5; }
    .libra .st { stroke: none; }
    .st .s { fill: oklch(0.99 0.012 92);
      filter: drop-shadow(0 0 6px oklch(0.97 0.05 90)) drop-shadow(0 0 15px oklch(0.9 0.08 88 / 60%)); }
    /* β Librae là ngôi sao mắt thường duy nhất được ghi nhận có ánh lục */
    .st .s-beta { fill: oklch(0.97 0.05 175);
      filter: drop-shadow(0 0 8px oklch(0.94 0.08 175)) drop-shadow(0 0 18px oklch(0.86 0.1 178 / 65%)); }

    .vignette { position: absolute; inset: 0; pointer-events: none;
      background: radial-gradient(120% 90% at 50% 45%, transparent 40%, oklch(0.09 0.03 285 / 55%) 100%); }
`;

const OVERLAY_CSS = `
    /* làm tối rất nhẹ ngay sau khối chữ để chữ vẫn đọc được mà chòm sao không mất */
    .overlay { position: absolute; inset: 0; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 22px; padding: 48px; text-align: center;
      background: radial-gradient(58% 44% at 50% 47%, oklch(0.12 0.04 285 / 58%) 0%, transparent 72%); }
    .headline { margin: 0; font-family: "Playfair Display", "Be Vietnam Pro", serif; font-weight: 700;
      color: oklch(0.85 0.14 88); text-wrap: balance;
      text-shadow: 0 0 24px oklch(0.85 0.14 88 / 45%); }
    .lede { margin: 0; color: oklch(0.95 0.02 90); line-height: 1.7; text-wrap: pretty; }
    .sub { margin: 0; color: oklch(0.7 0.05 300); }
    .cta { display: inline-flex; align-items: center; justify-content: center;
      border: 0; border-radius: 9999px; background: oklch(0.85 0.14 88);
      color: oklch(0.22 0.05 285); font-family: inherit; font-weight: 600;
      box-shadow: 0 12px 32px oklch(0.85 0.14 88 / 22%); }
`;

/* ---------- khung file ---------- */

function page({ props, logic, body, css }) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600&family=Playfair+Display:wght@600;700&display=swap">
  <style>${css}</style>
</helmet>
${body}
</x-dc>
<script data-dc-script data-props='${props}'>
${logic}
</script>
</body>
</html>
`;
}

const TINT = {
  editor: "color",
  default: "#a9d7ff",
  options: ["#a9d7ff", "#d7e8ff", "#ffe3ad", "#e6c9ff"],
  section: "Chòm sao",
};

const props = (obj) => JSON.stringify(obj).replace(/'/g, "&#39;");

const NEBS = `  <div class="neb neb-violet"></div>
  <div class="neb neb-rose"></div>
  <div class="neb neb-gold"></div>
  <div class="neb milky"></div>`;

/* --- Main: màn desktop, nội dung phủ lên chòm sao --- */

writeFileSync(
  join(OUT, "Main.dc.html"),
  page({
    props: props({
      tint: TINT,
      artWidth: { editor: "range", default: 860, min: 400, max: 1400, step: 20, unit: "px", section: "Chòm sao" },
      showOverlay: { editor: "boolean", default: true, section: "Nội dung" },
      $preview: { width: 1440, height: 900 },
    }),
    logic: `class Component extends DCLogic {
  renderVals() {
    return {
      tint: this.props.tint ?? "#a9d7ff",
      artWidth: this.props.artWidth ?? 860,
      showOverlay: this.props.showOverlay ?? true,
    };
  }
}`,
    css:
      BASE_CSS +
      OVERLAY_CSS +
      `
    .scene { width: 1440px; height: 900px; }
    .headline { font-size: 62px; line-height: 1.12; max-width: 940px; }
    .lede { font-size: 19px; max-width: 620px; }
    .sub { font-size: 16px; }
    .cta { padding: 14px 34px; font-size: 17px; }
`,
    body: `<div class="scene">
${NEBS}
  ${starSkySvg(20260908)}

  <div class="art" style="width: {{artWidth}}px">
    ${libraSvg()}
  </div>

  <div class="vignette"></div>

  <sc-if value="{{showOverlay}}" hint-placeholder-val="{{true}}">
    <div class="overlay">
      <h1 class="headline">CHÚC MỪNG SINH NHẬT NGUYỄN THỊ PHƯỢNG!</h1>
      <p class="lede">Chúc Nguyễn Thị Phượng một tuổi mới thật nhiều sức khỏe, niềm vui và may mắn. Mong rằng mọi điều tốt đẹp nhất sẽ luôn đến với bạn — hôm nay, ngày mai và mãi mãi.</p>
      <p class="sub">Cảm ơn bạn vì đã luôn tỏa sáng theo cách rất riêng của mình.</p>
      <button class="cta" type="button">Đến phần thổi nến nào</button>
    </div>
  </sc-if>
</div>`,
  }),
);

/* --- Artwork: riêng chòm sao, không bị nội dung che --- */

writeFileSync(
  join(OUT, "Artwork.dc.html"),
  page({
    props: props({
      tint: TINT,
      artWidth: { editor: "range", default: 1000, min: 500, max: 1400, step: 20, unit: "px", section: "Chòm sao" },
      $preview: { width: 1440, height: 780 },
    }),
    logic: `class Component extends DCLogic {
  renderVals() {
    return {
      tint: this.props.tint ?? "#a9d7ff",
      artWidth: this.props.artWidth ?? 1000,
    };
  }
}`,
    css:
      BASE_CSS +
      `
    .scene { width: 1440px; height: 780px; }
`,
    body: `<div class="scene">
${NEBS}
  ${starSkySvg(77712)}

  <div class="art" style="width: {{artWidth}}px">
    ${libraSvg()}
  </div>

  <div class="vignette"></div>
</div>`,
  }),
);

/* --- Mobile: cùng chòm sao giữa màn điện thoại --- */

writeFileSync(
  join(OUT, "Mobile.dc.html"),
  page({
    props: props({
      tint: TINT,
      artWidth: { editor: "range", default: 480, min: 240, max: 700, step: 10, unit: "px", section: "Chòm sao" },
      showOverlay: { editor: "boolean", default: true, section: "Nội dung" },
      $preview: { width: 390, height: 844 },
    }),
    logic: `class Component extends DCLogic {
  renderVals() {
    return {
      tint: this.props.tint ?? "#a9d7ff",
      artWidth: this.props.artWidth ?? 480,
      showOverlay: this.props.showOverlay ?? true,
    };
  }
}`,
    css:
      BASE_CSS +
      OVERLAY_CSS +
      `
    .scene { width: 390px; height: 844px; }
    .overlay { padding: 28px; gap: 18px; }
    .headline { font-size: 32px; line-height: 1.15; }
    .lede { font-size: 15px; }
    .sub { font-size: 13px; }
    .cta { padding: 13px 26px; font-size: 15px; min-height: 46px; }
`,
    body: `<div class="scene">
${NEBS}
  ${starSkySvg(4412)}

  <div class="art" style="width: {{artWidth}}px">
    ${libraSvg()}
  </div>

  <div class="vignette"></div>

  <sc-if value="{{showOverlay}}" hint-placeholder-val="{{true}}">
    <div class="overlay">
      <h1 class="headline">CHÚC MỪNG SINH NHẬT PHƯỢNG!</h1>
      <p class="lede">Chúc bạn một tuổi mới thật nhiều sức khỏe, niềm vui và may mắn.</p>
      <p class="sub">Cảm ơn bạn vì đã luôn tỏa sáng theo cách rất riêng của mình.</p>
      <button class="cta" type="button">Đến phần thổi nến nào</button>
    </div>
  </sc-if>
</div>`,
  }),
);

console.log("đã dựng: Main.dc.html, Artwork.dc.html, Mobile.dc.html");
