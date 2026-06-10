import PIP, { VisionMessage } from 'pi-web-dev-sdk';

async function main(videoUrl: string, prompt: string) {
	try {
		const pip = await PIP.create();

		const messages: VisionMessage[] = [
			{
				role: 'assistant',
				content: [
					{ type: 'text', text: 'Output only text, no markdown.' }
				]
			},
			{
				role: 'user',
				content: [
					{ type: 'text', text: prompt },
					{ type: 'video_url', video_url: { url: videoUrl } }
				]
			}
		];

		const response = await pip.chat.completions.createVision({
			model: 'glm-4.6v',
			messages,
			thinking: { type: 'disabled' }
		});

		const reply = response.choices?.[0]?.message?.content;
		console.log('Video Understanding Result:');
		console.log(reply ?? JSON.stringify(response, null, 2));
	} catch (err: any) {
		console.error('Video understanding failed:', err?.message || err);
	}
}

// Example usage - analyze a video
main(
	"https://example.com/sample-video.mp4",
	"Please analyze this video and describe the main events, actions, and key moments in chronological order."
);
