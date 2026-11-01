import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioMessagePlayerProps {
  audioUrl: string;
  durationSeconds?: number;
  isSender?: boolean;
}

export const AudioMessagePlayer: React.FC<AudioMessagePlayerProps> = ({
  audioUrl,
  durationSeconds = 0,
  isSender = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(durationSeconds);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(Math.round(audio.currentTime));
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Audio play error:', e);
      });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2.5 p-2 rounded-xl min-w-[200px] max-w-[280px] ${
      isSender ? 'text-white' : 'text-stone-800'
    }`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition shadow-sm ${
          isSender 
            ? 'bg-white text-emerald-800 hover:bg-emerald-50' 
            : 'bg-emerald-700 text-white hover:bg-emerald-800'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform graphic */}
      <div className="flex-1 flex flex-col justify-center gap-1">
        <div className="flex items-center gap-0.5 h-6">
          {[35, 60, 40, 85, 50, 70, 95, 45, 65, 80, 55, 90, 40, 75, 50].map((heightPct, idx) => {
            const playedRatio = totalDuration > 0 ? currentTime / totalDuration : 0;
            const barRatio = idx / 15;
            const isFilled = barRatio <= playedRatio;

            return (
              <span
                key={idx}
                className={`w-1 rounded-full transition-all ${
                  isSender
                    ? isFilled ? 'bg-white' : 'bg-emerald-300/60'
                    : isFilled ? 'bg-emerald-700' : 'bg-stone-300'
                } ${isPlaying && isFilled ? 'animate-pulse' : ''}`}
                style={{ height: `${heightPct}%` }}
              />
            );
          })}
        </div>

        {/* Timestamps */}
        <div className="flex items-center justify-between text-[11px] font-medium opacity-90 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span className="flex items-center gap-1">
            <Volume2 className="w-3 h-3 inline" />
            {formatTime(totalDuration || durationSeconds)}
          </span>
        </div>
      </div>
    </div>
  );
};
