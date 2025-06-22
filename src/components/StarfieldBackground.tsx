import React, { useEffect, useRef } from "react";

class Star {
  x: number;
  y: number;
  z: number;
  maxZ: number = 2500;
  speed: number;
  size: number;
  brightness: number;
  brightnessSpeed: number;

  constructor() {
    this.x = (Math.random() - 0.5) * 2000;
    this.y = (Math.random() - 0.5) * 2000;
    this.z = Math.random() * this.maxZ;
    this.speed = Math.random() * 1 + 1;
    this.size = Math.random() * 1 + 1;
    this.brightness = Math.random();
    this.brightnessSpeed = Math.random() * 0.01 + 0.01;
  }

  update() {
    this.z -= this.speed;
    if (this.z < 1) {
      this.z = this.maxZ;
      this.x = (Math.random() - 0.5) * 2000;
      this.y = (Math.random() - 0.5) * 2000;
    }
    this.brightness += this.brightnessSpeed;
    if (this.brightness > 1) this.brightness = 0;
  }

  draw(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    const scale = 1000;
    const sx = (this.x / this.z) * scale + canvas.width / 2;
    const sy = (this.y / this.z) * scale + canvas.height / 2;
    const radius = (this.size / this.z) * scale;
    if (sx >= 0 && sx < canvas.width && sy >= 0 && sy < canvas.height) {
      const alpha = Math.sin(this.brightness * Math.PI) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }
  }
}

const StarfieldBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();

    const numStars = 500;
    const stars: Star[] = [];
    for (let i = 0; i < numStars; i++) {
      stars.push(new Star());
    }

    let animationFrameId: number;
    const draw = () => {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const star of stars) {
        star.update();
        star.draw(ctx, canvas);
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      setCanvasSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
};

export default StarfieldBackground;
