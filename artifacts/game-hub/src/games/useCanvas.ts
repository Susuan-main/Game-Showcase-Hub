import { useRef, useEffect } from "react";

export function useCanvas(
  draw: (ctx: CanvasRenderingContext2D, dt: number) => void,
  setup?: (canvas: HTMLCanvasElement) => (() => void) | void,
  deps: unknown[] = []
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let cleanup: (() => void) | void;
    if (setup) cleanup = setup(canvas);

    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      draw(ctx, dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return canvasRef;
}
