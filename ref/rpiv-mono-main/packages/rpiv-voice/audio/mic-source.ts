export const TARGET_SAMPLE_RATE = 16000;
export const FRAMES_PER_BUFFER = 1600;

const VAD_THRESHOLD = 0.5;
// Hangover before emitting `silence`. decibri's 300 ms default flushed mid-
// clause at natural breath pauses, which forced Whisper to "complete" an
// unterminated phrase with a spurious period. 700 ms eliminated that but felt
// laggy at the user-perceived "I stopped → text appears" gap. 500 ms is the
// LiveKit value: covers most natural breath pauses, keeps the perceived gap
// to ~half a second, and the transcribing spinner now papers over the rest.
const VAD_HOLDOFF_MS = 500;

export interface DecibriLike {
	on(event: "data", listener: (chunk: Buffer) => void): unknown;
	on(event: "speech" | "silence", listener: () => void): unknown;
	once(event: "end" | "error" | "close", listener: (err?: Error) => void): unknown;
	stop(): void;
}

interface DecibriCtor {
	new (opts: Record<string, unknown>): DecibriLike;
}

export async function createMic(): Promise<DecibriLike> {
	// decibri ships as CJS (`module.exports = Decibri`); under ESM the ctor lands on `.default`.
	const mod = (await import("decibri")) as { default: DecibriCtor };
	const Decibri = mod.default;
	return new Decibri({
		sampleRate: TARGET_SAMPLE_RATE,
		channels: 1,
		framesPerBuffer: FRAMES_PER_BUFFER,
		format: "int16",
		vad: true,
		vadMode: "silero",
		vadThreshold: VAD_THRESHOLD,
		vadHoldoff: VAD_HOLDOFF_MS,
	});
}
