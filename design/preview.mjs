/**
 * Đổi một artboard .dc.html thành HTML thường để xem thử bằng trình duyệt.
 * Chỉ dùng để kiểm tra hình vẽ, không phải file đem đi lưu.
 * Chạy: node design/preview.mjs Main.dc.html <thư mục ra>
 */
import { readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const src = process.argv[2] ?? "Main.dc.html";
const outDir = process.argv[3] ?? HERE;

const raw = readFileSync(join(HERE, src), "utf8");

// lấy giá trị mặc định ngay từ data-props, đừng chép tay lại
const propsRaw = raw.match(/data-props='([^']*)'/)?.[1] ?? "{}";
const parsed = JSON.parse(propsRaw.replace(/&#39;/g, "'"));
const vals = Object.fromEntries(
  Object.entries(parsed)
    .filter(([k, v]) => !k.startsWith("$") && v && typeof v === "object" && "default" in v)
    .map(([k, v]) => [k, v.default]),
);

const body = raw
  .slice(raw.indexOf("<x-dc>") + 6, raw.indexOf("</x-dc>"))
  .replace(/<helmet>([\s\S]*?)<\/helmet>/, (_, h) => h)
  .replace(/<sc-if[^>]*>/g, "")
  .replace(/<\/sc-if>/g, "")
  .replace(/\{\{\s*(\w+)\s*\}\}/g, (m, k) => (k in vals ? String(vals[k]) : m));

const out = resolve(outDir, basename(src).replace(".dc.html", ".preview.html"));
writeFileSync(out, `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0">${body}</body></html>`);
console.log("preview:", out);
