// Speech recognition and text-to-speech synthesis service
class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private speechRate: number = 1.05;
  private speechPitch: number = 1.0;
  private preferredVoiceName: string = '';
  private onResultCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((err: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    this.initRecognition();
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'es-ES';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        const isFinal = Boolean(finalTranscript);
        if (this.onResultCallback && text) {
          this.onResultCallback(text, isFinal);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error || 'Error de reconocimiento de voz');
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      };
    }
  }

  public isSupported(): boolean {
    return Boolean(
      typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }

  public startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError?: (err: string) => void,
    onEnd?: () => void
  ) {
    if (!this.recognition) {
      this.initRecognition();
    }
    if (!this.recognition) {
      onError?.('El reconocimiento de voz no está soportado en este navegador.');
      return;
    }

    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;
    this.onEndCallback = onEnd || null;

    try {
      this.isListening = true;
      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      // Already started
      if (e.name !== 'InvalidStateError') {
        onError?.(e.message || 'Error al activar el micrófono');
      }
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.isListening = false;
  }

  public setRate(rate: number) {
    this.speechRate = Math.max(0.5, Math.min(2.0, rate));
  }

  public setPitch(pitch: number) {
    this.speechPitch = Math.max(0.5, Math.min(1.8, pitch));
  }

  public setPreferredVoice(voiceName: string) {
    this.preferredVoiceName = voiceName;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }

  public speak(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        onEnd?.();
        resolve();
        return;
      }

      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      if (!text || text.trim() === '') {
        onEnd?.();
        resolve();
        return;
      }

      // Clean speech text: remove markdown asterisks, URLs, JSON
      const cleanText = text
        .replace(/[*_#`~]/g, '')
        .replace(/https?:\/\/\S+/g, 'enlace')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'es-ES';
      utterance.rate = this.speechRate;
      utterance.pitch = this.speechPitch;

      const voices = window.speechSynthesis.getVoices();
      if (this.preferredVoiceName) {
        const found = voices.find((v) => v.name === this.preferredVoiceName);
        if (found) utterance.voice = found;
      } else {
        // Find best Spanish voice
        const esVoice =
          voices.find((v) => v.lang === 'es-ES' && v.name.includes('Google')) ||
          voices.find((v) => v.lang.startsWith('es') && !v.name.includes('Compact')) ||
          voices.find((v) => v.lang.startsWith('es'));
        if (esVoice) utterance.voice = esVoice;
      }

      utterance.onstart = () => {
        onStart?.();
      };

      utterance.onend = () => {
        onEnd?.();
        resolve();
      };

      utterance.onerror = () => {
        onError?.();
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
