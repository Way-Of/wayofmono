import PI, { ChatMessage } from "pi-web-dev-sdk";

async function main(prompt: string) {
  try {
    const pi = await PI.create();

    const messages: ChatMessage[] = [
      {
        role: "assistant",
        content: "Hi, I'm a helpful assistant."
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await pi.chat.completions.create({
      messages,
      stream: false,
      thinking: { type: "disabled" },
    });

    const reply = response.choices?.[0]?.message?.content;
    console.log("Chat reply:");
    console.log(reply ?? JSON.stringify(response, null, 2));
  } catch (err: any) {
    console.error("Chat failed:", err?.message || err);
  }
}

main('What is the capital of France?');
