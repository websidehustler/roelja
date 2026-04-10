import React, { useEffect, useRef } from 'react';

interface BackgroundWavesProps {
  analyser: AnalyserNode | null;
}

export const BackgroundWaves: React.FC<BackgroundWavesProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      time += 0.005;
      
      let audioIntensity = 0;
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        // Calculate average intensity from low-mid frequencies
        const relevantData = dataArray.slice(0, 20);
        const sum = relevantData.reduce((a, b) => a + b, 0);
        audioIntensity = sum / relevantData.length / 255;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep obsidian background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waves
      const waves = 3;
      for (let i = 0; i < waves; i++) {
        ctx.beginPath();
        ctx.lineWidth = 2 + (audioIntensity * 2);
        ctx.strokeStyle = `rgba(212, 175, 55, ${0.1 + (i * 0.05) + (audioIntensity * 0.2)})`; // Gold color reacting to intensity

        const yOffset = canvas.height / 2;
        const baseAmplitude = 50 + (i * 20);
        const amplitude = baseAmplitude + (audioIntensity * 100); // Reacting to audio
        const frequency = 0.002 + (i * 0.001) + (audioIntensity * 0.002);

        ctx.moveTo(0, yOffset);

        for (let x = 0; x < canvas.width; x += 5) {
          const y = yOffset + Math.sin(x * frequency + time + (i * Math.PI / 2)) * amplitude * Math.cos(time * 0.5);
          ctx.lineTo(x, y);
        }

        ctx.stroke();
      }

      // Add a soft glow in the center that reacts to audio
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, (canvas.width / 2) * (1 + audioIntensity * 0.2)
      );
      gradient.addColorStop(0, `rgba(212, 175, 55, ${0.05 + audioIntensity * 0.1})`);
      gradient.addColorStop(1, 'rgba(5, 5, 5, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-full h-full"
      style={{ filter: 'blur(2px)' }}
    />
  );
};
