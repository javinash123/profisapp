import { useEffect, useState, useCallback, useRef } from "react";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { useApp } from "@/lib/AppContext";
import { useVoiceRecorder } from "@/replit_integrations/audio/useVoiceRecorder";
import { useVoiceStream } from "@/replit_integrations/audio/useVoiceStream";

const GRAMS_PER_OZ = 28.3495;
const GRAMS_PER_LB = 453.592;

export function useVoiceCommand() {
  const { currentMatch, setNetWeight, settings } = useApp();
  const { startRecording, stopRecording, state: recordingState } = useVoiceRecorder();
  const [isProcessing, setIsProcessing] = useState(false);
  const isListening = recordingState === "recording";

  const { streamVoiceResponse } = useVoiceStream({
    onUserTranscript: (text) => console.log("User said:", text),
    onComplete: (full) => {
      console.log("Voice command parsed:", full);
      handleCommand(full);
    },
    onError: (err) => {
      console.error("Voice stream error:", err);
      setIsProcessing(false);
    }
  });

  const handleCommand = useCallback((text: string) => {
    const lowerFull = text.toLowerCase();
    
    // Weight command parsing logic
    const lbMatch = lowerFull.match(/(\d+)\s*(?:lb|pound|pounds|lbs)/i);
    const ozMatch = lowerFull.match(/(\d+)\s*(?:oz|ounce|ounces)/i);
    const netMatch = lowerFull.match(/net\s*(\d+)/i);
    
    let totalGrams = 0;
    if (lbMatch) totalGrams += parseInt(lbMatch[1]) * GRAMS_PER_LB;
    if (ozMatch) totalGrams += parseInt(ozMatch[1]) * GRAMS_PER_OZ;
    
    const netIdx = netMatch ? parseInt(netMatch[1]) - 1 : 0;
    
    if (totalGrams > 0 && currentMatch && netIdx >= 0 && netIdx < currentMatch.nets.length) {
      const isAdding = lowerFull.includes("add") || lowerFull.includes("plus") || (!lowerFull.includes("remove") && !lowerFull.includes("minus"));
      const currentWeight = currentMatch.nets[netIdx].weight;
      const newWeight = isAdding ? currentWeight + totalGrams : Math.max(0, currentWeight - totalGrams);
      
      setNetWeight(netIdx, newWeight);
      
      const response = `${isAdding ? 'Added' : 'Removed'} ${lbMatch ? lbMatch[1] + ' pounds ' : ''}${ozMatch ? ozMatch[1] + ' ounces ' : ''} ${isAdding ? 'to' : 'from'} net ${netIdx + 1}`;
      Speech.speak(response);
    }
    setIsProcessing(false);
  }, [currentMatch, setNetWeight]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      setIsProcessing(true);
      const audioBlob = await stopRecording();
      if (audioBlob && audioBlob.size > 0) {
        try {
          // Replace with your actual voice processing endpoint
          await streamVoiceResponse("/api/voice/process", audioBlob);
        } catch (e) {
          console.error("Failed to process voice:", e);
          setIsProcessing(false);
        }
      } else {
        setIsProcessing(false);
      }
    } else {
      await startRecording();
    }
  }, [isListening, startRecording, stopRecording, streamVoiceResponse]);

  return {
    isListening,
    isProcessing,
    toggleListening,
    startListening: startRecording,
    stopListening: stopRecording
  };
}
