'use client'
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceChatProps {
  onVoiceInput: (text: string, language: string) => void;
  onSpeakText: (voiceUrl: string) => void;
  isListening: boolean;
  isSpeaking: boolean;
  setIsListening: (listening: boolean) => void;
  setIsSpeaking: (speaking: boolean) => void;
}

export function VoiceChat({
  onVoiceInput,
  onSpeakText,
  isListening,
  isSpeaking,
  setIsListening,
  setIsSpeaking,
}: VoiceChatProps) {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Browser Not Supported",
        description: "Voice input is not supported in this browser. Please use Chrome or Safari.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US"; // Default, will be updated dynamically

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      const language = recognition.lang;
      const langCode = language.split("-")[0]; // e.g., "en" or "hi"
      onVoiceInput(transcript, langCode);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      toast({
        title: "Voice Input Error",
        description: `Error: ${event.error}. Please try again.`,
        variant: "destructive",
      });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onVoiceInput, toast]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Try Hindi first, fallback to English
      recognitionRef.current.lang = "ur-PK";
      recognitionRef.current.start();
      setTimeout(() => {
        if (!isListening) {
          recognitionRef.current?.stop();
          recognitionRef.current!.lang = "en-US";
          recognitionRef.current?.start();
        }
      }, 2000);
      setIsListening(true);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Voice Controls */}
      <div className="flex items-center gap-2 justify-center">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            size="icon"
            className={`h-12 w-12 rounded-full ${
              isListening ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            variant={isSpeaking ? "destructive" : "outline"}
            size="icon"
            className="h-12 w-12 rounded-full"
            // onClick={handleStopSpeaking} // Consider adding a handler to stop text-to-speech output
            disabled={!isSpeaking}
          >
            {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </motion.div>
      </div>

      {/* Status Indicators */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 text-primary">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Mic className="h-4 w-4" />
              </motion.div>
              <span className="text-sm">Listening...</span>
            </div>
          </motion.div>
        )}

        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 text-primary">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <Volume2 className="h-4 w-4" />
              </motion.div>
              <span className="text-sm">Speaking...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
