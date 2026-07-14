// Deterministic QR-like visual placeholder.
// Not a real scannable QR — renders a structured pattern from the input value.
// Replace with a real QR library (e.g. qrcode.react) when wiring the backend.

interface QrDisplayProps {
  value: string;
  size?: number;
}

export function QrDisplay({ value, size = 160 }: QrDisplayProps) {
  const n = 21; // grid modules

  // Simple hash for determinism
  let seed = 0;
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  }

  const pseudo = (x: number) => {
    seed = ((seed * 1664525 + 1013904223) >>> 0);
    return (seed ^ x) & 1;
  };

  const isFinderDark = (r: number, c: number, or_: number, oc: number): boolean => {
    const lr = r - or_, lc = c - oc;
    if (lr < 0 || lr > 6 || lc < 0 || lc > 6) return false;
    return lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
  };

  const rects: { x: number; y: number }[] = [];

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      let dark = false;

      // Finder patterns
      if (r < 7 && c < 7) dark = isFinderDark(r, c, 0, 0);
      else if (r < 7 && c > n - 8) dark = isFinderDark(r, c, 0, n - 7);
      else if (r > n - 8 && c < 7) dark = isFinderDark(r, c, n - 7, 0);
      // Timing
      else if (r === 6 && c >= 8 && c <= n - 9) dark = (c % 2) === 0;
      else if (c === 6 && r >= 8 && r <= n - 9) dark = (r % 2) === 0;
      // Data
      else dark = pseudo(r * n + c) === 1;

      if (dark) rects.push({ x: c, y: r });
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${n} ${n}`}
      shapeRendering="crispEdges"
    >
      <rect width={n} height={n} fill="white" />
      {rects.map(({ x, y }, i) => (
        <rect key={i} x={x} y={y} width={1} height={1} fill="#111" />
      ))}
    </svg>
  );
}
