/**
 * React hook for voice recording using Expo Audio API.
 * Records audio in a format suitable for the backend.
 */
import { useRef, useCallback, useState } from "react";
import { Audio } from "expo-av";

export type RecordingState = "idle" | "recording" | "stopped";

export function useVoiceRecorder() {
  const [state, setState] = useState<RecordingState>("idle");
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = useCallback(async (): Promise<void> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Microphone permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setState("recording");
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob> => {
    try {
      const recording = recordingRef.current;
      if (!recording) {
        setState("idle");
        return new Blob();
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      setState("stopped");

      if (uri) {
        const response = await fetch(uri);
        return await response.blob();
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
    return new Blob();
  }, []);

  return { state, startRecording, stopRecording };
}
