import React, { useState, useRef, useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ConversationLimitModal } from "./ConversationLimitModal";
import {
  X,
  Send,
  Bot,
  Loader2,
  Volume2,
  MoreVertical,
  Video,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Mic,
  MicOff,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "read";
  voiceUrl?: string;
  language?: string;
}

interface Agent {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  specialties: string[];
  systemPrompt: string;
}

interface WhatsAppChatInterfaceProps {
  agent: Agent;
  onClose: () => void;
}

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="p-4 text-center">
    <p className="text-red-500">Error: {error.message}</p>
    <Button onClick={() => window.location.reload()} className="mt-2">
      Retry
    </Button>
  </div>
);

export function WhatsAppChatInterface({ agent, onClose }: WhatsAppChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [conversationData, setConversationData] = useState({ conversationsUsed: 0, plan: "free" });
  const [messageCount, setMessageCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const welcomeMessage: Message = {
      id: `welcome-${Date.now()}`,
      role: "assistant",
      content: `Hey! 👋 I'm ${agent.name}, your ${agent.specialties.join(", ").toLowerCase()} expert. How can I assist you today?`,
      timestamp: new Date(),
      status: "delivered",
      language: "en",
    };
    setMessages([welcomeMessage]);
    inputRef.current?.focus();
  }, [agent]);

  const speakText = (voiceUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = voiceUrl;
      audioRef.current.play().catch((error) => {
        console.error("Audio playback error:", error);
        toast({
          title: "Playback Error",
          description: "Failed to play voice response",
          variant: "destructive",
        });
      });
      setIsSpeaking(true);
      audioRef.current.onended = () => setIsSpeaking(false);
    }
  };

  const startRecording = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to use voice input",
        variant: "destructive",
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await handleVoiceInput(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast({
        title: "Recording Started",
        description: "Speak now...",
      });
    } catch (error) {
      console.error("Recording error:", error);
      toast({
        title: "Recording Error",
        description: "Failed to access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceInput = async (audioBlob: Blob) => {
    if (audioBlob.size === 0) {
      toast({
        title: "Voice Input Error",
        description: "Recording was empty. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "voice-input.webm");

      const { data, error } = await supabase.functions.invoke("transcribe-voice", {
        body: formData,
      });

      if (error) {
        console.error("Supabase transcribe function returned an error:", error);
        throw new Error(error.message || "Failed to transcribe voice");
      }

      if (!data || !data.text) {
        throw new Error("No transcription available");
      }

      toast({
        title: "Voice Input Received",
        description: `Transcribed in ${data.language === "hi" ? "Hindi" : "English"}: ${data.text}`,
      });
      await sendMessage(data.text, data.language);
    } catch (error: any) {
      console.error("Voice transcription error:", error);
      toast({
        title: "Voice Input Error",
        description: `Failed to process voice input: ${error.message}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const sendMessage = async (content: string = message.trim(), language: string = "en") => {
    if (!content || isLoading) return;

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to chat with agents",
        variant: "destructive",
      });
      window.location.href = "/auth";
      return;
    }

    const newMessageCount = messageCount + 1;
    setMessageCount(newMessageCount);

    if (newMessageCount === 100 && user) {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("plan")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user plan:", error);
        } else if (profile?.plan === "free") {
          setShowUpgradeModal(true);
        }
      } catch (error) {
        console.error("Error checking user plan:", error);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
      status: "sending",
      language,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "sent" } : msg))
      );
    }, 500);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "delivered" } : msg))
      );
    }, 1000);

    try {
      const conversationHistory = messages
        .filter((m) => !m.id.startsWith("welcome"))
        .map((msg) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        }));

      const { data, error } = await supabase.functions.invoke("chat-with-gemini", {
        body: {
          messages: [...conversationHistory, { role: "user", content }],
          agentId: agent.id,
          systemPrompt: agent.systemPrompt,
          language,
        },
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to send message");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        status: "delivered",
        voiceUrl: data.voiceUrl,
        language,
      };

      setMessages((prev) => [
        ...prev.slice(0, -1),
        { ...userMessage, status: "read" },
        assistantMessage,
      ]);

      if (data.voiceUrl) {
        speakText(data.voiceUrl);
      }
    } catch (error: any) {
      console.error("Message send error:", error);
      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}. Please try again.`,
        variant: "destructive",
      });
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload files",
        variant: "destructive",
      });
      return;
    }

    const file = e.target.files[0];
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, DOC, DOCX, TXT, PNG, or JPG file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("user-uploads")
        .upload(fileName, file, {
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(uploadError.message || "Failed to upload file");
      }

      const { data: publicUrlData } = supabase.storage
        .from("user-uploads")
        .getPublicUrl(fileName);

      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to generate public URL");
      }

      const fileMessageContent = `Uploaded file: ${publicUrlData.publicUrl}`;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "user",
          content: fileMessageContent,
          timestamp: new Date(),
          status: "sent",
        },
      ]);
      setShowFileUpload(false);
      toast({
        title: "File Uploaded",
        description: "Your file has been successfully uploaded!",
      });

      await sendMessage(
        `I uploaded a file: ${publicUrlData.publicUrl}. Please analyze it as a ${agent.specialties.join(", ").toLowerCase()} expert and provide relevant insights.`,
        "en"
      );
    } catch (error: any) {
      console.error("File upload error:", error);
      toast({
        title: "Upload Failed",
        description: `Could not upload file: ${error.message}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3" />;
      case "delivered":
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return <Loader2 className="h-3 w-3 animate-spin" />;
    }
  };

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="w-full max-w-md h-[85vh] bg-background border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className={`bg-gradient-to-r ${agent.color} p-4 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-1"
                >
                  <X className="h-5 w-5" />
                </Button>
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <agent.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <p className="text-white/80 text-xs">online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Video className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-muted/20 to-muted/10 p-4 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    type: "spring",
                    damping: 25,
                    stiffness: 300,
                    delay: index * 0.05,
                  }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] ${msg.role === "user" ? "order-2" : "order-1"}`}>
                    <motion.div
                      className={`rounded-2xl p-3 shadow-sm relative ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-background border border-border rounded-bl-md"
                      }`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", damping: 25, stiffness: 400 }}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-xs opacity-60 ${
                          msg.role === "user" ? "text-primary-foreground" : "text-muted-foreground"
                        }`}
                      >
                        <span>
                          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {msg.role === "user" && getStatusIcon(msg.status)}
                      </div>
                      <div
                        className={`absolute bottom-0 w-3 h-3 ${
                          msg.role === "user"
                            ? "right-0 bg-primary transform rotate-45 translate-x-1 translate-y-1"
                            : "left-0 bg-background border-l border-b border-border transform rotate-45 -translate-x-1 translate-y-1"
                        }`}
                      />
                    </motion.div>
                    {msg.role === "assistant" && msg.voiceUrl && (
                      <div className="flex items-center space-x-2 mt-1 ml-2">
                        <Button
                          onClick={() => speakText(msg.voiceUrl!)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                          disabled={isSpeaking}
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-background border border-border rounded-2xl rounded-bl-md p-3 shadow-sm">
                  <div className="flex items-center space-x-1">
                    <motion.div
                      className="w-2 h-2 bg-muted-foreground rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-muted-foreground rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-muted-foreground rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-background border-t border-border">
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => {
                  if (!user) {
                    toast({
                      title: "Authentication Required",
                      description: "Please sign in to upload files",
                      variant: "destructive",
                    });
                    return;
                  }
                  setShowFileUpload(!showFileUpload);
                }}
                variant="ghost"
                size="sm"
                className={`text-muted-foreground hover:text-primary p-2 ${
                  showFileUpload ? "bg-primary/10 text-primary" : ""
                }`}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="rounded-full border-border bg-muted/50 pr-10"
                  disabled={isLoading || isRecording}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary p-1"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              {message.trim() ? (
                <Button
                  onClick={() => sendMessage()}
                  disabled={isLoading}
                  className="rounded-full h-10 w-10 p-0 bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className={`rounded-full h-10 w-10 p-0 ${
                    isRecording ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mt-2"
              >
                <div className="flex items-center justify-center gap-2 text-primary">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Mic className="h-4 w-4" />
                  </motion.div>
                  <span className="text-sm">Recording...</span>
                </div>
              </motion.div>
            )}
          </div>
          <audio ref={audioRef} style={{ display: "none" }} />
        </motion.div>

        {/* Modals */}
        <ConversationLimitModal
          isOpen={showLimitModal}
          onClose={() => setShowLimitModal(false)}
          conversationsUsed={conversationData.conversationsUsed}
          plan={conversationData.plan}
        />

        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Upgrade to Premium</h3>
                  <p className="text-muted-foreground text-sm">
                    You've sent 100 messages! Upgrade to Premium for unlimited conversations, priority support, and advanced features.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={() => {
                      setShowUpgradeModal(false);
                      window.location.href = "/pricing";
                    }}
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90"
                  >
                    Upgrade to Premium
                  </Button>
                  <Button
                    onClick={() => setShowUpgradeModal(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Continue with Free Plan
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showFileUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowFileUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-background border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">Upload Document</h3>
                <p className="text-muted-foreground text-sm">
                  Select a document to share with {agent.name}
                </p>
                <div className="border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="opacity-0 absolute inset-0 cursor-pointer"
                  />
                  <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to select file</p>
                </div>
                <Button
                  onClick={() => setShowFileUpload(false)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </ErrorBoundary>
  );
}