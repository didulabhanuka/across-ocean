"use client";

import { useEffect, useRef, useState } from "react";
import { MotionValue, useMotionValueEvent } from "framer-motion";
import { clamp } from "../lib/geo";

export default function OceanShimmer({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [intensity, setIntensity] = useState(0.25);

  useMotionValueEvent(progress, "change", (v) => {
    // more shimmer as user scrolls deeper
    setIntensity(clamp(0.2 + v * 0.9, 0.2, 1));
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0, dpr = 1;
    let t = 0;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: 0.55 + Math.random() * 0.45,
      s: 0.2 + Math.random() * 0.9,
      a: 0.12 + Math.random() * 0.25,
      d: Math.random() * Math.PI * 2,
    }));

    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, w, h);

      // soft ocean gradient at bottom half
      const g = ctx.createLinearGradient(0, h * 0.45, 0, h);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(10,14,35,${0.55 * intensity})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // wave shimmer lines
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 5; i++) {
        const y = h * (0.62 + i * 0.06);
        ctx.beginPath();
        for (let x = 0; x <= w; x += 14) {
          const amp = (10 + i * 6) * intensity;
          const yy = y + Math.sin(t * (1.2 + i * 0.25) + x * 0.01) * amp;
          if (x === 0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.025 + intensity * 0.03})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // particles (sparkles)
      for (const p of particles) {
        p.d += 0.002 + p.s * 0.002;
        const px = p.x * w + Math.sin(p.d + t) * (18 * intensity);
        const py = p.y * h + Math.cos(p.d + t * 1.2) * (12 * intensity);

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,0,90,${p.a * intensity * 0.55})`;
        ctx.arc(px, py, 1.2 + p.s * 0.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${p.a * intensity * 0.35})`;
        ctx.arc(px + 6, py - 4, 0.9 + p.s * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ opacity: 0.95 }}
    />
  );
}
