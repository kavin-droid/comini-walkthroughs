const PIECE_COLORS = ["#e0577a", "#3ea0d8", "#f2a93b", "#5bab6a", "#9b6fd1"];
const PIECE_COUNT = 18;
/** Deterministic pseudo-scatter (not Math.random) so the burst looks lively without re-rolling on
 * every re-render - each piece's x/delay/rotation is just a function of its own index. */
const PIECES = Array.from({ length: PIECE_COUNT }).map((_, i) => ({
  left: `${(i * 53.7) % 100}%`,
  delayMs: (i * 71) % 500,
  color: PIECE_COLORS[i % PIECE_COLORS.length],
  size: 8 + (i % 3) * 3,
}));

/** A one-shot burst of falling confetti pieces across the top of whatever contains it - the
 * celebratory payoff for the very last step of a walkthrough. The parent needs `position:
 * relative` (or similar) for the burst to anchor to it rather than the viewport. */
export function Confetti() {
  return (
    <div className="absolute inset-x-0 top-0 h-0 pointer-events-none overflow-visible" aria-hidden="true">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-[2px]"
          style={{
            left: p.left,
            top: 0,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confetti-fall 1.4s ease-in ${p.delayMs}ms both`,
          }}
        />
      ))}
    </div>
  );
}
