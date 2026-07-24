"use client";

import { useState, useRef, useEffect } from "react";

interface VoiceRecorderProps {
  onProcessed: (result: {
    classification: string;
    summary: string;
    interpretation: string;
    tags: string[];
  }) => void;
}

export default function VoiceRecorder({ onProcessed }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  async function startRecording() {
    try {
      setError(null);
      setIsRecording(true);
      setDuration(0);

      durationIntervalRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);

      await startBrowserRecognition();
    } catch (err: any) {
      setError(err.message || "Failed to start recording");
      setIsRecording(false);
    }
  }

  function stopRecording() {
    setIsRecording(false);
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  }

  async function startBrowserRecognition() {
    setTranscribing(true);
    setError(null);

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error("Speech recognition not supported on this browser");
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.language = "en-US";

      let transcript = "";

      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
      };

      recognition.onerror = (event: any) => {
        throw new Error(event.error || "Speech recognition failed");
      };

      recognition.onend = async () => {
        if (!transcript.trim()) {
          setError("No speech detected. Try again.");
          setTranscribing(false);
          return;
        }

        // Process the transcript
        try {
          const processRes = await fetch("/api/voice/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript }),
          });

          if (!processRes.ok) {
            const data = await processRes.json();
            throw new Error(data.error || "Processing failed");
          }

          const processData = await processRes.json();
          onProcessed(processData);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setTranscribing(false);
        }
      };

      recognition.start();
    } catch (err: any) {
      setError(err.message);
      setTranscribing(false);
    }
  }

  function formatDuration(secs: number) {
    const mins = Math.floor(secs / 60);
    const sec = secs % 60;
    return `${mins}:${sec.toString().padStart(2, "0")}`;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={transcribing}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          isRecording
            ? "bg-[#ef4444] hover:bg-[#dc2626] shadow-lg shadow-[#ef4444]/50"
            : "bg-white text-black hover:bg-white/90"
        } disabled:opacity-50`}
      >
        {transcribing ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isRecording ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="3" height="16" rx="1" />
            <rect x="15" y="4" width="3" height="16" rx="1" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="8" />
          </svg>
        )}
      </button>

      {(isRecording || transcribing) && (
        <div className="text-center">
          <p className="text-white/60 text-sm">
            {transcribing ? "Transcribing..." : `Recording ${formatDuration(duration)}`}
          </p>
        </div>
      )}

      {error && (
        <div className="text-xs text-[#ef4444] bg-[#ef4444]/[0.1] border border-[#ef4444]/30 rounded px-3 py-2 w-full text-center">
          {error}
        </div>
      )}
    </div>
  );
}
