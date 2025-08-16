import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause,
  RotateCcw 
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceChatProps {
  onVoiceInput: (text: string) => void
  onSpeakText: (text: string, voice?: string, language?: string) => void
  isListening: boolean
  isSpeaking: boolean
  setIsListening: (listening: boolean) => void
  setIsSpeaking: (speaking: boolean) => void
}

interface VoiceOption {
  name: string
  lang: string
  voiceURI: string
  gender: 'male' | 'female'
  accent: string
}

export function VoiceChat({ 
  onVoiceInput, 
  onSpeakText, 
  isListening, 
  isSpeaking,
  setIsListening,
  setIsSpeaking 
}: VoiceChatProps) {
  const [voices, setVoices] = useState<VoiceOption[]>([])
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption | null>(null)
  const [recognition, setRecognition] = useState<any>(null)
  const { toast } = useToast()
  const synthRef = useRef<SpeechSynthesis>()

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
      loadVoices()
      
      // Listen for voice changes
      speechSynthesis.addEventListener('voiceschanged', loadVoices)
    }

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recog = new SpeechRecognition()
      
      recog.continuous = false
      recog.interimResults = false
      recog.lang = 'en-US'
      
      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        onVoiceInput(transcript)
        setIsListening(false)
      }
      
      recog.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        toast({
          title: "Voice Input Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive"
        })
      }
      
      recog.onend = () => setIsListening(false)
      setRecognition(recog)
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      speechSynthesis.removeEventListener('voiceschanged', loadVoices)
    }
  }, [])

  const loadVoices = () => {
    const availableVoices = speechSynthesis.getVoices()
    const voiceOptions: VoiceOption[] = availableVoices
      .filter(voice => voice.lang.includes('en') || voice.lang.includes('es') || voice.lang.includes('fr') || voice.lang.includes('de') || voice.lang.includes('it') || voice.lang.includes('pt'))
      .map(voice => ({
        name: voice.name,
        lang: voice.lang,
        voiceURI: voice.voiceURI,
        gender: voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') || voice.name.toLowerCase().includes('girl') ? 'female' : 'male',
        accent: getAccentFromLang(voice.lang)
      }))
    
    setVoices(voiceOptions)
    if (voiceOptions.length > 0 && !selectedVoice) {
      setSelectedVoice(voiceOptions[0])
    }
  }

  const getAccentFromLang = (lang: string): string => {
    const accents: { [key: string]: string } = {
      'en-US': 'American',
      'en-GB': 'British',
      'en-AU': 'Australian',
      'en-CA': 'Canadian',
      'en-IN': 'Indian',
      'es-ES': 'Spanish',
      'es-MX': 'Mexican',
      'fr-FR': 'French',
      'de-DE': 'German',
      'it-IT': 'Italian',
      'pt-BR': 'Brazilian'
    }
    return accents[lang] || lang
  }

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true)
      recognition.start()
    }
  }

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop()
      setIsListening(false)
    }
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window && selectedVoice) {
      // Cancel any ongoing speech
      speechSynthesis.cancel()
      
      const utterance = new SpeechSynthesisUtterance(text)
      const voice = speechSynthesis.getVoices().find(v => v.name === selectedVoice.name)
      
      if (voice) {
        utterance.voice = voice
      }
      
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => {
        setIsSpeaking(false)
        toast({
          title: "Speech Error",
          description: "Failed to speak text. Please try again.",
          variant: "destructive"
        })
      }
      
      speechSynthesis.speak(utterance)
      onSpeakText(text, selectedVoice.name, selectedVoice.lang)
    }
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Voice Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Voice:</label>
        <select 
          value={selectedVoice?.name || ''} 
          onChange={(e) => {
            const voice = voices.find(v => v.name === e.target.value)
            setSelectedVoice(voice || null)
          }}
          className="p-2 border border-border rounded-lg bg-background text-foreground"
        >
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.name} ({voice.accent}) - {voice.gender}
            </option>
          ))}
        </select>
      </div>

      {/* Voice Controls */}
      <div className="flex items-center gap-2 justify-center">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            size="icon"
            className={`h-12 w-12 rounded-full ${
              isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </motion.div>

        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={isSpeaking ? stopSpeaking : () => {}}
            variant={isSpeaking ? "destructive" : "outline"}
            size="icon"
            className="h-12 w-12 rounded-full"
            disabled={!isSpeaking}
          >
            {isSpeaking ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
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
  )
}