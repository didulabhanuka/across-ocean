"use client";

import { useEffect, useRef } from "react";
import { clamp } from "../lib/geo";

export default function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0, dpr = 1;

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

    const stars = Array.from({ length: 230 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.6 + 0.25,
      tw: Math.random() * 0.016 + 0.006,
    }));

    resize();
    window.addEventListener("resize", resize);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      const g = ctx.createRadialGradient(w * 0.5, h * 0.15, 0, w * 0.5, h * 0.15, Math.max(w, h) * 0.95);
      g.addColorStop(0, "rgba(255,0,90,0.11)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      for (const s of stars) {
        s.a += s.tw * (Math.random() > 0.5 ? 1 : -1);
        s.a = clamp(s.a, 0.15, 0.95);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      window.removeEventListener("resize", resize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-20 opacity-90" />;
}
