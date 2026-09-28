import { useCallback, useEffect, useRef, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Cake } from "./Cake";
import { GiftBox } from "./GiftBox";
import { Letter } from "./Letter";
import { NightSky } from "./NightSky";
import { PetalGust, Petals } from "./Petals";
import { PhuongBloomIcon, PhuongBranch } from "./PhuongBranch";
import { BirthdaySong } from "@/lib/birthday-music";

const NAME = "Nguyễn Thị Phượng";
const SHORT_NAME = "Phượng";
const HEADLINE = `CHÚC MỪNG SINH NHẬT ${NAME.toUpperCase()}!`;

type Stage = "unveiling" | "question" | "revelation" | "celebration" | "wishCelebration" | "letter";

/** Các bước trong màn bánh: gõ điều ước → chờ chạm bánh → nến vừa tắt. */
type CakePhase = "writing" | "readyToBlow" | "blowing";

/* ---------------- Fireworks canvas ---------------- */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
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
      const color =
        FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)] ?? "#ffd166";
      const count = 60 + Math.floor(Math.random() * 40);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
        const speed = (2 + Math.random() * 3.5) * dpr;
        particles.push({
          x,
          y,
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
      const w = canvas.width,
        h = canvas.height;
      explode(w * (0.15 + Math.random() * 0.7), h * (0.12 + Math.random() * 0.4));
    };

    launch();
    // pháo hoa bắn dồn 7 giây đầu rồi thưa dần. Phải gán lại vào cùng một biến
    // thì cleanup mới clear được cái đang chạy — trước đây interval thứ hai
    // không ai giữ id nên nó bắn mãi kể cả sau khi component đã unmount.
    let burstInterval = window.setInterval(launch, 650);
    const calmDown = window.setTimeout(() => {
      window.clearInterval(burstInterval);
      burstInterval = window.setInterval(launch, 2600);
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

/* ---------------- Music toggle ---------------- */

function MusicToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={on ? "Tắt nhạc" : "Bật nhạc"}
      aria-pressed={on}
      className="fixed right-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-full border border-border bg-card/70 text-foreground/80 backdrop-blur-md transition-all hover:scale-105 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:right-6 md:top-6"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M11 5 6 9H3v6h3l5 4z" />
        {on ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        ) : (
          <>
            <path d="M22 9l-6 6" />
            <path d="M16 9l6 6" />
          </>
        )}
      </svg>
    </button>
  );
}

/* ---------------- Main experience ---------------- */

