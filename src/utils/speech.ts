/**
 * Voice synthesis and audio playback helper for Krishi Sarthak
 * Provides authentic, natural audio narration in Hindi (hi), Marathi (mr), and English (en).
 */

import type { Language, DiagnosisResult } from '../types';

class SpeechHelper {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private isAudioPlaying = false;
  private keepAliveTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      // Pre-warm voices list for Web Speech API
      if (this.synth.getVoices().length === 0) {
        window.speechSynthesis.addEventListener?.('voiceschanged', () => {
          this.synth?.getVoices();
        });
      }
    }
  }

  isAvailable(): boolean {
    return true;
  }

  isPlaying(): boolean {
    return this.isAudioPlaying || this.currentUtterance !== null || (this.synth?.speaking ?? false);
  }

  stop(): void {
    // 1. Stop HTML5 audio stream if playing
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch {}
      this.currentAudio = null;
    }
    this.isAudioPlaying = false;

    // 2. Stop Web Speech API if speaking
    this.clearKeepAlive();
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch {}
    }
    this.currentUtterance = null;
  }

  private clearKeepAlive(): void {
    if (this.keepAliveTimer) {
      clearInterval(this.keepAliveTimer);
      this.keepAliveTimer = null;
    }
  }

  private startKeepAlive(): void {
    this.clearKeepAlive();
    // Chromium bug workaround: speech pauses after ~15 seconds without heartbeat
    this.keepAliveTimer = setInterval(() => {
      if (this.synth && this.synth.speaking && !this.synth.paused) {
        this.synth.pause();
        this.synth.resume();
      } else if (!this.synth?.speaking) {
        this.clearKeepAlive();
      }
    }, 10000);
  }

  /**
   * Streams studio-quality authentic TTS in Hindi and Marathi via the same-origin /api/tts endpoint.
   * Splits into natural sentence chunks for instant, smooth playback.
   */
  private playViaAudio(
    text: string,
    lang: 'hi' | 'mr',
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): boolean {
    this.stop();

    // Split text into natural sentence chunks using punctuation
    const rawParts = text.split(/([।!?. \n]+)/);
    const sentences: string[] = [];
    for (let i = 0; i < rawParts.length; i += 2) {
      const sentence = (rawParts[i] + (rawParts[i + 1] || '')).trim();
      if (sentence) sentences.push(sentence);
    }
    if (sentences.length === 0) sentences.push(text.trim());

    // Combine short sentences into chunks under 150 characters for responsive streaming
    const chunks: string[] = [];
    let current = '';
    for (const s of sentences) {
      if ((current + ' ' + s).trim().length <= 150) {
        current = (current + ' ' + s).trim();
      } else {
        if (current) chunks.push(current);
        current = s;
      }
    }
    if (current) chunks.push(current);

    if (chunks.length === 0) {
      if (onError) onError(new Error('No text to speak'));
      return false;
    }

    this.isAudioPlaying = true;
    let chunkIndex = 0;

    const playNextChunk = () => {
      if (!this.isAudioPlaying) return;
      if (chunkIndex >= chunks.length) {
        this.isAudioPlaying = false;
        this.currentAudio = null;
        if (onEnd) onEnd();
        return;
      }

      const chunk = chunks[chunkIndex];
      chunkIndex++;

      const url = `/api/tts?tl=${encodeURIComponent(lang)}&q=${encodeURIComponent(chunk)}`;
      const audio = new Audio(url);
      this.currentAudio = audio;

      audio.onplay = () => {
        if (chunkIndex === 1 && onStart) {
          onStart();
        }
      };

      audio.onended = () => {
        playNextChunk();
      };

      audio.onerror = (e) => {
        console.warn(`[SpeechHelper] /api/tts chunk error on chunk ${chunkIndex}:`, e);
        if (chunkIndex >= chunks.length) {
          this.isAudioPlaying = false;
          this.currentAudio = null;
          // Fallback to Web Speech API if audio endpoint fails
          this.speakViaWebSpeech(text, lang, onStart, onEnd, onError);
        } else {
          playNextChunk();
        }
      };

      audio.play().catch(err => {
        console.warn('[SpeechHelper] Audio.play() rejected, falling back to Web Speech API:', err);
        this.isAudioPlaying = false;
        this.currentAudio = null;
        this.speakViaWebSpeech(text, lang, onStart, onEnd, onError);
      });
    };

    playNextChunk();
    return true;
  }

  /**
   * Speaks text using the browser's native Web Speech API.
   * Used for English or as a fallback when offline.
   */
  private speakViaWebSpeech(
    text: string,
    lang: Language,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): boolean {
    if (!this.synth) {
      if (onError) onError(new Error('Speech synthesis not supported'));
      return false;
    }

    this.stop();

    const cleanText = text.replace(/[*#_`~]/g, '').replace(/\s+/g, ' ').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = this.synth.getVoices();
    const normalize = (c: string) => c.replace(/_/g, '-').toLowerCase();

    if (lang === 'mr') {
      const mrVoice = voices.find(v => normalize(v.lang).startsWith('mr'));
      const hiVoice = voices.find(
        v => normalize(v.lang).startsWith('hi') || v.name.toLowerCase().includes('lekha')
      );
      if (mrVoice) {
        utterance.voice = mrVoice;
        utterance.lang = mrVoice.lang;
      } else if (hiVoice) {
        utterance.voice = hiVoice;
        utterance.lang = hiVoice.lang;
      } else {
        utterance.lang = 'mr-IN';
      }
    } else if (lang === 'hi') {
      const hiVoice = voices.find(
        v => normalize(v.lang).startsWith('hi') || v.name.toLowerCase().includes('lekha')
      );
      if (hiVoice) {
        utterance.voice = hiVoice;
        utterance.lang = hiVoice.lang;
      } else {
        utterance.lang = 'hi-IN';
      }
    } else {
      const inVoice = voices.find(
        v => normalize(v.lang) === 'en-in' || v.name.toLowerCase().includes('rishi')
      );
      const enVoice = voices.find(v => normalize(v.lang).startsWith('en'));
      const voice = inVoice || enVoice || voices[0];
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = 'en-IN';
      }
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.startKeepAlive();
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.clearKeepAlive();
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') {
        this.clearKeepAlive();
        this.currentUtterance = null;
        return;
      }
      this.clearKeepAlive();
      this.currentUtterance = null;
      if (onError) onError(e);
    };

    this.currentUtterance = utterance;

    setTimeout(() => {
      if (!this.synth) return;
      if (this.synth.paused) {
        try {
          this.synth.resume();
        } catch {}
      }
      try {
        this.synth.speak(utterance);
      } catch (err) {
        if (onError) onError(err);
      }
    }, 40);

    return true;
  }

  speak(
    text: string,
    lang: Language,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): boolean {
    const cleanText = text.replace(/[*#_`~]/g, '').replace(/\s+/g, ' ').trim();
    if (!cleanText) {
      if (onError) onError(new Error('No text to speak'));
      return false;
    }

    console.info(`[SpeechHelper] Speaking in [${lang}]: "${cleanText.substring(0, 60)}..."`);

    // For Hindi and Marathi: stream authentic, natural audio via /api/tts
    if (lang === 'hi' || lang === 'mr') {
      return this.playViaAudio(cleanText, lang, onStart, onEnd, onError);
    }

    // For English: use native browser speech synthesis
    return this.speakViaWebSpeech(cleanText, 'en', onStart, onEnd, onError);
  }
}

/**
 * Returns the correct advisory text matching the selected language from a DiagnosisResult.
 * Falls back gracefully to Hindi, Marathi or English if specific locale strings are absent.
 */
export function getLocalizedAdvisoryScript(
  diagnosis: Partial<DiagnosisResult> | null | undefined,
  lang: Language
): string {
  if (!diagnosis) {
    if (lang === 'mr') {
      return 'टोमॅटोच्या पानावर मध्यम स्वरूपाचा करपा रोग आढळला आहे. आज लगेच जास्त खराब झालेली पाने तोडून टाका आणि पानांवर पाणी साचू देऊ नका. पुढील दोन दिवसांत जास्त आर्द्रतेमुळे रोग वाढू शकतो, म्हणून योग्य फवारणी करा.';
    }
    if (lang === 'hi') {
      return 'टमाटर की पत्ती पर मध्यम स्तर का अगेती झुलसा रोग पाया गया है। आज ही अधिक प्रभावित निचली पत्तियों को हटा दें और खेत में पानी का जमाव न होने दें। अधिक आर्द्रता के कारण अगले अड़तालीस घंटों में संक्रमण बढ़ सकता है, इसलिए सुबह के समय उचित निवारक छिड़काव करें।';
    }
    return 'Possible Early Blight detected on tomato leaf with moderate severity. Today you should remove heavily affected lower leaves and avoid excess watering. Fungal risk may increase over the next forty-eight hours due to high humidity. Consider preventive spray during clear morning hours.';
  }

  if (lang === 'mr') {
    return (
      diagnosis.advisoryVoiceScriptMr ||
      diagnosis.advisoryVoiceScript ||
      'टोमॅटोच्या पानावर मध्यम स्वरूपाचा करपा रोग आढळला आहे. आज लगेच जास्त खराब झालेली पाने तोडून टाका आणि पानांवर पाणी साचू देऊ नका.'
    );
  }

  if (lang === 'hi') {
    return (
      diagnosis.advisoryVoiceScriptHi ||
      'टमाटर की पत्ती पर मध्यम स्तर का अगेती झुलसा रोग पाया गया है। आज ही अधिक प्रभावित निचली पत्तियों को हटा दें और खेत में पानी का जमाव न होने दें। अधिक आर्द्रता के कारण अगले अड़तालीस घंटों में संक्रमण बढ़ सकता है, इसलिए सुबह के समय उचित निवारक छिड़काव करें।'
    );
  }

  return (
    diagnosis.advisoryVoiceScript ||
    'Possible Early Blight detected on tomato leaf with moderate severity. Today you should remove heavily affected lower leaves and avoid excess watering.'
  );
}

export const speechService = new SpeechHelper();
