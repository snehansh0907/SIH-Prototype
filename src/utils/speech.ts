/**
 * Web Speech API Voice synthesis helper for Krishi Sarthak
 * Supports English and Marathi/Hindi narration for farmer advisories
 */

class SpeechHelper {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  isAvailable(): boolean {
    return this.synth !== null;
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  isPlaying(): boolean {
    return this.currentUtterance !== null;
  }

  speak(
    text: string,
    lang: 'en' | 'mr',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): boolean {
    if (!this.synth) {
      if (onError) onError(new Error('Speech synthesis not supported in this browser'));
      return false;
    }

    this.stop();

    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Language target code
    utterance.lang = lang === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.92; // Slightly slower for clear rural comprehension
    utterance.pitch = 1.0;

    // Pick best available voice
    const voices = this.synth.getVoices();
    if (voices.length > 0) {
      const match = voices.find(v => 
        (lang === 'mr' && (v.lang.startsWith('mr') || v.lang.startsWith('hi'))) ||
        (lang === 'en' && (v.lang === 'en-IN' || v.name.includes('India')))
      );
      if (match) utterance.voice = match;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }
}

export const speechService = new SpeechHelper();
