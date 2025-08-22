import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, Crown } from 'lucide-react';
import { useRouter } from 'next/router';

interface ConversationLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationsUsed: number;
  plan: string;
}

export function ConversationLimitModal({ 
  isOpen, 
  onClose, 
  conversationsUsed, 
  plan 
}: ConversationLimitModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push('/pricing');
  };

  const daysUntilReset = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const diffTime = nextMonth.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Conversation Limit Reached</span>
          </DialogTitle>
          <DialogDescription>
            You've reached your monthly conversation limit for the {plan} plan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Conversations Used:</span>
              <Badge variant="secondary">{conversationsUsed} / 100</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Plan:</span>
              <Badge variant="outline">{plan}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Reset in:</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span className="text-sm">{daysUntilReset()} days</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Choose an option:</h4>
            
            <Button 
              onClick={handleUpgrade} 
              className="w-full bg-gradient-primary hover:bg-gradient-primary/90"
              size="lg"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
            
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="w-full"
            >
              <Clock className="h-4 w-4 mr-2" />
              Wait for Monthly Reset
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Premium users get unlimited conversations with all agents
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}