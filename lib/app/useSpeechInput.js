import { useCallback, useEffect, useRef, useState } from 'react';

const isLocalhost = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const recognitionErrorMessage = (code) => {
  switch (code) {
    case 'not-allowed':
      return !window.isSecureContext && !isLocalhost()
        ? 'Voice input needs a secure (HTTPS) connection.'
        : 'Please allow microphone access to use voice input.';
    case 'no-speech': return 'No speech was detected. Please try again.';
    case 'network': return 'Network error. Please check your connection.';
    case 'audio-capture': return 'No microphone was found. Please check your device settings.';
    default: return 'Voice input error. Please try again.';
  }
};

/** Browser speech-to-text for the topic box. */
export function useSpeechInput({ onResult, onError }) {
  const [isRecording, setIsRecording] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef(null);
  const handlers = useRef({ onResult, onError });
  handlers.current = { onResult, onError };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SpeechRecognition) return;
    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.onstart = () => setIsRecording(true);
      rec.onresult = (event) => {
        setIsRecording(false);
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) handlers.current.onResult?.(transcript);
      };
      rec.onerror = (event) => {
        setIsRecording(false);
        handlers.current.onError?.(recognitionErrorMessage(event.error));
      };
      rec.onend = () => setIsRecording(false);
      recognitionRef.current = rec;
      setSupported(true);
    } catch (err) {
      console.error('Error setting up speech recognition:', err);
    }
  }, []);

  const toggle = useCallback(async () => {
    const rec = recognitionRef.current;
    if (!rec) {
      handlers.current.onError?.('Voice input is not supported in this browser. Try Chrome.');
      return;
    }
    if (!window.isSecureContext && !isLocalhost()) {
      handlers.current.onError?.('Voice input needs a secure (HTTPS) connection.');
      return;
    }
    if (isRecording) {
      rec.stop();
      setIsRecording(false);
      return;
    }
    try {
      if (!isLocalhost()) {
        const stream = await navigator.mediaDevices?.getUserMedia({ audio: true });
        stream?.getTracks().forEach((track) => track.stop());
      }
      rec.start();
      setIsRecording(true);
    } catch (err) {
      setIsRecording(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        handlers.current.onError?.('Please allow microphone access to use voice input.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        handlers.current.onError?.('No microphone found. Please check your device settings.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        handlers.current.onError?.('Could not access your microphone. Is another app using it?');
      } else {
        handlers.current.onError?.('Error accessing microphone. Please try again.');
      }
    }
  }, [isRecording]);

  return { isRecording, supported, toggle };
}
