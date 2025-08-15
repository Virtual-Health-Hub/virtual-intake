export type SentenceChunkerOptions = {
  /**
   * Emit even if no hard boundary once this many characters are buffered.
   * Default: 180
   */
  maxChars?: number;
  /**
   * Require at least this many characters before a pause-based flush.
   * Default: 20
   */
  minChars?: number;
  /**
   * Regex that indicates a **hard sentence boundary** when matched at the end of the buffer.
   * Defaults to punctuation + whitespace or newline.
   */
  boundaryRegex?: RegExp;
  /**
   * Regex for **soft boundaries** (e.g., commas/semicolons). If buffer exceeds maxChars
   * and ends with a soft boundary, we flush as a sentence.
   */
  softBoundaryRegex?: RegExp;
  /**
   * If no new tokens arrive for this many ms, flush current buffer (if length >= minChars).
   * Default: 500 ms
   */
  maxPauseMs?: number;
};

export type SentenceChunker = {
  /** Feed a new token (string) from the model stream */
  feed: (token: string) => void;
  /** Force emit whatever is buffered (if any) */
  flush: () => void;
  /** Clear internal buffer and timers */
  reset: () => void;
  /** Inspect current buffer (for UI/debug) */
  getBuffer: () => string;
};

/**
 * Creates a streaming sentence chunker suitable for LLM token streams.
 * Emits sentence-like chunks to `onSentence` to be sent to TTS immediately.
 */
export function sentenceChunker(
  onSentence: (s: string) => void,
  options: SentenceChunkerOptions = {}
): SentenceChunker {
  const maxChars = options.maxChars ?? 180;
  const minChars = options.minChars ?? 20;
  const maxPauseMs = options.maxPauseMs ?? 500;
  const boundary = options.boundaryRegex ?? /([.?!]+[\s"')\]]+|[\n\r]+)/; // e.g. ". ", "?\n"
  const softBoundary = options.softBoundaryRegex ?? /(,|;|:)\s$/;

  let buf = "";
  let pauseTimer: ReturnType<typeof setTimeout> | null = null;

  const clearPause = () => {
    if (pauseTimer) {
      clearTimeout(pauseTimer);
      pauseTimer = null;
    }
  };

  const schedulePauseFlush = () => {
    clearPause();
    if (maxPauseMs <= 0) return;
    pauseTimer = setTimeout(() => {
      if (buf.trim().length >= minChars) emit();
    }, maxPauseMs);
  };

  const emit = () => {
    const out = buf.trim();
    if (out.length) {
      onSentence(out);
    }
    buf = "";
    clearPause();
  };

  const feed = (token: string) => {
    if (!token) return;
    buf += token;
    // Hard boundary: punctuation then space/quote/paren or newline
    if (boundary.test(buf)) {
      emit();
      return;
    }
    // Length-based: if too long, try to cut at soft boundary, otherwise emit
    if (buf.length >= maxChars) {
      if (softBoundary.test(buf)) {
        emit();
      } else {
        emit();
      }
      return;
    }
    // Otherwise, wait for more tokens with a pause-based flush
    schedulePauseFlush();
  };

  const flush = () => emit();

  const reset = () => {
    buf = "";
    clearPause();
  };

  const getBuffer = () => buf;

  return { feed, flush, reset, getBuffer };
}
