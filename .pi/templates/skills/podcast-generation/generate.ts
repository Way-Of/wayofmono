#!/usr/bin/env tsx
/**
 * generate.ts - Ollama + Coqui TTS
 * -> podcast_script.md + podcast.wav
 *
 * Uses ollama for LLM and coqui-tts for text-to-speech
 *
 * Usage:
 * tsx generate.ts --input=material.txt --out_dir=out
 * tsx generate.ts --input=material.md --out_dir=out --duration=5
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------
// Types
// -----------------------------
interface GenConfig {
 mode: 'dual' | 'single-male' | 'single-female';
 temperature: number;
 durationManual: number;
 charsPerMin: number;
 hostName: string;
 guestName: string;
 audience: string;
 tone: string;
 maxAttempts: number;
 timeoutSec: number;
 voiceHost: string;
 voiceGuest: string;
 speed: number;
 pauseMs: number;
}

interface Segment {
 idx: number;
 speaker: 'host' | 'guest';
 name: string;
 text: string;
}

// -----------------------------
// Config
// -----------------------------
const DEFAULT_CONFIG: GenConfig = {
 mode: 'dual',
 temperature: 0.9,
 durationManual: 0,
 charsPerMin: 240,
 hostName: '',
 guestName: '',
 audience: '',
 tone: '',
 maxAttempts: 3,
 timeoutSec: 300,
 voiceHost: 'xiaochen',
 voiceGuest: 'chuichui',
 speed: 1.0,
 pauseMs: 200,
};

const DURATION_RANGE_LOW = 3;
const DURATION_RANGE_HIGH = 20;
const BUDGET_TOLERANCE = 0.15;

// -----------------------------
// Functions
// -----------------------------

function parseArgs(): { [key: string]: any } {
 const args = process.argv.slice(2);
 const result: { [key: string]: any } = {};

 for (let i = 0; i < args.length; i++) {
 const arg = args[i];
 if (arg.startsWith('--')) {
 const key = arg.slice(2);
 if (key.includes('=')) {
 const [k, v] = key.split('=');
 result[k] = v;
 } else if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
 result[key] = args[i + 1];
 i++;
 } else {
 result[key] = true;
 }
 }
 }

 return result;
}

function readText(filePath: string): string {
 let content = fs.readFileSync(filePath, 'utf-8');
 content = content.replace(/\r\n/g, '\n');
 content = content.replace(/\n{3,}/g, '\n\n');
 content = content.replace(/[ \t]{2,}/g, ' ');
 content = content.replace(/-\n/g, '');
 return content.trim();
}

function countNonWsChars(text: string): number {
 return text.replace(/\s+/g, '').length;
}

function chooseDurationMinutes(inputChars: number, low: number = DURATION_RANGE_LOW, high: number = DURATION_RANGE_HIGH): number {
 const estimated = Math.max(low, Math.min(high, Math.floor(inputChars / 1000)));
 return estimated;
}

function charBudget(durationMin: number, charsPerMin: number, tolerance: number): [number, number, number] {
 const target = durationMin * charsPerMin;
 const low = Math.floor(target * (1 - tolerance));
 const high = Math.ceil(target * (1 + tolerance));
 return [target, low, high];
}

function buildPrompts(
 material: string,
 cfg: GenConfig,
 durationMin: number,
 budgetTarget: number,
 budgetLow: number,
 budgetHigh: number,
 attemptHint: string = ''
): [string, string] {
 let system: string;
 let user: string;

 if (cfg.mode === 'dual') {
 system = (
 `` +
 `${cfg.hostName}${cfg.guestName}` +
 `` +
 ``
 );

 const hintBlock = attemptHint ? `\n\n${attemptHint}\n` : '';

 user = ` ${cfg.hostName} + ${cfg.guestName}
${durationMin}


1) ${budgetLow} ${budgetHigh} ${budgetTarget}
2) "**${cfg.hostName}**""**${cfg.guestName}**"
3)
 - Hook +
 - 3
 - + 1
4) "1"""""""""
5)
6) ${cfg.audience}
7) ${cfg.tone}

 -

1)
2) """"""""
3) "...""...""..."
4) 3-5
5)
6)
7) "1/2/3"


**${cfg.hostName}**
**${cfg.guestName}**


${hintBlock}

${material}
`;
 } else {
 const speakerName = cfg.mode === 'single-male' ? cfg.hostName : cfg.guestName;
 const gender = cfg.mode === 'single-male' ? '' : '';

 system = (
 `${gender}${speakerName}` +
 `` +
 `` +
 ``
 );

 const hintBlock = attemptHint ? `\n\n${attemptHint}\n` : '';

 user = `${speakerName}
${durationMin}


1) ${budgetLow} ${budgetHigh} ${budgetTarget}
2) ${speakerName}"**${speakerName}**"
3)
 - Hook +
 - 3
 - + 1
4) "1"""""""""
5)
6) ${cfg.audience}
7) ${cfg.tone}

 -

1)
2) "......""..."
3) "...""...""..."
4) 3-5
5)
6)


**${speakerName}**${speakerName}
**${speakerName}**
${speakerName}

${hintBlock}

${material}
`;
 }

 return [system, user];
}

async function callLLM(
 systemPrompt: string,
 userPrompt: string,
 temperature: number
): Promise<string> {
 try {
 const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
 const { stdout } = await execAsync(`ollama run llama3.1 "${fullPrompt.replace(/"/g, '\\"')}"`);
 return stdout.trim();
 } catch (error: any) {
 throw new Error(`LLM call failed: ${error.message}`);
 }
}

function scriptToSegments(script: string, hostName: string, guestName: string): Segment[] {
 const segments: Segment[] = [];
 const lines = script.split('\n');

 let current: Segment | null = null;
 let idx = 0;

 const hostPrefix = `**${hostName}**`;
 const guestPrefix = `**${guestName}**`;

 for (const rawLine of lines) {
 const line = rawLine.trim();
 if (!line) continue;

 if (line.startsWith(hostPrefix)) {
 idx++;
 current = {
 idx,
 speaker: 'host',
 name: hostName,
 text: line.slice(hostPrefix.length).trim(),
 };
 segments.push(current);
 } else if (line.startsWith(guestPrefix)) {
 idx++;
 current = {
 idx,
 speaker: 'guest',
 name: guestName,
 text: line.slice(guestPrefix.length).trim(),
 };
 segments.push(current);
 } else {
 if (current) {
 current.text = (current.text + ' ' + line).trim();
 }
 }
 }

 return segments;
}

function validateScript(
 script: string,
 cfg: GenConfig,
 budgetLow: number,
 budgetHigh: number
): [boolean, string[]] {
 const reasons: string[] = [];

 if (cfg.mode === 'dual') {
 const hostTag = `**${cfg.hostName}**`;
 const guestTag = `**${cfg.guestName}**`;

 if (!script.includes(hostTag)) reasons.push(`${hostTag}`);
 if (!script.includes(guestTag)) reasons.push(`${guestTag}`);

 const turns = script.split('\n').filter(line =>
 line.startsWith(hostTag) || line.startsWith(guestTag)
 );
 if (turns.length < 8) reasons.push(' 8 ');
 } else {
 const speakerName = cfg.mode === 'single-male' ? cfg.hostName : cfg.guestName;
 const speakerTag = `**${speakerName}**`;

 if (!script.includes(speakerTag)) reasons.push(`${speakerTag}`);

 const turns = script.split('\n').filter(line => line.startsWith(speakerTag));
 if (turns.length < 5) reasons.push(' 5 ');
 }

 const n = countNonWsChars(script);
 if (n < budgetLow || n > budgetHigh) {
 reasons.push(` ${n} ${budgetLow}-${budgetHigh}`);
 }

 // "1/2/3"
 const mustHave = ['', ''];
 for (const kw of mustHave) {
 if (!script.includes(kw)) {
 reasons.push(`${kw}`);
 }
 }

 //
 const lineCount = script.split('\n').filter(l => l.trim()).length;
 if (lineCount < 10) {
 reasons.push('10');
 }

 return [reasons.length === 0, reasons];
}

function makeRetryHint(reasons: string[], cfg: GenConfig, budgetLow: number, budgetHigh: number): string {
 const lines = [''];
 for (const r of reasons) lines.push(`- ${r}`);
 lines.push(`- ${budgetLow}-${budgetHigh} `);

 if (cfg.mode === 'dual') {
 lines.push(`- "**${cfg.hostName}**""**${cfg.guestName}**"`);
 } else {
 const speakerName = cfg.mode === 'single-male' ? cfg.hostName : cfg.guestName;
 lines.push(`- "**${speakerName}**"`);
 }

 lines.push('- "1/2/3"');
 return lines.join('\n');
}

async function ttsRequest(
 text: string,
 voice: string,
 speed: number
): Promise<Buffer> {
 try {
 const tmpTextPath = path.join(os.tmpdir(), `tts_${Date.now()}.txt`);
 const tmpWavPath = path.join(os.tmpdir(), `tts_${Date.now()}.wav`);
 fs.writeFileSync(tmpTextPath, text);

 await execAsync(`coqui-tts --text "${text.replace(/"/g, '\\"')}" --model ${voice} --speed ${speed} --output ${tmpWavPath}`);

 if (!fs.existsSync(tmpWavPath)) {
 throw new Error('TTS output file not found');
 }
 const buffer = fs.readFileSync(tmpWavPath);
 fs.unlinkSync(tmpTextPath);
 fs.unlinkSync(tmpWavPath);
 return buffer;
 } catch (error: any) {
 throw new Error(`TTS failed: ${error.message}`);
 }
}

function ensureSilenceWav(filePath: string, params: { nchannels: number; sampwidth: number; framerate: number }, ms: number): void {
 const { nchannels, sampwidth, framerate } = params;
 const nframes = Math.floor((framerate * ms) / 1000);
 const silenceFrame = Buffer.alloc(sampwidth * nchannels, 0);
 const frames = Buffer.alloc(silenceFrame.length * nframes, 0);

 const header = Buffer.alloc(44);
 header.write('RIFF', 0);
 header.writeUInt32LE(36 + frames.length, 4);
 header.write('WAVE', 8);
 header.write('fmt ', 12);
 header.writeUInt32LE(16, 16);
 header.writeUInt16LE(1, 20);
 header.writeUInt16LE(nchannels, 22);
 header.writeUInt32LE(framerate, 24);
 header.writeUInt32LE(framerate * nchannels * sampwidth, 28);
 header.writeUInt16LE(nchannels * sampwidth, 32);
 header.writeUInt16LE(sampwidth * 8, 34);
 header.write('data', 36);
 header.writeUInt32LE(frames.length, 40);

 fs.writeFileSync(filePath, Buffer.concat([header, frames]));
}

function wavParams(filePath: string): { nchannels: number; sampwidth: number; framerate: number } {
 const buffer = fs.readFileSync(filePath);
 const nchannels = buffer.readUInt16LE(22);
 const sampwidth = buffer.readUInt16LE(34) / 8;
 const framerate = buffer.readUInt32LE(24);
 return { nchannels, sampwidth, framerate };
}

function joinWavsWave(outPath: string, wavPaths: string[], pauseMs: number): void {
 if (wavPaths.length === 0) throw new Error('No wav files to join.');

 const ref = wavPaths[0];
 const refParams = wavParams(ref);
 const silencePath = path.join(os.tmpdir(), `_silence_${Date.now()}.wav`);
 if (pauseMs > 0) ensureSilenceWav(silencePath, refParams, pauseMs);

 const chunks: Buffer[] = [];

 for (let i = 0; i < wavPaths.length; i++) {
 const wavPath = wavPaths[i];
 const buffer = fs.readFileSync(wavPath);
 const dataStart = buffer.indexOf('data') + 8;
 const data = buffer.subarray(dataStart);

 const params = wavParams(wavPath);
 if (params.nchannels !== refParams.nchannels ||
 params.sampwidth !== refParams.sampwidth ||
 params.framerate !== refParams.framerate) {
 throw new Error(`WAV params mismatch: ${wavPath}`);
 }

 chunks.push(data);

 if (pauseMs > 0 && i < wavPaths.length - 1) {
 const silenceBuffer = fs.readFileSync(silencePath);
 const silenceData = silenceBuffer.subarray(silenceBuffer.indexOf('data') + 8);
 chunks.push(silenceData);
 }
 }

 const totalDataSize = chunks.reduce((sum, buf) => sum + buf.length, 0);
 const header = Buffer.alloc(44);
 header.write('RIFF', 0);
 header.writeUInt32LE(36 + totalDataSize, 4);
 header.write('WAVE', 8);
 header.write('fmt ', 12);
 header.writeUInt32LE(16, 16);
 header.writeUInt16LE(1, 20);
 header.writeUInt16LE(refParams.nchannels, 22);
 header.writeUInt32LE(refParams.framerate, 24);
 header.writeUInt32LE(refParams.framerate * refParams.nchannels * refParams.sampwidth, 28);
 header.writeUInt16LE(refParams.nchannels * refParams.sampwidth, 32);
 header.writeUInt16LE(refParams.sampwidth * 8, 34);
 header.write('data', 36);
 header.writeUInt32LE(totalDataSize, 40);

 const output = Buffer.concat([header, ...chunks]);
 fs.writeFileSync(outPath, output);

 if (fs.existsSync(silencePath)) fs.unlinkSync(silencePath);
}

// -----------------------------
// Main
// -----------------------------
async function main() {
 const args = parseArgs();

 const inputPath = args.input;
 const outDir = args.out_dir;
 const topic = args.topic;

 // input topic
 if ((!inputPath && !topic) || !outDir) {
 console.error('Usage: tsx generate.ts --input=<file> --out_dir=<dir>');
 console.error(' OR: tsx generate.ts --topic=<search-term> --out_dir=<dir>');
 console.error('');
 console.error('Examples:');
 console.error(' # From file');
 console.error(' npm run generate -- --input=article.txt --out_dir=out');
 console.error(' # From web search');
 console.error(' npm run generate -- --topic="AI" --out_dir=out');
 process.exit(1);
 }

 // Merge config
 const cfg: GenConfig = {
 ...DEFAULT_CONFIG,
 mode: (args.mode || 'dual') as GenConfig['mode'],
 durationManual: parseInt(args.duration || '0'),
 hostName: args.host_name || DEFAULT_CONFIG.hostName,
 guestName: args.guest_name || DEFAULT_CONFIG.guestName,
 voiceHost: args.voice_host || DEFAULT_CONFIG.voiceHost,
 voiceGuest: args.voice_guest || DEFAULT_CONFIG.voiceGuest,
 speed: parseFloat(args.speed || String(DEFAULT_CONFIG.speed)),
 pauseMs: parseInt(args.pause_ms || String(DEFAULT_CONFIG.pauseMs)),
 };

 // Create output directory
 if (!fs.existsSync(outDir)) {
 fs.mkdirSync(outDir, { recursive: true });
 }

 //
 let material: string;
 let inputSource: string;

 if (inputPath) {
 // 1
 console.log(`[MODE] Reading from file: ${inputPath}`);
 material = readText(inputPath);
 inputSource = `file:${inputPath}`;
 } else if (topic) {
 // 2 - web search using CLI
 console.log(`[MODE] Searching web for topic: ${topic}`);
 try {
 const { stdout } = await execAsync(`ddgr -n 10 "${topic}"`);
 const searchResults = stdout.split('\n').filter(line => line.trim()).map((line, i) => {
 const parts = line.split(' | ');
 return {
 name: parts[0] || `Result ${i + 1}`,
 snippet: parts[1] || '',
 url: parts[2] || ''
 };
 });

 if (!searchResults || searchResults.length === 0) {
 console.error(`"${topic}"`);
 process.exit(2);
 }

 console.log(`[SEARCH] Found ${searchResults.length} results`);

 //
 material = searchResults
 .map((r: any, i: number) => ` ${i + 1}${r.name}\n${r.snippet}\n${r.url}`)
 .join('\n\n');

 inputSource = `web_search:${topic}`;
 console.log(`[SEARCH] Compiled material (${material.length} chars)`);
  } catch (error: any) {
 console.error(`[ERROR] Web search failed: ${error.message}`);
 process.exit(2);
 }
 } else {
 console.error('[ERROR] Neither --input nor --topic provided');
 process.exit(1);
 }

 const inputChars = material.length;

 // Calculate duration
 let durationMin: number;
 if (cfg.durationManual >= 3 && cfg.durationManual <= 20) {
 durationMin = cfg.durationManual;
 } else {
 durationMin = chooseDurationMinutes(inputChars, DURATION_RANGE_LOW, DURATION_RANGE_HIGH);
 }

 const [target, low, high] = charBudget(durationMin, cfg.charsPerMin, BUDGET_TOLERANCE);

 console.log(`[INFO] input_chars=${inputChars} duration=${durationMin}min budget=${low}-${high}`);

 let attemptHint = '';
 let lastScript: string | null = null;

 // Initialize nothing (ollama runs as CLI)

 // Generate script
 for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
 const [systemPrompt, userPrompt] = buildPrompts(
 material,
 cfg,
 durationMin,
 target,
 low,
 high,
 attemptHint
 );

 try {
 console.log(`[LLM] Attempt ${attempt}/${cfg.maxAttempts}...`);
 const content = await callLLM(systemPrompt, userPrompt, cfg.temperature);
 lastScript = content;

 const [ok, reasons] = validateScript(content, cfg, low, high);

 if (ok) {
 break;
 }

 attemptHint = makeRetryHint(reasons, cfg, low, high);
 console.error(`[WARN] Validation failed:`, reasons.join(', '));
 } catch (error: any) {
 console.error(`[ERROR] LLM call failed: ${error.message}`);
 throw error;
 }
 }

 if (!lastScript) {
 console.error('[ERROR] ');
 process.exit(1);
 }

 // Write script
 const scriptPath = path.join(outDir, 'podcast_script.md');
 fs.writeFileSync(scriptPath, lastScript, 'utf-8');
 console.log(`[DONE] podcast_script.md -> ${scriptPath}`);

 // Parse segments
 const segments = scriptToSegments(lastScript, cfg.hostName, cfg.guestName);
 console.log(`[INFO] Parsed ${segments.length} segments`);

 // Generate TTS using SDK
 const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'podcast_segments_'));
 const produced: string[] = [];

 try {
 for (let i = 0; i < segments.length; i++) {
 const seg = segments[i];
 const text = seg.text.trim();
 if (!text) continue;

 let voice: string;
 if (cfg.mode === 'dual') {
 voice = seg.speaker === 'host' ? cfg.voiceHost : cfg.voiceGuest;
 } else if (cfg.mode === 'single-male') {
 voice = cfg.voiceHost;
 } else {
 voice = cfg.voiceGuest;
 }

 const wavPath = path.join(tmpDir, `seg_${seg.idx.toString().padStart(4, '0')}.wav`);

 console.log(`[TTS] [${i + 1}/${segments.length}] idx=${seg.idx} speaker=${seg.speaker} voice=${voice}`);

 const buffer = await ttsRequest(text, voice, cfg.speed);
 fs.writeFileSync(wavPath, buffer);
 produced.push(wavPath);
 }

 // Join segments
 const podcastPath = path.join(outDir, 'podcast.wav');
 console.log(`[JOIN] Joining ${produced.length} wav files -> ${podcastPath}`);

 joinWavsWave(podcastPath, produced, cfg.pauseMs);
 console.log(`[DONE] podcast.wav -> ${podcastPath}`);

 } finally {
 // Cleanup temp directory
 try {
 fs.rmSync(tmpDir, { recursive: true, force: true });
 } catch (error: any) {
 console.error(`[WARN] Failed to cleanup temp dir: ${error.message}`);
 }
 }

 console.log('\n[FINAL OUTPUT]');
 console.log(` 📄 podcast_script.md -> ${scriptPath}`);
 console.log(` 🎙️ podcast.wav -> ${path.join(outDir, 'podcast.wav')}`);
}

main().catch(error => {
 console.error('[FATAL ERROR]', error);
 process.exit(1);
});
