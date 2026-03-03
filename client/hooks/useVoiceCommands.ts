import { useEffect, useRef, useState, useCallback } from "react";
import Voice from "@react-native-voice/voice";

export function useVoiceCommands(onCommand: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [lastText, setLastText] = useState("");
  const isStartingRef = useRef(false);
  const onCommandRef = useRef(onCommand);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  const startListening = useCallback(async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;

    try {
      await Voice.start("en-US");
      setIsListening(true);
    } catch (e) {
      console.log("Start error:", e);
    }

    setTimeout(() => {
      isStartingRef.current = false;
    }, 500);
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.log("Stop error:", e);
    }
  }, []);

  useEffect(() => {
    Voice.onSpeechStart = () => {
      console.log("Speech started");
      setIsListening(true);
    };

    Voice.onSpeechEnd = () => {
      console.log("Speech ended");
      setIsListening(false);
    };

    Voice.onSpeechError = (e) => {
      console.log("Speech error:", e);
      setIsListening(false);
      // Attempt to restart if it's a timeout or non-fatal error
      if (e.error?.code === '7' || e.error?.code === 'no-match') {
        startListening();
      }
    };

    Voice.onSpeechResults = (e) => {
      const text = (e.value?.[0] || "").toLowerCase().trim();
      console.log("Final text:", text);
      setLastText(text);

      if (text) {
        onCommandRef.current(text);
      }
      // Restart listening for continuous mode
      startListening();
    };

    Voice.onSpeechPartialResults = (e) => {
      const text = (e.value?.[0] || "").toLowerCase().trim();
      setLastText(text);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [startListening]);

  return { startListening, stopListening, isListening, lastText };
}
