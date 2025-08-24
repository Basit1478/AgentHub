import React from 'react';
import { ChatGPTUI } from '@/components/ChatGPTUI';
import { WhatsAppChatInterface } from '@/components/WhatsAppChatInterface';
import { useIsMobile } from '@/hooks/use-mobile';
import { Target } from 'lucide-react'; // Import the icon component

export default function ChatPage() {
  const isMobile = useIsMobile();
  const agent = {
    id: "ceo",
    name: "CEO Agent",
    title: "Strategic Leader",
    icon: Target, // Pass the component, not a string
    color: "from-indigo-600 to-purple-600",
    description: "🧠 Your strategic business partner for high-level decisions and company vision",
    specialties: ["Strategic Planning", "Leadership", "Decision Making", "Vision Setting"],
    systemPrompt: `You are a seasoned CEO with 20+ years of experience leading successful companies. You provide strategic guidance, leadership insights, and help with high-level business decisions. You speak with authority but remain approachable. Auto-detect the user's language and respond in the same language. Support: English, Urdu, Hindi, Arabic, French, Spanish, Chinese.`,
    tasks: [
      "Strategic business planning",
      "Leadership guidance",
      "Market expansion strategies",
      "Investment decisions",
      "Company vision development"
    ]
  };

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-4xl mx-auto">
        {isMobile ? (
          <WhatsAppChatInterface
            agent={agent}
            onClose={() => {}}
          />
        ) : (
          <ChatGPTUI
            agent={agent}
            onClose={() => {}}
          />
        )}
      </div>
    </div>
  );
}