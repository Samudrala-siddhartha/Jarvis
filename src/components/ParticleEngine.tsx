import { useEffect, useRef } from 'react';
import { useVoiceStore, VoiceState, Mood } from '../store/voiceStore';

export default function ParticleEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, mood } = useVoiceStore();
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
      particles.current = Array.from({ length: 180 }, (_, i) => {
        // Create 3 distinct concentric rings
        const ring = i % 3;
        const baseRadius = 100 + ring * 100;
        const angle = Math.random() * Math.PI * 2;
        return {
          x: canvas.width / 2 + Math.cos(angle) * baseRadius,
          y: canvas.height / 2 + Math.sin(angle) * baseRadius,
          vx: 0,
          vy: 0,
          size: ring === 0 ? 3 : ring === 1 ? 2 : 1,
          color: 'rgba(0, 180, 255, 0.4)',
          angle: angle,
          radius: baseRadius,
          baseRadius: baseRadius,
          speed: (0.0005 + Math.random() * 0.0015) * (ring === 0 ? 1 : ring === 1 ? -1 : 0.5),
          ring: ring
        };
      });
    };

    const mouse = { x: 0, y: 0, active: false, pulse: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleClick = () => {
      mouse.pulse = 1;
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (mouse.pulse > 0) mouse.pulse -= 0.02;

      particles.current.forEach((p, i) => {
        let baseColor = '0, 180, 255'; 
        if (mood === Mood.ALERT) baseColor = '0, 80, 255'; 
        if (mood === Mood.SUCCESS) baseColor = '0, 255, 180'; 
        if (mood === Mood.THINKING) baseColor = '150, 100, 255'; 

        // Orbital Rotation
        p.angle += p.speed;
        
        // Add some "breathing" effect to radii
        const breathing = Math.sin(Date.now() * 0.001 + p.ring) * 10;
        const targetRadius = p.baseRadius + breathing + (mouse.pulse * 100);
        
        const tx = canvas.width / 2 + Math.cos(p.angle) * targetRadius;
        const ty = canvas.height / 2 + Math.sin(p.angle) * targetRadius;

        // Smooth transition to target
        p.x += (tx - p.x) * 0.05;
        p.y += (ty - p.y) * 0.05;

        // Mouse Interactivity
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 200) {
            const force = (200 - dist) / 200;
            p.x -= dx * force * 0.2;
            p.y -= dy * force * 0.2;
          }
        }

        // State behavior
        switch (state) {
          case VoiceState.ACTIVE_LISTENING:
            p.x += (Math.random() - 0.5) * 5;
            p.y += (Math.random() - 0.5) * 5;
            p.color = `rgba(${baseColor}, 0.9)`;
            break;
          case VoiceState.PROCESSING:
            p.angle += p.speed * 5;
            p.color = `rgba(255, 255, 255, 0.8)`;
            break;
          case VoiceState.RESPONDING:
            const pulse = Math.sin(Date.now() * 0.1) * 20;
            p.radius = p.baseRadius + pulse;
            p.color = `rgba(${baseColor}, 0.7)`;
            break;
        }

        // Draw mesh connections for the innermost ring
        if (p.ring === 0) {
          particles.current.forEach((p2, j) => {
            if (i >= j || p2.ring !== 0) return;
            const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
            if (dist < 120) {
              ctx.beginPath();
              ctx.strokeStyle = `rgba(${baseColor}, ${0.15 * (1 - dist / 120)})`;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          });
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size + (mouse.pulse * 2), 0, Math.PI * 2);
        ctx.fillStyle = p.color || `rgba(${baseColor}, 0.5)`;
        ctx.fill();
      });

      animationFrame.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    resize();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
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
