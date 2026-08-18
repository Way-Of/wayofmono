export type ClipboardModule = {
	setText: (text: string) => Promise<void>;
	hasImage: () => boolean;
	getImageBinary: () => Promise<Array<number>>;
};

// No native clipboard addon is bundled. Platform tools (pbcopy, clip,
// wl-copy, xclip, xsel) and OSC 52 cover every platform in clipboard.ts,
// so the native module is always null here.
const clipboard: ClipboardModule | null = null;

export { clipboard };
