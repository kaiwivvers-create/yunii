/**
 * Soft pastel bubbles that gently rise up the screen on every page.
 * Purely decorative: pointer-events-none, rendered below the navbar
 * and modals so it never blocks or covers interactive UI.
 */
const bubbles = [
  { size: 56, left: '4%', delay: '0s', duration: '15s', color: '#C3B1E1', opacity: 0.42, drift: '28px' },
  { size: 22, left: '10%', delay: '3s', duration: '12s', color: '#FFB3C6', opacity: 0.5, drift: '-18px' },
  { size: 40, left: '18%', delay: '6s', duration: '18s', color: '#A8E6CF', opacity: 0.4, drift: '22px' },
  { size: 16, left: '25%', delay: '1.5s', duration: '11s', color: '#A0D8EF', opacity: 0.55, drift: '-14px' },
  { size: 64, left: '33%', delay: '8s', duration: '20s', color: '#9370DB', opacity: 0.3, drift: '34px' },
  { size: 28, left: '41%', delay: '4.5s', duration: '14s', color: '#FFDAB9', opacity: 0.42, drift: '-24px' },
  { size: 48, left: '49%', delay: '10s', duration: '17s', color: '#C3B1E1', opacity: 0.38, drift: '20px' },
  { size: 18, left: '56%', delay: '2s', duration: '13s', color: '#FFB3C6', opacity: 0.52, drift: '16px' },
  { size: 34, left: '63%', delay: '7s', duration: '16s', color: '#A8E6CF', opacity: 0.42, drift: '-20px' },
  { size: 52, left: '70%', delay: '0.8s', duration: '19s', color: '#A0D8EF', opacity: 0.38, drift: '26px' },
  { size: 20, left: '78%', delay: '5.5s', duration: '12s', color: '#9370DB', opacity: 0.34, drift: '-16px' },
  { size: 44, left: '85%', delay: '9s', duration: '15s', color: '#FFDAB9', opacity: 0.4, drift: '18px' },
  { size: 26, left: '92%', delay: '3.5s', duration: '13s', color: '#C3B1E1', opacity: 0.45, drift: '-22px' },
];

export default function FloatingBubbles() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-30 pointer-events-none overflow-hidden"
    >
      {bubbles.map((bubble, index) => (
        <span
          key={index}
          className="bubble"
          style={
            {
              width: bubble.size,
              height: bubble.size,
              left: bubble.left,
              bottom: -bubble.size * 1.5,
              backgroundColor: bubble.color,
              '--bubble-o': bubble.opacity,
              '--drift': bubble.drift,
              '--rise-duration': bubble.duration,
              '--rise-delay': bubble.delay,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
