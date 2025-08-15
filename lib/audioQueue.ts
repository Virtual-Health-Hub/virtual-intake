interface QueueItem {
  audioBase64: string;
  speechMarks: any[];
}

const audioQueue: QueueItem[] = [];
let playing = false;
let currentAudio: HTMLAudioElement | null = null;
let animationFrameId: number | null = null;

export async function enqueueTTS(
  text: string,
  voiceId: string = "Joanna",
  onViseme: (viseme: string) => void
): Promise<void> {
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, voiceId }),
  });

  if (!response.ok) {
    throw new Error(`TTS request failed: ${response.statusText}`);
  }

  const data = await response.json();
  const queueItem: QueueItem = {
    audioBase64: data.audioBase64,
    speechMarks: data.speechMarks,
  };

  audioQueue.push({ ...queueItem, onViseme });

  if (!playing) {
    playNext(onViseme);
  }
}

export function playNext(onViseme: (viseme: string) => void): void {
  if (audioQueue.length === 0) {
    playing = false;
    return;
  }

  playing = true;
  const { audioBase64, speechMarks } = audioQueue.shift()!;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  const audioSrc = `data:audio/mp3;base64,${audioBase64}`;
  const audio = new Audio(audioSrc);
  currentAudio = audio;

  let visemeIndex = 0;
  const visemeMarks = speechMarks.filter((mark) => mark.type === "viseme");

  function updateViseme() {
    if (!audio || audio.paused || audio.ended) {
      return;
    }

    const currentTimeMs = audio.currentTime * 1000;

    while (
      visemeIndex < visemeMarks.length - 1 &&
      visemeMarks[visemeIndex + 1].time <= currentTimeMs
    ) {
      visemeIndex++;
    }

    if (visemeMarks[visemeIndex]) {
      onViseme(visemeMarks[visemeIndex].value);
    }

    animationFrameId = requestAnimationFrame(updateViseme);
  }

  audio.onended = () => {
    playing = false;
    currentAudio = null;
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    playNext(onViseme);
  };

  audio.play();
  updateViseme();
}

export function clearQueue(): void {
  audioQueue.length = 0;
  playing = false;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}
