import { Phone, MessageCircle, Bot, Volume2, Cloud, Clock, Trash2, Camera, TrendingUp, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { getHistory, clearHistory } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const EMERGENCY_CONTACTS = [
  {
    title: 'Agricultural Helpline',
    number: '1800-180-1551',
    description: '24/7 support for farming queries',
    icon: Phone,
  },
  {
    title: 'Kisan Call Center',
    number: '1800-180-1551',
    description: 'Expert advice on crops and farming',
    icon: Phone,
  },
  {
    title: 'WhatsApp Support',
    number: '+91-98765-43210',
    description: 'Quick answers via WhatsApp',
    icon: MessageCircle,
  },
];

const FAQ_ITEMS = [
  {
    question: "How do I use the voice assistant?",
    answer: "Click the microphone button at the bottom right corner of any page. You can ask questions about farming, crops, weather, market prices, and government schemes. The assistant supports multiple languages."
  },
  {
    question: "How to diagnose crop diseases?",
    answer: "Go to the Diagnosis page, upload a photo of the affected crop, and our AI will identify the disease and suggest treatments. You can also use the voice assistant to get quick advice."
  },
  {
    question: "Where can I check market prices?",
    answer: "Visit the Market page to see current mandi prices for various crops. You can search by crop name, filter by price trends, and listen to price updates using the voice feature."
  },
  {
    question: "How to apply for government schemes?",
    answer: "Check the Schemes page for available government programs. Each scheme shows eligibility criteria, benefits, and application steps. You can also ask the voice assistant for personalized recommendations."
  },
  {
    question: "Can I use the app offline?",
    answer: "Some features like viewing your history and saved information work offline. However, real-time features like market prices, disease diagnosis, and AI assistance require an internet connection."
  },
];

const categoryIcons = {
  diagnosis: Camera,
  market: TrendingUp,
  schemes: FileText,
  chat: MessageCircle,
};

export default function HelpAndHistory() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [chatMessages, setChatMessages] = useState([
    {
      time: new Date().toLocaleTimeString('en-IN'),
      message: "Hello! I'm your farming assistant. How can I help you today?",
      isBot: true,
    },
  ]);
  const [history] = useState(getHistory());

  const handleClearHistory = () => {
    clearHistory();
    toast({ title: "History cleared successfully" });
    window.location.reload();
  };

  const getCategoryIcon = (type: string) => {
    const Icon = categoryIcons[type as keyof typeof categoryIcons] || Clock;
    return Icon;
  };

  return (
    <div className="min-h-screen bg-background w-full">
      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        {/* Weather Alert */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-4 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Heavy rain expected tomorrow. Prepare for harvesting.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('help_history')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('help_history_desc')}
          </p>
        </div>

        {/* Help Section */}
        <div className="space-y-6">
          {/* Emergency Contacts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <Phone className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">{t('emergency_contacts')}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {EMERGENCY_CONTACTS.map((contact, index) => (
                  <motion.div
                    key={contact.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border-2">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-base">{contact.title}</h3>
                        <contact.icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xl font-bold text-success mb-2">
                        {contact.number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {contact.description}
                      </p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* FAQs & Tutorials */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">{t('faq_title')}</h2>
              </div>

              <Accordion type="single" collapsible className="w-full">
                {FAQ_ITEMS.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </motion.div>

          {/* AI Assistant Quick Access */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">{t('voice_assistant_tips')}</h2>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Click the microphone icon to start voice conversations</p>
                <p>• Ask about crops, diseases, market prices, or schemes</p>
                <p>• Upload crop images for instant disease diagnosis</p>
                <p>• Get personalized farming advice in your language</p>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* History Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t('recent_activity')}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t('recent_activity_desc')}
              </p>
            </div>
            {history.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearHistory}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear History
              </Button>
            )}
          </div>

          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">{t('no_history_yet')}</h3>
                <p className="text-sm text-muted-foreground">
                  {t('history_empty_message')}
                </p>
              </Card>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.slice(0, 6).map((item, index) => {
                const Icon = getCategoryIcon(item.type || 'chat');
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.01]">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-primary/10 rounded-lg shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className="font-semibold text-base line-clamp-1">
                              {item.query}
                            </h3>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {item.type || 'query'}
                            </Badge>
                          </div>
                          
                          {item.preview && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                              {item.preview}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>
                              {new Date(item.timestamp).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}