export function BirthdayExperience() {
  const [stage, setStage] = useState<Stage>("unveiling");
  const [burst, setBurst] = useState(0);
  const [giftOpening, setGiftOpening] = useState(false);
  const [typed, setTyped] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [wish, setWish] = useState("");
  const [cakePhase, setCakePhase] = useState<CakePhase>("writing");
  const [flash, setFlash] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gust, setGust] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const songRef = useRef<BirthdaySong | null>(null);
  const fireworksRef = useFireworks(stage === "revelation");

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
    if (giftOpening) return;
    setBurst((n) => n + 1);
    setGiftOpening(true);
  }, [giftOpening]);

  useEffect(() => {
    if (!giftOpening) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Chờ nắp và nơ nhấc lên trước khi chuyển sang lời mời bật nhạc.
    const next = window.setTimeout(() => setStage("question"), reduced ? 0 : 1100);
    return () => window.clearTimeout(next);
  }, [giftOpening]);

  const answer = useCallback((withMusic: boolean) => {
    if (withMusic) {
      songRef.current = new BirthdaySong();
      songRef.current.start(true);
      setMusicOn(true);
    }
    setStage("revelation");
  }, []);

  // Nút này bật được cả khi người dùng lỡ chọn "Không" — click là một cử chỉ
  // của người dùng nên trình duyệt cho phép tạo AudioContext ngay tại đây.
  const toggleMusic = useCallback(() => {
    const next = !musicOn;
    if (next) {
      if (songRef.current) {
        songRef.current.setMuted(false);
      } else {
        songRef.current = new BirthdaySong();
        songRef.current.start(true);
      }
    } else {
      songRef.current?.setMuted(true);
    }
    setMusicOn(next);
  }, [musicOn]);

  // Chỉ giữ trạng thái đã gửi; bỏ nội dung riêng tư ngay trong lần cập nhật này.
  const sendWish = useCallback(() => {
    if (cakePhase !== "writing" || !wish.trim()) return;
    setWish("");
    setCakePhase("readyToBlow");
  }, [cakePhase, wish]);

  // Chỉ thổi được sau khi đã gửi điều ước, và chặn click lặp lại.
  const blowCandles = useCallback(() => {
    if (cakePhase !== "readyToBlow") return;
    setCakePhase("blowing");
    setFlash(true);
    setGust(true);
  }, [cakePhase]);

  // Giữ bánh + khói ~1,4s cho người dùng kịp thấy nến tắt, rồi mới dissolve sang màn hoa.
  useEffect(() => {
    if (cakePhase !== "blowing") return;
    const unflash = window.setTimeout(() => setFlash(false), 320);
    const leave = window.setTimeout(() => setLeaving(true), 900);
    const next = window.setTimeout(() => {
      setLeaving(false);
      setStage("wishCelebration");
    }, 1450);
    return () => {
      window.clearTimeout(unflash);
      window.clearTimeout(leave);
      window.clearTimeout(next);
    };
  }, [cakePhase]);

  // Đợt cánh bung chạy xuyên qua lúc chuyển màn; xong thì gỡ khỏi trang.
  useEffect(() => {
    if (!gust) return;
    const t = window.setTimeout(() => setGust(false), 4200);
    return () => window.clearTimeout(t);
  }, [gust]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* bầu trời sao + quầng sáng nền */}
      <NightSky
        calm={stage === "letter"}
        focused={stage === "celebration"}
        dimmed={stage === "celebration"}
      />

      {stage !== "unveiling" && stage !== "question" && (
        <MusicToggle on={musicOn} onToggle={toggleMusic} />
      )}

      {/* ---------- Stage 1: The Unveiling ---------- */}
      {stage === "unveiling" && (
        <section className="gift-scene sky-focus-content relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
          <p className="stationery-eyebrow fade-in">Một chút bất ngờ</p>
          <h1 className="stationery-title fade-in">Có một món quà cho bạn.</h1>
          <p className="stationery-subtitle fade-in">
            Một ngày đặc biệt, dành cho một người đặc biệt.
          </p>
          <button
            type="button"
            onClick={openGift}
            disabled={giftOpening}
            className={`gift-hit ${giftOpening ? "is-open" : ""}`}
            aria-label="Mở hộp quà"
            aria-busy={giftOpening}
          >
            <GiftBox name={SHORT_NAME} />
            <SparkleBurst trigger={burst} />
          </button>
          <p className="stationery-hint fade-in" aria-live="polite">
            {giftOpening ? "Đang mở món quà dành cho bạn…" : "Chạm vào hộp quà để mở"}
          </p>
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
          <canvas
            ref={fireworksRef}
            className="pointer-events-none fixed inset-0 h-full w-full"
            aria-hidden
          />
          <Balloons />
          <Confetti />
          <h1 className="font-display relative z-10 max-w-4xl text-4xl leading-tight text-primary drop-shadow-[0_0_24px_color-mix(in_oklab,var(--gold)_45%,transparent)] md:text-6xl">
            {HEADLINE.slice(0, typed)}
            <span className="caret" aria-hidden />
          </h1>
          {showMessage && (
            <div className="rise-in relative z-10 mt-10 max-w-xl space-y-4">
              <p className="text-lg leading-relaxed text-foreground/90 md:text-xl">
                Chúc {NAME} một tuổi mới thật nhiều sức khỏe, niềm vui và may mắn. Mong rằng mọi
                điều tốt đẹp nhất sẽ luôn đến với bạn — hôm nay, ngày mai và mãi mãi. 💖
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
        <section
          className={`sky-focus-content relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center ${
            leaving ? "stage-leave" : ""
          }`}
        >
          <h2 className="font-display rise-in text-3xl text-primary md:text-4xl">
            {cakePhase === "writing"
              ? "Hãy nhắm mắt và ước một điều nhé"
              : cakePhase === "readyToBlow"
                ? "Điều ước đã sẵn sàng ✨"
                : "Điều ước đã được gửi đi 💫"}
          </h2>

          <div className="rise-in mt-8">
            <Cake
              blown={cakePhase === "blowing"}
              interactive={cakePhase === "readyToBlow"}
              flash={flash}
              onBlow={blowCandles}
            />
          </div>

          {cakePhase === "writing" ? (
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
                autoComplete="off"
                className="w-full rounded-full border border-border bg-card/80 px-6 py-3 text-center text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
                aria-label="Nhập điều ước của bạn"
                aria-describedby="wish-privacy-note"
              />
              <p
                id="wish-privacy-note"
                className="flex max-w-sm items-start justify-center gap-2 text-xs leading-relaxed text-foreground/70"
              >
                <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>Chỉ dành riêng cho bạn — điều ước sẽ được ẩn sau khi gửi.</span>
              </p>
              <button
                type="submit"
                disabled={!wish.trim()}
                className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Gửi điều ước 💫
              </button>
            </form>
          ) : (
            <div className="rise-in mt-8 max-w-md space-y-3">
              <p className="text-foreground/90" role="status">
                Điều ước của bạn đã được giữ kín ✨
              </p>
              {cakePhase === "readyToBlow" && (
                <p className="tap-hint text-lg font-medium text-primary">
                  👆 Chạm vào bánh để thổi tắt nến nhé
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* ---------- Stage 3b: Wish celebration (hoa phượng) ---------- */}
      {stage === "wishCelebration" && (
        <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
          <Petals />
          <PhuongBranch variant="corner" className="phuong-corner" />
          <div className="rise-in relative z-10 max-w-xl space-y-6">
            <PhuongBloomIcon className="mx-auto h-11 w-11" />
            <h2 className="font-display text-3xl leading-snug text-primary md:text-4xl">
              Mong điều ước của {SHORT_NAME} sẽ trở thành hiện thực
            </h2>
            <p className="text-lg text-foreground/85">
              Và mong tuổi mới sẽ luôn rực rỡ như mùa hoa phượng
            </p>
            <div className="rounded-3xl border border-border bg-card/70 p-6 backdrop-blur-sm">
              <p className="font-display text-lg italic leading-relaxed text-card-foreground">
                “Tuổi mới không chỉ là thêm một con số, mà là thêm một chặng đường để hạnh phúc.
                Chúc {NAME} luôn cười thật tươi, sống thật rực rỡ và được yêu thương thật nhiều.”
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStage("letter")}
              className="rounded-full bg-primary px-8 py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:brightness-110"
            >
              Mình còn một điều muốn gửi bạn 💌
            </button>
          </div>
        </section>
      )}

      {gust && <PetalGust />}

      {/* ---------- Stage 4: The Letter ---------- */}
      {stage === "letter" && (
        <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
          <Letter name={SHORT_NAME} />
        </section>
      )}
    </main>
  );
}
