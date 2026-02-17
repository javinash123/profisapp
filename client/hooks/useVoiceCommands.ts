import { useEffect, useRef, useState } from "react";
import Voice from "@react-native-voice/voice";

export function useVoiceCommands(onCommand: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [lastText, setLastText] = useState("");
  const isStartingRef = useRef(false);

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
    };

    Voice.onSpeechResults = (e) => {
      const text = (e.value?.[0] || "").toLowerCase().trim();
      console.log("Final text:", text);
      setLastText(text);

      if (text) {
        onCommand(text);
      }
    };

    Voice.onSpeechPartialResults = (e) => {
      const text = (e.value?.[0] || "").toLowerCase().trim();
      setLastText(text);
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [onCommand]);

  const startListening = async () => {
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
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.log("Stop error:", e);
    }
  };

  return { startListening, stopListening, isListening, lastText };
}
