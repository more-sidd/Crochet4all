interface Props {
  size?: number;
  className?: string;
  color?: string;
}

// A little 4-point pixel sparkle, drawn on a 7x7 pixel grid.
const CELLS: [number, number][] = [
  [3, 0], [3, 1],
  [2, 2], [3, 2], [4, 2],
  [0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
  [2, 4], [3, 4], [4, 4],
  [3, 5], [3, 6],
];

export default function PixelSparkle({ size = 18, className = '', color = 'currentColor' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 7 7"
      className={className}
      style={{ shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {CELLS.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={1} height={1} fill={color} />
      ))}
    </svg>
  );
}
