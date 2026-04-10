import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { BackgroundWaves } from './BackgroundWaves';
import { SacredGeometry } from './SacredGeometry';
import { BreathingCircle } from './BreathingCircle';
import { MEDITATION_SCRIPT, BREATH_CYCLE_DURATION, TOTAL_DURATION, FOCUS_OPTIONS } from '../constants';
import { generatePersonalizedPhrases, generateDailyIntention, AnchoringPhrase } from '../services/geminiService';
import { Sparkles, Send, X } from 'lucide-react';

const MEDITATION_AUDIO_URL = "https://actions.google.com/sounds/v1/ambiences/rain_on_roof.ogg";

export const MeditationPlayer: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [currentScriptIndex, setCurrentScriptIndex] = useState(-1);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  // Audio & Visualizer State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // AI State
  const [focus, setFocus] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [dynamicScript, setDynamicScript] = useState<AnchoringPhrase[]>(MEDITATION_SCRIPT);
  const [dailyIntention, setDailyIntention] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize Audio Context and Analyser
  useEffect(() => {
    if (!audioRef.current) return;

    const initAudio = () => {
      try {
        if (!audioContextRef.current) {
          const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
          audioContextRef.current = new AudioContextClass();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;
          
          sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current!);
          sourceRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
        }
      } catch (err) {
        console.error("Audio initialization failed:", err);
        setAudioError("Visualizer unavailable in this browser.");
      }
    };

    const handlePlay = () => {
      initAudio();
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    const handleError = (e: any) => {
      console.error("Audio element error:", e);
      setAudioError("Unable to load meditation audio. Visuals will continue.");
    };

    audioRef.current.addEventListener('play', handlePlay);
    audioRef.current.addEventListener('error', handleError);
    return () => {
      audioRef.current?.removeEventListener('play', handlePlay);
      audioRef.current?.removeEventListener('error', handleError);
    };
  }, []);

  // Sync audio with isActive state
  useEffect(() => {
    if (isActive) {
      audioRef.current?.play().catch(console.error);
    } else {
      audioRef.current?.pause();
    }
  }, [isActive]);

  // Handle Mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && time < TOTAL_DURATION) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else if (time >= TOTAL_DURATION && !isFinished) {
      setIsFinished(true);
      setIsActive(false);
      handleFinish();
    }
    return () => clearInterval(interval);
  }, [isActive, time, isFinished]);

  const handleFinish = async () => {
    const intention = await generateDailyIntention(focus || 'general peace');
    setDailyIntention(intention);
  };

  // Script synchronization
  useEffect(() => {
    const index = dynamicScript.findIndex((item, i) => {
      const nextItem = dynamicScript[i + 1];
      return time >= item.time && (!nextItem || time < nextItem.time);
    });
    setCurrentScriptIndex(index);
  }, [time, dynamicScript]);

  const handleSetFocus = async (selectedFocus?: string) => {
    const currentFocus = selectedFocus || focus;
    if (!currentFocus.trim()) return;
    setIsGenerating(true);
    const aiPhrases = await generatePersonalizedPhrases(currentFocus);
    
    // Merge AI phrases into the script, avoiding duplicates at same time
    const merged = [...MEDITATION_SCRIPT, ...aiPhrases].sort((a, b) => a.time - b.time);
    setDynamicScript(merged);
    setIsGenerating(false);
    setShowAIPanel(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => setIsActive(!isActive);
  const reset = () => {
    setIsActive(false);
    setTime(0);
    setCurrentScriptIndex(-1);
    setIsFinished(false);
    setDailyIntention(null);
    setDynamicScript(MEDITATION_SCRIPT);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden text-white font-sans selection:bg-amber-500/30">
      <audio 
        ref={audioRef} 
        src={MEDITATION_AUDIO_URL} 
        loop 
        crossOrigin="anonymous"
      />
      
      <BackgroundWaves analyser={analyserRef.current} />
      <SacredGeometry />

      {/* Header / Progress */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-start z-10">
        <div className="flex flex-col">
          <h1 className="text-2xl font-light tracking-[0.3em] uppercase text-amber-200/80">
            Golden Flux
          </h1>
          <p className="text-[10px] tracking-[0.5em] uppercase text-amber-500/40 mt-1">
            AI-Enhanced Meditation
          </p>
        </div>
        <div className="flex flex-col items-end gap-4">
          <div className="text-right">
            <div className="text-sm font-mono tracking-widest text-amber-200/60">
              {formatTime(time)} / {formatTime(TOTAL_DURATION)}
            </div>
            <div className="w-32 h-[1px] bg-white/10 mt-2 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-amber-400/60"
                initial={{ width: 0 }}
                animate={{ width: `${(time / TOTAL_DURATION) * 100}%` }}
              />
            </div>
          </div>
          
          {!isActive && time === 0 && (
            <button 
              onClick={() => setShowAIPanel(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs tracking-widest uppercase hover:bg-amber-500/20 transition-all"
            >
              <Sparkles size={14} />
              Set AI Focus
            </button>
          )}
        </div>
      </div>

      {/* AI Panel Overlay */}
      <AnimatePresence>
        {showAIPanel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-zinc-900/90 border border-amber-500/20 rounded-3xl p-8 relative"
            >
              <button 
                onClick={() => setShowAIPanel(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-amber-400" size={24} />
                <h2 className="text-xl font-light tracking-widest uppercase text-amber-100">AI Meditation Focus</h2>
              </div>
              
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                Choose a focus for your meditation today:
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                {FOCUS_OPTIONS.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setFocus(option);
                      handleSetFocus(option);
                    }}
                    disabled={isGenerating}
                    className={`px-4 py-3 rounded-xl border text-xs tracking-widest uppercase transition-all ${
                      focus === option 
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200' 
                        : 'bg-black/40 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              
              {isGenerating && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-amber-400/60 mt-4 text-center tracking-widest uppercase italic"
                >
                  Gemini is crafting your session...
                </motion.p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-24">
        {audioError && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute -top-48 text-[10px] tracking-widest uppercase text-amber-500/40 bg-black/40 px-4 py-2 rounded-full border border-amber-500/10"
          >
            {audioError}
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          {isFinished ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-2xl px-8"
            >
              <h3 className="text-amber-500/60 text-xs tracking-[0.5em] uppercase mb-4">Daily Intention</h3>
              <p className="text-2xl md:text-3xl font-serif italic text-amber-100 leading-relaxed">
                "{dailyIntention || "..."}"
              </p>
              <button 
                onClick={reset}
                className="mt-12 px-8 py-3 rounded-full border border-amber-500/30 text-amber-200 text-xs tracking-widest uppercase hover:bg-amber-500/20 transition-all"
              >
                Return to Stillness
              </button>
            </motion.div>
          ) : (
            currentScriptIndex !== -1 && (
              <motion.div
                key={currentScriptIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute -top-32 w-full text-center px-6"
              >
                <p className="text-xl md:text-2xl font-serif font-light italic tracking-wide text-amber-100/90 leading-relaxed">
                  {dynamicScript[currentScriptIndex].text}
                </p>
              </motion.div>
            )
          )}
        </AnimatePresence>

        {!isFinished && (
          <BreathingCircle isBreathing={isActive} duration={BREATH_CYCLE_DURATION} />
        )}

        {/* Breathing Phase Indicator */}
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <motion.p
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0.9, 1.1, 0.9]
              }}
              transition={{
                duration: BREATH_CYCLE_DURATION,
                repeat: Infinity,
                times: [0, 0.25, 0.5, 0.75, 1],
                ease: "easeInOut"
              }}
              className="text-[10px] tracking-[1em] uppercase text-amber-400/30 whitespace-nowrap"
            >
              { (time % BREATH_CYCLE_DURATION) < (BREATH_CYCLE_DURATION / 2) ? "Inhale" : "Exhale" }
            </motion.p>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 z-10">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className="p-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-amber-200/60"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <button 
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center hover:bg-amber-500/30 transition-all group"
        >
          {isActive ? (
            <Pause size={28} className="text-amber-200 group-hover:scale-110 transition-transform" />
          ) : (
            <Play size={28} className="text-amber-200 ml-1 group-hover:scale-110 transition-transform" />
          )}
        </button>

        <button 
          onClick={reset}
          className="p-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-amber-200/60"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Vignette Overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
};
