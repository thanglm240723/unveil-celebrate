import { useCallback, useEffect, useRef, useState } from "react";
import { PhuongBranch } from "./PhuongBranch";

/* ------------------------------------------------------------------
 * NỘI DUNG BỨC THƯ — sửa trực tiếp ở đây.
 * Mỗi phần tử trong PARAGRAPHS là một đoạn, hiện dần cách nhau 0.5s.
 * ------------------------------------------------------------------ */

const PARAGRAPHS = [
  "Mình không giỏi nói những lời hoa mỹ, nên đành mượn một bức thư nhỏ để nói điều mà ngày thường ít khi nói ra.",
  "Một năm vừa rồi chắc có lúc bạn mệt. Nhưng mình vẫn thấy bạn cố gắng theo cách rất riêng — không ồn ào, không cần ai công nhận, cứ lặng lẽ mà bền bỉ. Điều đó đáng quý hơn bạn nghĩ nhiều.",
  "Tuổi mới, mình không chúc điều gì to tát đâu. Chỉ mong bạn ngủ đủ giấc, ăn ngon miệng, bớt lo nghĩ một chút, và cho phép mình được vui nhiều hơn.",
  "Nếu có hôm nào thấy chông chênh, hãy nhớ rằng vẫn luôn có người ở đây, mong bạn thật hạnh phúc.",
];

/** Thay bằng tên bạn. */
const SIGNATURE = "—Thắng";

/** Thả ảnh vào public/ rồi để nguyên đường dẫn này. Chưa có ảnh vẫn chạy. */
const PHOTO_SRC = "/thu-anh.jpg";
const PHOTO_CAPTION = "Giữ tấm này nhé";

/* ------------------------------------------------------------------ */

// Nắp mở 0,85s → giấy trượt lên → phong bì tan dần; khớp env-exit trong CSS.
const OPEN_DURATION_MS = 2100;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function Polaroid({ delay }: { delay: number }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="polaroid" style={{ animationDelay: `${delay}s` }}>
      <span className="tape" aria-hidden />
      {failed ? (
        <div className="polaroid-ph" aria-hidden>
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="8.5" cy="10" r="1.6" />
            <path d="M21 15.5 16 11l-6.5 8" />
          </svg>
          <span>Ảnh của bạn</span>
        </div>
      ) : (
        <img className="polaroid-img" src={PHOTO_SRC} alt="" onError={() => setFailed(true)} />
      )}
      <p className="polaroid-cap">{PHOTO_CAPTION}</p>
    </div>
  );
}

function Envelope({
  name,
  opening,
  onOpen,
}: {
  name: string;
  opening: boolean;
  onOpen: () => void;
}) {
  return (
    <div className={`env-scene ${opening ? "is-leaving" : ""}`}>
      <p className="stationery-eyebrow fade-in">Điều cuối cùng, từ trái tim</p>
      <h2 className="stationery-title fade-in">Có đôi lời muốn gửi bạn.</h2>
      <p className="stationery-subtitle fade-in">Một bức thư nhỏ. Một tấm lòng thật nhiều.</p>
      <div className="env-stage">
        <span className="env-glow" aria-hidden />
        <PhuongBranch variant="envelopeBack" className="env-branch" />
        <button
          type="button"
          onClick={onOpen}
          disabled={opening}
          className={`env ${opening ? "is-open" : ""}`}
          aria-label="Mở bức thư"
        >
          <span className="env-art" aria-hidden>
            <span className="env-back" />
            <span className="env-lining" />
            <span className="env-paper">
              <span className="env-paper-greeting">{name} thân mến,</span>
              <span className="env-paper-preview">
                Tuổi mới, mong bạn có thật nhiều những ngày bình yên.
              </span>
            </span>
            <span className="env-front" />
            <span className="env-bottom" />
            <span className="env-flap" />
            <span className="env-seal">
              <span>{name.charAt(0)}</span>
            </span>
            <span className="env-address">Gửi {name}, cho một người thật đặc biệt.</span>
          </span>
        </button>
        <PhuongBranch variant="envelopeFront" className="env-branch env-branch-front" />
      </div>
      <p className={`env-hint stationery-hint ${opening ? "gone" : ""}`}>
        Chạm vào dấu sáp để mở thư
      </p>
    </div>
  );
}

export function Letter({ name }: { name: string }) {
  const reduced = usePrefersReducedMotion();
  const [phase, setPhase] = useState<"sealed" | "opening" | "paper">("sealed");
  const paperRef = useRef<HTMLElement>(null);

  const open = useCallback(() => {
    setPhase((p) => (p === "sealed" ? "opening" : p));
  }, []);

  // phong bì mở xong mới trải trang thư ra
  useEffect(() => {
    if (phase !== "opening") return;
    const t = window.setTimeout(() => setPhase("paper"), reduced ? 0 : OPEN_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [phase, reduced]);

  // đưa focus sang trang thư để người dùng bàn phím / screen reader đọc được ngay
  useEffect(() => {
    if (phase === "paper") paperRef.current?.focus();
  }, [phase]);

  if (phase !== "paper") {
    return <Envelope name={name} opening={phase === "opening"} onOpen={open} />;
  }

  const lines = [`Gửi ${name},`, ...PARAGRAPHS, `Sinh nhật vui vẻ nhé, ${name}.`];
  const step = reduced ? 0 : 0.5;

  return (
    <article ref={paperRef} tabIndex={-1} className="letter-paper">
      {lines.map((line, i) => (
        <p
          key={i}
          className={`ink ${i === 0 ? "greet" : ""} ${i === lines.length - 1 ? "close" : ""}`}
          style={{ animationDelay: `${0.35 + i * step}s` }}
        >
          {line}
        </p>
      ))}

      <div className="sign-row">
        <p className="ink sign" style={{ animationDelay: `${0.35 + lines.length * step}s` }}>
          {SIGNATURE}
        </p>
        <div className="polaroid-slot">
          <Polaroid delay={0.35 + (lines.length + 1) * step} />
        </div>
      </div>
    </article>
  );
}
