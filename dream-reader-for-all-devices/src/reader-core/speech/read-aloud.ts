export interface ReadAloudState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSentenceIndex: number;
  currentCharIndex: number;
  rate: number;
}

export class ReadAloudEngine {
  private sentences: string[] = [];
  private currentIndex = 0;
  private rate = 1.0;
  private isPlaying = false;
  private isPaused = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public onSentenceChange?: (sentenceIndex: number, sentenceText: string) => void;
  public onWordBoundary?: (charIndex: number, charLength: number) => void;
  public onStateChange?: (state: ReadAloudState) => void;

  loadText(fullText: string): void {
    this.stop();
    // Segment into sentences
    this.sentences = fullText
      .split(/(?<=[.?!])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
    this.currentIndex = 0;
  }

  getSentences(): string[] {
    return this.sentences;
  }

  play(startIndex?: number): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.sentences.length === 0) return;

    if (startIndex !== undefined) {
      this.currentIndex = Math.max(0, Math.min(startIndex, this.sentences.length - 1));
    }

    this.isPlaying = true;
    this.isPaused = false;
    this.speakCurrentSentence();
  }

  pause(): void {
    if (!this.isPlaying || this.isPaused) return;
    window.speechSynthesis.pause();
    this.isPaused = true;
    this.emitState();
  }

  resume(): void {
    if (!this.isPaused) return;
    window.speechSynthesis.resume();
    this.isPaused = false;
    this.emitState();
  }

  stop(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.emitState();
  }

  getCurrentUtterance(): SpeechSynthesisUtterance | null {
    return this.currentUtterance;
  }

  next(): void {
    if (this.currentIndex + 1 < this.sentences.length) {
      this.currentIndex += 1;
      this.speakCurrentSentence();
    } else {
      this.stop();
    }
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
      this.speakCurrentSentence();
    }
  }

  setRate(newRate: number): void {
    this.rate = newRate;
    if (this.isPlaying && !this.isPaused) {
      this.speakCurrentSentence();
    }
  }

  private speakCurrentSentence(): void {
    window.speechSynthesis.cancel();
    const sentence = this.sentences[this.currentIndex];
    if (!sentence) return;

    const utterance = new SpeechSynthesisUtterance(sentence);
    utterance.lang = 'en-US';
    utterance.rate = this.rate;

    utterance.onboundary = (e) => {
      if (this.onWordBoundary) {
        this.onWordBoundary(e.charIndex, (e as any).charLength || 5);
      }
    };

    utterance.onend = () => {
      if (this.currentIndex + 1 < this.sentences.length) {
        this.currentIndex += 1;
        this.speakCurrentSentence();
      } else {
        this.stop();
      }
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);

    if (this.onSentenceChange) {
      this.onSentenceChange(this.currentIndex, sentence);
    }
    this.emitState();
  }

  private emitState(): void {
    if (this.onStateChange) {
      this.onStateChange({
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        currentSentenceIndex: this.currentIndex,
        currentCharIndex: 0,
        rate: this.rate,
      });
    }
  }
}

export const readAloudEngine = new ReadAloudEngine();
