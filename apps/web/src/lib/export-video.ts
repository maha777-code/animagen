export interface RecordAnimationOptions {
  canvas: HTMLCanvasElement;
  durationSec: number;
  fps?: number;
  onFrame: (delta: number, elapsed: number) => void;
  onProgress?: (ratio: number) => void;
}

function pickMimeType(): string {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder is not supported in this browser');
  }
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
    return 'video/webm;codecs=vp9';
  }
  if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
    return 'video/webm;codecs=vp8';
  }
  return 'video/webm';
}

/** Record canvas animation in real time via captureStream + MediaRecorder. */
export function recordCanvasAnimation(options: RecordAnimationOptions): Promise<Blob> {
  const { canvas, durationSec, onFrame, onProgress } = options;
  const fps = options.fps ?? 30;
  const frameMs = 1000 / fps;
  const mimeType = pickMimeType();

  return new Promise((resolve, reject) => {
    const stream = canvas.captureStream(fps);
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 6_000_000,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
    recorder.onerror = () => reject(new Error('Video recording failed'));

    let elapsed = 0;
    recorder.start(250);

    const tick = () => {
      if (elapsed >= durationSec) {
        onProgress?.(1);
        recorder.stop();
        return;
      }

      onFrame(1 / fps, elapsed);
      onProgress?.(Math.min(1, elapsed / durationSec));
      elapsed += 1 / fps;
      window.setTimeout(tick, frameMs);
    };

    tick();
  });
}
