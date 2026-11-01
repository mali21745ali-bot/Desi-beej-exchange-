import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onSendVoice: (audioBase64: string, durationSeconds: number) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSendVoice, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopCleanup();
    };
  }, []);

  const stopCleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      } catch (e) {
        // Safe ignore
      }
    }
  };

  const startRecording = async () => {
    try {
      setPermissionError(null);
      audioChunksRef.current = [];
      setDuration(0);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('آپ کے براؤزر میں مائیکروفون کی سہولت دستیاب نہیں ہے۔');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        const previewUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(previewUrl);

        // Convert Blob to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          setAudioBase64(base64Data);
        };
      };

      mediaRecorder.start(200);
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('مائیکروفون کی اجازت نہیں ملی۔ براہ کرم براؤزر کی سیٹنگز سے مائیک آن کریں۔');
      } else {
        setPermissionError('مائیکروفون شروع کرنے میں دشواری پیش آئی۔');
      }
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
  };

  const handleSend = () => {
    if (audioBase64) {
      onSendVoice(audioBase64, duration);
    } else if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        onSendVoice(reader.result as string, duration);
      };
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex flex-col gap-2 shadow-sm animate-fade-in">
      {permissionError ? (
        <div className="flex items-center justify-between text-red-700 text-sm gap-2">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{permissionError}</span>
          </div>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-lg"
          >
            بند کریں
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          {/* Cancel button */}
          <button
            onClick={() => {
              stopCleanup();
              onCancel();
            }}
            type="button"
            className="p-2.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
            title="منسوخ کریں"
          >
            <Trash2 className="w-5 h-5" />
          </button>

          {/* Recording Status & Waveform */}
          <div className="flex-1 flex items-center justify-center gap-3">
            {isRecording ? (
              <>
                <div className="w-3.5 h-3.5 rounded-full bg-red-600 animate-pulse" />
                <div className="flex items-center gap-1">
                  <span className="text-red-600 font-bold text-sm tracking-wide">
                    {formatSeconds(duration)}
                  </span>
                  <span className="text-xs text-stone-600 mr-2 font-medium">ریکارڈنگ ہو رہی ہے...</span>
                </div>
                <div className="flex items-center gap-0.5 h-5">
                  {[4, 9, 14, 8, 16, 12, 6, 15, 10, 5].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-emerald-600 rounded-full animate-bounce"
                      style={{
                        height: `${h}px`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.8s'
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-stone-700 font-bold text-sm">
                  ریکارڈ شدہ آواز: {formatSeconds(duration)}
                </span>
                {audioUrl && (
                  <audio src={audioUrl} controls className="h-8 max-w-[180px]" />
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {isRecording ? (
              <button
                onClick={handleStopRecording}
                type="button"
                className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>روکیں</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Send className="w-4 h-4 rotate-180" />
                <span>بھیجیں</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
