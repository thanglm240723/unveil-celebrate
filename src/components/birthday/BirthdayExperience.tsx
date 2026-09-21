import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Cake } from "./Cake";
import { BirthdaySong } from "@/lib/birthday-music";
import phuongPhoto from "@/assets/phuong.png.asset.json";

const NAME = "Nguyễn Thị Phượng";
const HEADLINE = `CHÚC MỪNG SINH NHẬT ${NAME.toUpperCase()}!`;

type Stage = "unveiling" | "question" | "revelation" | "celebration" | "letter";

function GiftBox() {
  return (
    <svg viewBox="0 0 120 120" width="130" height="130" role="img" aria-label="Hộp quà">
      <defs>
        <linearGradient id="gift-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.16 350)" />
          <stop offset="100%" stopColor="oklch(0.58 0.18 350)" />
        </linearGradient>
        <linearGradient id="gift-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.8 0.14 350)" />
          <stop offset="100%" stopColor="oklch(0.66 0.17 350)" />
        </linearGradient>
      </defs>
      {/* glow */}
      <circle cx="60" cy="62" r="52" fill="oklch(0.85 0.14 88)" opacity="0.12" />
      {/* box */}
      <rect x="22" y="52" width="76" height="52" rx="6" fill="url(#gift-body)" />
      <rect x="16" y="38" width="88" height="20" rx="6" fill="url(#gift-lid)" />
      {/* ribbon */}
      <rect x="54" y="38" width="12" height="66" fill="oklch(0.87 0.14 88)" />
      {/* bow */}
      <path d="M60 38 C46 22 30 26 34 36 C37 44 52 42 60 38 Z" fill="oklch(0.87 0.14 88)" />
      <path d="M60 38 C74 22 90 26 86 36 C83 44 68 42 60 38 Z" fill="oklch(0.87 0.14 88)" />
      <circle cx="60" cy="38" r="6" fill="oklch(0.93 0.1 90)" />
      {/* shine */}
      <rect x="28" y="58" width="6" height="40" rx="3" fill="#ffffff" opacity="0.18" />
    </svg>
  );
}

/* ---------------- Fireworks canvas ---------------- */

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; color: string; size: number;
}

const FIREWORK_COLORS = ["#ffd166", "#ff5d8f", "#7bdff2", "#c77dff", "#95e06c", "#ff9e6d"];

function useFireworks(active: boolean) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particles: Particle[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const explode = (x: number, y: number) => {
      const color = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)] ?? "#ffd166";
      const count = 60 + Math.floor(Math.random() * 40);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const speed = (2 + Math.random() * 3.5) * dpr;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 55 + Math.random() * 35,
          color: Math.random() < 0.25 ? "#fff7d6" : color,
          size: (1.4 + Math.random() * 1.8) * dpr,
        });
      }
    };

    const launch = () => {
      const w = canvas.width, h = canvas.height;
      explode(w * (0.15 + Math.random() * 0.7), h * (0.12 + Math.random() * 0.4));
    };

    launch();
    const burstInterval = window.setInterval(launch, 650);
    const calmDown = window.setTimeout(() => {
      window.clearInterval(burstInterval);
      window.setInterval(launch, 2600);
    }, 7000);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = particles.filter((p) => p.life < p.maxLife);
      for (const p of particles) {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.045 * dpr;
        p.vx *= 0.985;
        const alpha = 1 - p.life / p.maxLife;
        ctx.globalAlpha = Math.max(alpha, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(burstInterval);
      window.clearTimeout(calmDown);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return ref;
}

/* ---------------- Balloons & confetti ---------------- */

const BALLOON_COLORS = ["#ff5d8f", "#ffd166", "#7bdff2", "#c77dff", "#95e06c", "#ff9e6d"];

function Balloons() {
  const balloons = Array.from({ length: 10 }, (_, i) => ({
    left: (i * 10 + Math.random() * 6) % 96,
    delay: Math.random() * 6,
    duration: 9 + Math.random() * 7,
    color: BALLOON_COLORS[i % BALLOON_COLORS.length],
    scale: 0.7 + Math.random() * 0.6,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {balloons.map((b, i) => (
        <div
          key={i}
          className="balloon"
          style={{
            left: `${b.left}%`,
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
            transform: `scale(${b.scale})`,
          }}
        >
          <svg viewBox="0 0 60 90" width="52" height="78">
            <ellipse cx="30" cy="32" rx="24" ry="30" fill={b.color} />
            <ellipse cx="22" cy="22" rx="7" ry="10" fill="#ffffff" opacity="0.25" />
            <path d="M30 62 l-5 8 h10 z" fill={b.color} />
            <path d="M30 70 q-6 10 2 18" stroke="#ffffff88" strokeWidth="1.4" fill="none" />
          </svg>
        </div>
      ))}
    </div>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 4,
    duration: 4 + Math.random() * 5,
    color: BALLOON_COLORS[i % BALLOON_COLORS.length],
    size: 6 + Math.random() * 8,
    round: Math.random() < 0.4,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 0.45,
            backgroundColor: p.color,
            borderRadius: p.round ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- Hoa phượng ---------------- */

function PhuongFlower({ size, tone }: { size: number; tone: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden>
      <g>
        {[0, 72, 144, 216].map((deg) => (
          <ellipse
            key={deg}
            cx="20"
            cy="11"
            rx="6.5"
            ry="9.5"
            fill={tone}
            transform={`rotate(${deg} 20 20)`}
          />
        ))}
        <ellipse cx="20" cy="11" rx="5.5" ry="9" fill="#fff2d6" opacity="0.85" transform="rotate(288 20 20)" />
        <circle cx="20" cy="20" r="3" fill="#ffd166" />
      </g>
    </svg>
  );
}

const PHUONG_TONES = ["#e63946", "#ff4d4d", "#d62828", "#ff6b6b", "#c1121f"];

function PhuongBlossoms({ count = 16, soft = false }: { count?: number; soft?: boolean }) {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 100) / count + Math.random() * 5,
        delay: Math.random() * 12,
        duration: 11 + Math.random() * 10,
        sway: 3 + Math.random() * 3,
        size: 16 + Math.random() * 18,
        tone: PHUONG_TONES[i % PHUONG_TONES.length] ?? "#e63946",
      })),
    [count],
  );
  return (
    <div className="phuong-layer" style={soft ? { opacity: 0.55 } : undefined} aria-hidden>
      {items.map((f, i) => (
        <span
          key={i}
          className="phuong-sway"
          style={{ left: `${f.left}%`, animationDuration: `${f.sway}s`, animationDelay: `${f.delay / 2}s` }}
        >
          <span
            className="phuong-blossom"
            style={{ animationDelay: `${f.delay}s`, animationDuration: `${f.duration}s` }}
          >
            <PhuongFlower size={f.size} tone={f.tone} />
          </span>
        </span>
      ))}
    </div>
  );
}

