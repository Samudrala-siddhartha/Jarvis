import { useEffect, useRef } from 'react';
import { useVoiceStore, VoiceState } from '../store/voiceStore';

export default function ParticleEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state } = useVoiceStore();
  const particles = useRef<any[]>([]);
  const animationFrame = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles.current = Array.from({ length: 150 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        color: 'rgba(0, 240, 255, 0.4)',
        pulse: Math.random() * Math.PI * 2,
        t: Math.random() * 100
      }));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.current.forEach((p, i) => {
        // State-based behavior
        switch (state) {
          case VoiceState.IDLE:
            p.x += p.vx;
            p.y += p.vy;
            break;
          case VoiceState.WAKE_LISTENING:
            // Pulse towards center
            const dx = canvas.width / 2 - p.x;
            const dy = canvas.height / 2 - p.y;
            p.x += dx * 0.01 + p.vx;
            p.y += dy * 0.01 + p.vy;
            p.color = `rgba(0, 240, 255, ${0.4 + Math.sin(Date.now() / 200) * 0.3})`;
            break;
          case VoiceState.ACTIVE_LISTENING:
            // Wave motion
            p.y += Math.sin(p.x * 0.01 + Date.now() * 0.005) * 2;
            p.x += p.vx * 2;
            p.color = 'rgba(0, 240, 255, 0.8)';
            break;
          case VoiceState.PROCESSING:
            // Orbital neural movement
            const angle = (Date.now() / 1000) + (i * (Math.PI * 2 / particles.current.length));
            const radius = 100 + Math.sin(Date.now() / 500) * 20;
            p.x = canvas.width / 2 + Math.cos(angle) * radius;
            p.y = canvas.height / 2 + Math.sin(angle) * radius;
            p.color = 'rgba(255, 255, 255, 0.6)';
            break;
          case VoiceState.RESPONDING:
            // Explosive sync pulse
            const growth = Math.sin(Date.now() / 100) * 10;
            p.x += p.vx * 5;
            p.y += p.vy * 5;
            p.size = (Math.random() * 3 + 1) + (growth > 0 ? growth : 0);
            p.color = 'rgba(0, 240, 255, 0.5)';
            break;
        }

        // Wrap around
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Draw connections for Idle/Wake
        if (state === VoiceState.IDLE || state === VoiceState.WAKE_LISTENING) {
          particles.current.forEach((p2, j) => {
            if (i === j) return;
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 100) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 * (1 - dist / 100)})`;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          });
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationFrame.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame.current);
    };
  }, [state]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#000' }}
      id="jarvis-particle-canvas"
    />
  );
}
