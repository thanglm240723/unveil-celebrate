interface CakeProps {
  blown: boolean;
  /** Chỉ bật sau khi người dùng đã gửi điều ước, tránh bấm nhầm khi đang gõ. */
  interactive?: boolean;
  /** Nhịp tối nhẹ quanh bánh ngay lúc nến vừa tắt. */
  flash?: boolean;
  onBlow?: () => void;
}

export function Cake({ blown, interactive = false, flash = false, onBlow }: CakeProps) {
  const candles = [
    { x: 110, y: 118 },
    { x: 150, y: 108 },
    { x: 190, y: 118 },
  ];

  const handleActivate = () => {
    if (!interactive) return;
    onBlow?.();
  };

  return (
    <div
      className={["cake-hit", interactive ? "is-ready" : "", flash ? "is-blowing" : ""]
        .filter(Boolean)
        .join(" ")}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? "Chạm vào bánh để thổi tắt nến" : undefined}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (!interactive) return;
        // Space cuộn trang nếu không chặn, nên preventDefault trước khi kích hoạt
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          handleActivate();
        }
      }}
    >
      <svg
        viewBox="0 0 300 300"
        className="h-auto w-64 drop-shadow-[0_18px_40px_color-mix(in_oklab,var(--gold)_25%,transparent)] md:w-80"
        role="img"
        aria-label="Bánh sinh nhật với nến lung linh"
      >
        <defs>
          <linearGradient id="plate" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.75 0.1 85)" />
            <stop offset="50%" stopColor="oklch(0.88 0.12 90)" />
            <stop offset="100%" stopColor="oklch(0.72 0.1 85)" />
          </linearGradient>
          <linearGradient id="tier1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.82 0.09 350)" />
            <stop offset="100%" stopColor="oklch(0.7 0.13 350)" />
          </linearGradient>
          <linearGradient id="tier2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.93 0.05 340)" />
            <stop offset="100%" stopColor="oklch(0.85 0.08 345)" />
          </linearGradient>
          <radialGradient id="flame" cx="0.5" cy="0.35" r="0.65">
            <stop offset="0%" stopColor="oklch(0.97 0.1 100)" />
            <stop offset="55%" stopColor="oklch(0.85 0.18 80)" />
            <stop offset="100%" stopColor="oklch(0.68 0.2 45)" />
          </radialGradient>
        </defs>

        {/* plate */}
        <ellipse cx="150" cy="262" rx="128" ry="16" fill="url(#plate)" opacity="0.9" />
        <ellipse cx="150" cy="258" rx="118" ry="13" fill="oklch(0.95 0.06 90)" />

        {/* bottom tier */}
        <rect x="52" y="200" width="196" height="58" rx="10" fill="url(#tier1)" />
        {/* drip icing bottom */}
        <path
          d="M52 208 q12 22 24 0 q12 22 24 0 q12 22 24 0 q12 22 24 0 q12 22 24 0 q12 22 24 0 q12 22 24 0 q12 22 24 0 v-8 a10 10 0 0 0 -10 -10 h-176 a10 10 0 0 0 -10 10 z"
          fill="oklch(0.94 0.05 340)"
        />
        {/* sprinkles bottom */}
        {[
          [80, 232],
          [110, 244],
          [140, 230],
          [170, 246],
          [200, 232],
          [225, 244],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="3"
            fill={i % 2 ? "oklch(0.8 0.15 200)" : "oklch(0.85 0.16 85)"}
          />
        ))}

        {/* top tier */}
        <rect x="82" y="146" width="136" height="58" rx="9" fill="url(#tier2)" />
        <path
          d="M82 154 q11 20 22.6 0 q11 20 22.6 0 q11 20 22.6 0 q11 20 22.6 0 q11 20 22.6 0 q11 20 22.6 0 v-8 a9 9 0 0 0 -9 -9 h-118 a9 9 0 0 0 -9 9 z"
          fill="oklch(0.78 0.12 350)"
        />
        {[
          [105, 180],
          [132, 190],
          [160, 178],
          [185, 190],
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r="2.6"
            fill={i % 2 ? "oklch(0.75 0.15 290)" : "oklch(0.85 0.16 85)"}
          />
        ))}

        {/* candles + flames */}
        {candles.map(({ x, y }, i) => (
          <g key={i}>
            <rect
              x={x - 4}
              y={y}
              width="8"
              height="30"
              rx="3"
              fill={i === 1 ? "oklch(0.8 0.15 200)" : "oklch(0.85 0.14 85)"}
            />
            <rect
              x={x - 4}
              y={y + 7}
              width="8"
              height="3"
              fill="oklch(0.94 0.04 90)"
              opacity="0.8"
            />
            <rect
              x={x - 4}
              y={y + 16}
              width="8"
              height="3"
              fill="oklch(0.94 0.04 90)"
              opacity="0.8"
            />
            <line x1={x} y1={y} x2={x} y2={y - 6} stroke="oklch(0.4 0.05 60)" strokeWidth="2" />
            {!blown ? (
              <g
                className="flame"
                style={{ transformOrigin: `${x}px ${y - 6}px`, animationDelay: `${i * 0.22}s` }}
              >
                <ellipse cx={x} cy={y - 16} rx="5.5" ry="10" fill="url(#flame)" />
                <ellipse cx={x} cy={y - 13} rx="2.4" ry="4.5" fill="oklch(0.98 0.06 105)" />
                <circle
                  cx={x}
                  cy={y - 14}
                  r="16"
                  fill="oklch(0.85 0.18 85)"
                  opacity="0.16"
                  className="flame-glow"
                />
              </g>
            ) : (
              <path
                d={`M${x} ${y - 8} q4 -10 -2 -18 q8 4 6 14`}
                fill="none"
                stroke="oklch(0.75 0.02 260)"
                strokeWidth="2"
                strokeLinecap="round"
                className="smoke"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
