"use client";

import { useEffect, useRef } from "react";

export function AnimatedGradientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let mouseX = 0.5;
    let mouseY = 0.4;
    let targetX = 0.5;
    let targetY = 0.4;
    let raf = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    function resize() {
      const canvasEl = canvasRef.current;
      if (!canvasEl) return;
      width = canvasEl.clientWidth;
      height = canvasEl.clientHeight;
      canvasEl.width = width * dpr;
      canvasEl.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function onPointerMove(e: PointerEvent) {
      targetX = e.clientX / window.innerWidth;
      targetY = e.clientY / window.innerHeight;
    }
    window.addEventListener("pointermove", onPointerMove);

    const blobs = [
      { baseX: 0.2, baseY: 0.3, r: 0.28, color: "#E3A542", speed: 0.4, phase: 0 },
      { baseX: 0.75, baseY: 0.25, r: 0.32, color: "#3FB6A8", speed: 0.35, phase: 2 },
      { baseX: 0.5, baseY: 0.75, r: 0.24, color: "#E3A542", speed: 0.5, phase: 4 },
    ];

    let t = 0;
    function draw() {
      t += 0.006;
      mouseX += (targetX - mouseX) * 0.02;
      mouseY += (targetY - mouseY) * 0.02;

      ctx!.clearRect(0, 0, width, height);

      for (const b of blobs) {
        const driftX = Math.sin(t * b.speed + b.phase) * 0.04 + (mouseX - 0.5) * 0.06;
        const driftY = Math.cos(t * b.speed + b.phase) * 0.04 + (mouseY - 0.5) * 0.06;
        const cx = (b.baseX + driftX) * width;
        const cy = (b.baseY + driftY) * height;
        const r = b.r * Math.max(width, height);

        const gradient = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
        gradient.addColorStop(0, `${b.color}33`);
        gradient.addColorStop(1, `${b.color}00`);
        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(cx, cy, r, 0, Math.PI * 2);
        ctx!.fill();
      }

      raf = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
