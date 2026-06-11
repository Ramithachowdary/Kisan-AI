// Web Speech API utilities

export const isSpeechRecognitionSupported = (): boolean => {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

export const isSpeechSynthesisSupported = (): boolean => {
  return 'speechSynthesis' in window;
};

export class SpeechRecognitionService {
  private recognition: any;
  private isListening = false;
  private language = 'en-IN';

  constructor(language = 'en-IN') {
    this.language = language;
    if (isSpeechRecognitionSupported()) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.language;
    }
  }

  setLanguage(language: string) {
    this.language = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  start(
    onInterim: (text: string) => void,
    onFinal: (text: string) => void,
    onError: (error: string) => void
  ) {
    if (!this.recognition) {
      onError('Speech recognition not supported');
      return;
    }

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;

      if (result.isFinal) {
        onFinal(transcript);
      } else {
        onInterim(transcript);
      }
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      onError('Failed to start recognition');
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isActive() {
    return this.isListening;
  }
}

export class SpeechSynthesisService {
  speak(text: string, lang = 'en-IN') {
    if (!isSpeechSynthesisSupported()) {
      console.warn('Speech synthesis not supported');
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}
