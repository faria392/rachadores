import { useEffect, useRef } from 'react';

/**
 * Hook para gerenciar som de vitória com Web Audio API
 * Toca uma melodia quando chamado
 */
function useVictorySound() {
  const audioContextRef = useRef(null);
  const isPlayingRef = useRef(false);

  const initializeAudioContext = () => {
    if (audioContextRef.current) return;
    
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Resume context se estiver suspenso
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
    } catch (e) {
      console.warn('Web Audio API não disponível:', e);
    }
  };

  // Inicializar AudioContext apenas após primeiro clique do usuário
  useEffect(() => {
    const handleUserInteraction = () => {
      initializeAudioContext();
      document.removeEventListener('click', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    return () => document.removeEventListener('click', handleUserInteraction);
  }, []);

  const play = () => {
    try {
      if (isPlayingRef.current || !audioContextRef.current) return;
      
      isPlayingRef.current = true;
      const ctx = audioContextRef.current;
      const now = ctx.currentTime;

      // Melodia de vitória: C5 E5 G5 C6 com variação
      const notes = [
        { freq: 523.25, duration: 0.1, delay: 0 },    // C5
        { freq: 659.25, duration: 0.1, delay: 0.12 },  // E5
        { freq: 783.99, duration: 0.15, delay: 0.24 }, // G5
        { freq: 1046.50, duration: 0.3, delay: 0.41 }  // C6 (longa)
      ];

      notes.forEach(({ freq, duration, delay }) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.frequency.value = freq;
          osc.type = 'sine';
          
          const startTime = now + delay;
          gain.gain.setValueAtTime(0.15, startTime);
          gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
          
          osc.start(startTime);
          osc.stop(startTime + duration);
        } catch (e) {
          console.error('Erro ao criar oscilador:', e);
        }
      });

      // Resetar flag após a melodia terminar
      setTimeout(() => {
        isPlayingRef.current = false;
      }, 1000);
    } catch (err) {
      console.warn('Erro ao tocar som de vitória:', err);
      isPlayingRef.current = false;
    }
  };

  return { play };
}

export default useVictorySound;