/* ---------------- Sparkle burst for gift ---------------- */

function SparkleBurst({ trigger }: { trigger: number }) {
  if (!trigger) return null;
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {Array.from({ length: 18 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 18;
        return (
          <span
            key={`${trigger}-${i}`}
            className="sparkle"
            style={{
              left: "50%",
              top: "50%",
              ["--dx" as string]: `${Math.cos(angle) * 110}px`,
              ["--dy" as string]: `${Math.sin(angle) * 110}px`,
              animationDelay: `${(i % 3) * 0.04}s`,
            }}
          />
        );
      })}
    </div>
  );
}

/* ---------------- Main experience ---------------- */

export function BirthdayExperience() {
  const [stage, setStage] = useState<Stage>("unveiling");
  const [burst, setBurst] = useState(0);
  const [typed, setTyped] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [wish, setWish] = useState("");
  const [wishSent, setWishSent] = useState(false);
  const [blown, setBlown] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const songRef = useRef<BirthdaySong | null>(null);
  const fireworksRef = useFireworks(stage === "revelation" || (stage === "celebration" && wishSent));

  useEffect(() => {
    return () => songRef.current?.stop();
  }, []);

  // Typewriter for the headline
  useEffect(() => {
    if (stage !== "revelation") return;
    if (typed >= HEADLINE.length) {
      const t = window.setTimeout(() => setShowMessage(true), 500);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setTyped((n) => n + 1), typed === 0 ? 600 : 55);
    return () => window.clearTimeout(t);
  }, [stage, typed]);

  const openGift = useCallback(() => {
    setBurst((n) => n + 1);
    window.setTimeout(() => setStage("question"), 550);
  }, []);

  const answer = useCallback((withMusic: boolean) => {
    if (withMusic) {
      songRef.current = new BirthdaySong();
      songRef.current.start(true);
    }
    setStage("revelation");
  }, []);

  const sendWish = useCallback(() => {
    if (!wish.trim() || wishSent) return;
    setWishSent(true);
    setBlown(true);
  }, [wish, wishSent]);

  const enterLetter = useCallback(() => {
    songRef.current?.stop();
    setStage("letter");
  }, []);

  return (
    <main className={`relative min-h-screen bg-background text-foreground ${stage === "letter" ? "overflow-y-auto" : "overflow-hidden"}`}>
      {/* ambient glow */}
      {stage !== "letter" && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-glow opacity-60 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-glow-rose opacity-50 blur-3xl" />
          <div className="absolute right-1/4 top-1/3 h-64 w-64 rounded-full bg-glow-gold opacity-40 blur-3xl" />
        </div>
      )}

      {/* ---------- Stage 1: The Unveiling ---------- */}
      {stage === "unveiling" && (
        <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <div className="starry-sky" aria-hidden>
            <span className="shooting-star shooting-star-one" />
            <span className="shooting-star shooting-star-two" />
          </div>
          <p className="fade-in relative z-10 mb-8 text-sm uppercase tracking-[0.35em] text-muted-foreground">
            Có một điều bất ngờ dành cho bạn…
          </p>
          <button
            type="button"
            onClick={openGift}
            className="group relative z-10 cursor-pointer outline-none transition-transform duration-300 hover:scale-110 focus-visible:scale-110"
            aria-label="Mở hộp quà"
          >
            <span className="gift-pulse block blur-[2px] transition-all duration-500 group-hover:blur-0">
              <GiftBox />
            </span>
            <SparkleBurst trigger={burst} />
          </button>
          <p className="fade-in relative z-10 mt-10 text-muted-foreground">Chạm vào hộp quà để mở màn ✨</p>
        </section>
      )}

      {/* ---------- Stage 1b: The Question ---------- */}
      {stage === "question" && (
        <section className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="pop-in w-full max-w-md rounded-3xl border border-border bg-card/80 p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="mb-4 text-4xl">🎵</div>
            <h1 className="font-display text-xl leading-relaxed text-card-foreground md:text-2xl">
              Hôm nay là một ngày đặc biệt! Bạn có muốn bật một bản nhạc chúc mừng sinh nhật không?
            </h1>
            <div className="mt-8 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => answer(true)}
                className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:brightness-110"
              >
                Có 🎶
              </button>
              <button
                type="button"
                onClick={() => answer(false)}
                className="rounded-full border border-border bg-secondary px-8 py-3 font-semibold text-secondary-foreground transition-all hover:scale-105 hover:bg-secondary/70"
              >
                Không
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Stage 2: The Revelation ---------- */}
      {stage === "revelation" && (
        <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <canvas ref={fireworksRef} className="pointer-events-none fixed inset-0 h-full w-full" aria-hidden />
          <Balloons />
          <Confetti />
          <h1 className="font-display relative z-10 max-w-4xl text-4xl leading-tight text-primary drop-shadow-[0_0_24px_color-mix(in_oklab,var(--gold)_45%,transparent)] md:text-6xl">
            {HEADLINE.slice(0, typed)}
            <span className="caret" aria-hidden />
          </h1>
          {showMessage && (
            <div className="rise-in relative z-10 mt-10 max-w-xl space-y-4">
              <p className="text-lg leading-relaxed text-foreground/90 md:text-xl">
                Chúc {NAME} một tuổi mới thật nhiều sức khỏe, niềm vui và may mắn.
                Mong rằng mọi điều tốt đẹp nhất sẽ luôn đến với bạn — hôm nay, ngày mai và mãi mãi. 💖
              </p>
              <p className="text-muted-foreground">
                Cảm ơn bạn vì đã luôn tỏa sáng theo cách rất riêng của mình.
              </p>
              <button
                type="button"
                onClick={() => setStage("celebration")}
                className="mt-6 rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:brightness-110"
              >
                Đến phần thổi nến nào 🎂
              </button>
            </div>
          )}
        </section>
      )}

      {/* ---------- Stage 3: The Celebration ---------- */}
      {stage === "celebration" && (
        <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
          {wishSent && <canvas ref={fireworksRef} className="pointer-events-none fixed inset-0 h-full w-full" aria-hidden />}
          <h2 className="font-display rise-in text-3xl text-primary md:text-4xl">
            {blown ? "Chúc mừng! Nến đã tắt 🎉" : "Hãy nhắm mắt và ước một điều nhé"}
          </h2>
          <div className="rise-in mt-8">
            <Cake blown={blown} />
          </div>

          {!wishSent ? (
            <form
              className="rise-in mt-8 flex w-full max-w-md flex-col items-center gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                sendWish();
              }}
            >
              <input
                type="text"
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                placeholder="Ước một điều nào!"
                maxLength={120}
                className="w-full rounded-full border border-border bg-card/80 px-6 py-3 text-center text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                aria-label="Nhập điều ước của bạn"
              />
              <button
                type="submit"
                disabled={!wish.trim()}
                className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Gửi điều ước 💫
              </button>
            </form>
          ) : (
            <div className="rise-in mt-8 max-w-xl space-y-6">
              <p className="text-xl font-medium text-foreground">
                Điều ước của bạn đã được gửi đến vũ trụ! ✨
              </p>
              {/* falling petals */}
              <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
                {Array.from({ length: 24 }, (_, i) => (
                  <span
                    key={i}
                    className="petal"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2.5}s`,
                      animationDuration: `${4 + Math.random() * 4}s`,
                    }}
                  />
                ))}
              </div>
              <div className="rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-sm">
                <p className="font-display text-lg italic leading-relaxed text-card-foreground">
                  “Tuổi mới không chỉ là thêm một con số, mà là thêm một chặng đường để hạnh phúc.
                  Chúc {NAME} luôn cười thật tươi, sống thật rực rỡ và được yêu thương thật nhiều.”
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Sinh nhật vui vẻ nhé, {NAME}! 🎈</p>
              <button
                type="button"
                onClick={enterLetter}
                className="letter-invitation mt-4 border-b border-primary/50 pb-1 font-display text-lg text-primary transition-colors hover:border-primary hover:text-foreground"
              >
                Vẫn còn một điều cuối cùng dành cho Phượng
                <span className="ml-2" aria-hidden>→</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* ---------- Stage 4: The Letter ---------- */}
      {stage === "letter" && (
        <section className="letter-scene relative z-10 flex min-h-screen flex-col items-center justify-center px-5 py-14 text-center">
          {!letterOpen ? (
            <div className="letter-arrival flex flex-col items-center">
              <p className="mb-8 font-display text-lg text-letter-muted">Có những điều nên được nói thật chậm.</p>
              <button
                type="button"
                onClick={() => setLetterOpen(true)}
                className="envelope group relative block h-48 w-72 cursor-pointer border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-letter-accent sm:h-56 sm:w-80"
                aria-label="Mở phong bì"
              >
                <span className="envelope-back absolute inset-x-0 bottom-0 h-[72%]" />
                <span className="envelope-letter-peek absolute inset-x-8 bottom-5 h-32" />
                <span className="envelope-flap absolute inset-x-0 top-[28%] h-[45%] origin-top transition-transform duration-700 group-hover:-translate-y-1" />
                <span className="wax-seal absolute left-1/2 top-[58%] z-20 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-display text-xl text-letter-cream shadow-lg">P</span>
              </button>
              <p className="mt-7 text-sm text-letter-muted">Chạm vào niêm sáp để mở thư</p>
            </div>
          ) : (
            <article className="letter-paper letter-unfold relative w-full max-w-2xl px-7 py-10 text-left sm:px-14 sm:py-14">
              <div className="paper-fold paper-fold-vertical" aria-hidden />
              <div className="paper-fold paper-fold-horizontal" aria-hidden />
              <p className="handwritten letter-line letter-line-one text-xl sm:text-2xl">Phượng thân mến,</p>
              <p className="handwritten letter-line letter-line-two mt-6 text-lg leading-8 sm:text-xl sm:leading-9">
                Có thể hôm nay sẽ có rất nhiều lời chúc dành cho Phượng. Nhưng mình vẫn mong lá thư nhỏ này sẽ là một khoảng lặng — để Phượng biết rằng sự hiện diện của Phượng luôn là một điều rất đáng quý.
              </p>
              <p className="handwritten letter-line letter-line-three mt-5 text-lg leading-8 sm:text-xl sm:leading-9">
                Mong tuổi mới không bắt Phượng phải trở thành một ai khác. Chỉ mong Phượng vẫn dịu dàng với chính mình, vẫn can đảm đi về phía điều mình yêu, và luôn có người ở bên trong cả những ngày rực rỡ lẫn những ngày chẳng dễ dàng.
              </p>
              <p className="handwritten letter-line letter-line-four mt-5 text-lg leading-8 sm:text-xl sm:leading-9">
                Cảm ơn Phượng vì đã có mặt trên đời. Chúc cho điều ước vừa gửi đi sẽ tìm được đường quay về — dưới hình hài đẹp nhất.
              </p>
              <p className="handwritten letter-line letter-signature mt-8 text-right text-xl sm:text-2xl">
                Sinh nhật thật bình yên nhé.<br />
                <span className="text-base">— Một người luôn mong Phượng hạnh phúc</span>
              </p>
              <figure className="polaroid-drop mt-10 ml-auto w-40 rotate-3 bg-letter-photo p-2 pb-7 shadow-xl sm:absolute sm:-right-8 sm:bottom-8 sm:mt-0 sm:w-44">
                <div className="flex aspect-square items-center justify-center border border-letter-line bg-letter-placeholder px-3 text-center text-xs text-letter-muted">
                  Ảnh kỷ niệm<br />của chúng mình
                </div>
                <figcaption className="handwritten mt-2 text-center text-sm text-letter-ink">Một ngày đáng nhớ</figcaption>
                <span className="photo-pin absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full" aria-hidden />
              </figure>
            </article>
          )}
        </section>
      )}
    </main>
  );
}
