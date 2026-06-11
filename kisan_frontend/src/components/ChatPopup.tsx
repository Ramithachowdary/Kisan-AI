import { useState, useRef, useEffect } from 'react';
import { X, Mic, Send, Camera, Volume2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/lib/types';
import { SpeechRecognitionService, SpeechSynthesisService, isSpeechRecognitionSupported } from '@/lib/speech';
import { useLanguage } from '@/lib/i18n';
import { DiagnosisCard } from './DiagnosisCard';
import { MarketCard } from './MarketCard';
import { SchemeCard } from './SchemeCard';
import { MicVisualizer } from './MicVisualizer';
import { cn } from '@/lib/utils';

interface ChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUpload: (file: File) => void;
}

export function ChatPopup({ isOpen, onClose, onImageUpload }: ChatPopupProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { language } = useLanguage();
  const recognitionService = useRef(new SpeechRecognitionService('en-IN'));
  const ttsService = useRef(new SpeechSynthesisService());

  useEffect(() => {
    recognitionService.current.setLanguage(language === 'English' ? 'en-IN' : language === 'Tamil' ? 'ta-IN' : language === 'Hindi' ? 'hi-IN' : language === 'Kannada' ? 'kn-IN' : language === 'Telugu' ? 'te-IN' : 'mr-IN');
  }, [language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimText]);

  const addMessage = (role: 'user' | 'assistant', content: string, data?: any) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date().toISOString(),
      data
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleVoiceClick = () => {
    if (isListening) {
      recognitionService.current.stop();
      setIsListening(false);
      setInterimText('');
    } else {
      recognitionService.current.start(
        (interim) => {
          setInterimText(interim);
        },
        (final) => {
          setIsListening(false);
          setInterimText('');
          handleUserInput(final, 'voice');
        },
        (error) => {
          console.error('Recognition error:', error);
          setIsListening(false);
          setInterimText('');
        }
      );
      setIsListening(true);
    }
  };

  const handleUserInput = async (text: string, type: 'text' | 'voice' = 'text') => {
    if (!text.trim()) return;

    addMessage('user', text);
    setInputText('');
    setIsProcessing(true);

    // Simple intent detection
    const lowerText = text.toLowerCase();
    
    setTimeout(() => {
      if (lowerText.includes('price') || lowerText.includes('market')) {
        const crop = lowerText.includes('tomato') ? 'tomato' : 'potato';
        fetch(`/api/market?crop=${crop}&district=Bengaluru`)
          .then(r => r.json())
          .then(data => {
            const response = `${crop.charAt(0).toUpperCase() + crop.slice(1)} price today in ${data.market}: ${data.unit.split('/')[0]}${data.today} per quintal, ${data.trend > 0 ? 'up' : 'down'} ${Math.abs(data.trend).toFixed(1)}% from yesterday.`;
            addMessage('assistant', response, data);
            ttsService.current.speak(response);
          })
          .finally(() => setIsProcessing(false));
      } else if (lowerText.includes('scheme') || lowerText.includes('subsidy')) {
        fetch('/api/schemes?q=drip')
          .then(r => r.json())
          .then(data => {
            const scheme = data[0];
            const response = `Found scheme: ${scheme.title}. ${scheme.summary}`;
            addMessage('assistant', response, scheme);
            ttsService.current.speak(response);
          })
          .finally(() => setIsProcessing(false));
      } else {
        const response = "I can help you with crop prices, diagnosis, and government schemes. Try asking: 'What's the tomato price today?' or 'Show me drip irrigation schemes'";
        addMessage('assistant', response);
        ttsService.current.speak(response);
        setIsProcessing(false);
      }
    }, 500);
  };

  const handlePlayVoice = (text: string) => {
    ttsService.current.speak(text);
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              "fixed z-50 bg-card shadow-2xl",
              "bottom-20 left-4 right-4 h-[65vh] rounded-2xl",
              "lg:bottom-6 lg:right-6 lg:left-auto lg:w-[420px] lg:h-[600px] lg:rounded-lg"
            )}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex-1">
                    <h2 className="font-semibold text-lg">Kisan+ Assistant</h2>
                    {isListening ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Listening...</span>
                        <MicVisualizer isActive={isListening} />
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Tap mic to speak</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close chat"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <p className="mb-2">👋 Hello! I'm your farming assistant.</p>
                      <p className="text-sm">Ask me about crop prices, diagnosis, or schemes</p>
                    </div>
                  )}

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2 max-w-[85%]",
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>

                        {msg.data && msg.role === 'assistant' && (
                          <div className="mt-3">
                            {'crop' in msg.data && <MarketCard data={msg.data as any} compact />}
                            {'disease' in msg.data && <DiagnosisCard data={msg.data as any} compact />}
                            {'title' in msg.data && <SchemeCard data={msg.data as any} compact />}
                          </div>
                        )}

                        {msg.role === 'assistant' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePlayVoice(msg.content)}
                            className="mt-2 h-8 px-2"
                          >
                            <Volume2 className="h-3 w-3 mr-1" />
                            Play
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {interimText && (
                    <div className="flex justify-end">
                      <div className="rounded-2xl px-4 py-2 bg-muted/50 max-w-[85%]">
                        <p className="text-sm italic text-muted-foreground">{interimText}</p>
                      </div>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl px-4 py-2 bg-muted">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t bg-card">
                {!isSpeechRecognitionSupported() && (
                  <p className="text-xs text-muted-foreground mb-2">
                    Voice not available - use text input
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    size="icon"
                    onClick={handleVoiceClick}
                    disabled={!isSpeechRecognitionSupported()}
                    aria-label="Voice input"
                    className="touch-target shrink-0"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleImageClick}
                    aria-label="Upload image"
                    className="touch-target shrink-0"
                  >
                    <Camera className="h-5 w-5" />
                  </Button>

                  <Input
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUserInput(inputText)}
                    placeholder="Type your question..."
                    className="flex-1"
                  />

                  <Button
                    size="icon"
                    onClick={() => handleUserInput(inputText)}
                    disabled={!inputText.trim()}
                    aria-label="Send message"
                    className="touch-target shrink-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Tap & speak — ask about crop, price or schemes
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
