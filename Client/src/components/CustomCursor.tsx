'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
  speed: number;
}

export default function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Check if device is desktop
    const checkDevice = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);

    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let mouseX = -100;
    let mouseY = -100;
    let lastMouseX = -100;
    let lastMouseY = -100;
    const ripples: Ripple[] = [];
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Calculate distance from last ripple to prevent too many overlapping ripples
      const dist = Math.hypot(mouseX - lastMouseX, mouseY - lastMouseY);
      if (dist > 8) {
        ripples.push({
          x: mouseX,
          y: mouseY,
          radius: 1,
          maxRadius: hovered ? 45 : 30,
          opacity: 1,
          color: hovered ? '236, 72, 153' : '6, 182, 212', // Pink if hovered, Cyan if default
          speed: 1.0,
        });
        lastMouseX = mouseX;
        lastMouseY = mouseY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Track interactive hovers
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('a, button, [role="button"], input, textarea, select, .project-card, .info-card');
      setHovered(!!isInteractive);
    };
    document.addEventListener('mouseover', handleMouseOver);

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw and update ripples
      ripples.forEach((ripple, index) => {
        ripple.radius += ripple.speed;
        ripple.opacity -= 0.02; // Fades out

        if (ripple.opacity <= 0) {
          ripples.splice(index, 1);
          return;
        }

        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ripple.color}, ${ripple.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw current mouse pointer dot (precise target)
      if (mouseX >= 0 && mouseY >= 0) {
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, hovered ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = hovered ? 'rgb(236, 72, 153)' : 'rgb(6, 182, 212)';
        ctx.shadowBlur = hovered ? 12 : 6;
        ctx.shadowColor = hovered ? 'rgba(236, 72, 153, 0.8)' : 'rgba(6, 182, 212, 0.8)';
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, hovered]);

  if (isMobile) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
