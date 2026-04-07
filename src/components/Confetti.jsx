import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

export default function Confetti({ score }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (score >= 85 && !firedRef.current) {
      firedRef.current = true;

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { x: 0.5, y: 0.55 },
        colors: ['#7c3aed', '#2563eb', '#06b6d4', '#10b981', '#f59e0b'],
        zIndex: 9999,
      });

      setTimeout(() => {
        confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors: ['#7c3aed', '#a855f7'], zIndex: 9999 });
        confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: ['#2563eb', '#60a5fa'], zIndex: 9999 });
      }, 300);

      setTimeout(() => {
        confetti({ particleCount: 80, spread: 100, origin: { x: 0.5, y: 0.4 }, gravity: 0.7, scalar: 1.2, zIndex: 9999 });
      }, 700);
    }
  }, [score]);

  return null;
}
