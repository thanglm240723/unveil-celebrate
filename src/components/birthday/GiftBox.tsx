/** Các lớp nắp, nơ và thân tách riêng để món quà mở như một chiếc hộp thật. */
export function GiftBox({ name }: { name: string }) {
  return (
    <span className="gift-box" aria-hidden>
      <span className="gift-shadow" />
      <span className="gift-light" />
      <span className="gift-body" />
      <span className="gift-band" />
      <span className="gift-lid">
        <span className="gift-tail gift-tail-left" />
        <span className="gift-tail gift-tail-right" />
        <span className="gift-bow">
          <span className="gift-loop gift-loop-left" />
          <span className="gift-loop gift-loop-right" />
          <span className="gift-knot" />
        </span>
      </span>
      <span className="gift-tag">for {name}</span>
    </span>
  );
}
