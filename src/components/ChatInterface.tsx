
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {WhatsAppUI} from '../components/WhatsAppUI';
import {ChatGPTUI} from '../components/ChatGPTUI';
import { motion, AnimatePresence } from 'framer-motion';

const ChatInterface = ({ agent }) => {
  const [activeUI, setActiveUI] = useState('whatsapp');

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-center p-2 bg-background">
        <div className="bg-muted p-1 rounded-lg">
          <Button
            variant={activeUI === 'whatsapp' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveUI('whatsapp')}
            className={`px-4 py-1 rounded-md transition-colors duration-200 ${
              activeUI === 'whatsapp' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground'
            }`}
          >
            WhatsApp
          </Button>
          <Button
            variant={activeUI === 'chatgpt' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveUI('chatgpt')}
            className={`px-4 py-1 rounded-md transition-colors duration-200 ${
              activeUI === 'chatgpt' ? 'bg-white text-black shadow-sm' : 'text-muted-foreground'
            }`}
          >
            ChatGPT
          </Button>
        </div>
      </div>
      <div className="flex-grow p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeUI}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {activeUI === 'whatsapp' ? (
              <WhatsAppUI agent={agent}
              onClose={():void=>setActiveUI('')} />

            ) : (
              <ChatGPTUI agent={agent}
              onClose={():void=>setActiveUI('')} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ChatInterface;