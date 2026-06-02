# @wayofmono/whatsapp

This package provides a first-party TypeScript SDK for interacting with the WhatsApp Cloud API. It aims to integrate WhatsApp functionality within the WayOfMono ecosystem.

## Features

- **WhatsApp Cloud API Client**: Provides a `WhatsAppBot` class to interact with the WhatsApp Cloud API.
- **Token and Phone Number ID Validation**: `setupWhatsAppBot(token, phoneNumberId)` function to validate bot tokens and phone number IDs.
- **Message Sending**: `sendMessage` method for sending text messages.
- **Webhook Integration**: `onMessage` and `handleIncomingWebhook` for receiving and processing updates via webhooks.

## Installation

```bash
pnpm add @wayofmono/whatsapp
# or
npm install @wayofmono/whatsapp
# or
yarn add @wayofmono/whatsapp
```

## Usage

```typescript
import { setupWhatsAppBot } from '@wayofmono/whatsapp';

async function main() {
  const token = process.env.WHATSAPP_BOT_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.error('WHATSAPP_BOT_TOKEN and WHATSAPP_PHONE_NUMBER_ID environment variables must be set.');
    process.exit(1);
  }

  try {
    const { bot, botInfo } = await setupWhatsAppBot(token, phoneNumberId);
    console.log(`WhatsApp Bot connected: ${botInfo.name} (ID: ${botInfo.id})`);

    // Example: Send a message
    // Note: The 'to' field should be a valid WhatsApp ID (phone number with country code).
    // await bot.sendMessage('<RECIPIENT_WHATSAPP_ID>', 'Hello from WayOfMono WhatsApp Bot!');

    // Example: Registering an incoming message handler (for webhook processing)
    // This handler would typically be called by an external HTTP server receiving WhatsApp webhooks.
    // bot.onMessage(async (payload) => {
    //   console.log('Received WhatsApp webhook payload:', JSON.stringify(payload, null, 2));
    //   // Process the payload and extract messages
    //   // Example: Extracting text messages
    //   payload.entry.forEach(entry => {
    //     entry.changes.forEach(change => {
    //       if (change.field === 'messages' && change.value.messages) {
    //         change.value.messages.forEach(message => {
    //           if (message.type === 'text' && message.text) {
    //             console.log(`Received text message from ${message.from}: ${message.text.body}`);
    //             // You can reply here, e.g., bot.sendMessage(message.from, `You said: ${message.text.body}`);
    //           }
    //         });
    //       }
    //     });
    //   });
    // });

    // In a real application, you would set up an HTTP server to receive webhooks
    // and then call `bot.handleIncomingWebhook(webhookPayload)` when a payload arrives.

  } catch (error) {
    console.error('Failed to set up WhatsApp Bot:', error);
  }
}

main();
```

## API

### `setupWhatsAppBot(token: string, phoneNumberId: string): Promise<{ bot: WhatsAppBot; botInfo: WhatsAppBotInfo }>`

Validates the provided bot token and phone number ID, then returns a `WhatsAppBot` instance along with `WhatsAppBotInfo`.

### `class WhatsAppBot`

#### `constructor(token: string, phoneNumberId: string)`

Initializes the WhatsAppBot instance with the provided token and phone number ID.

#### `async getMe(): Promise<WhatsAppBotInfo>`

Returns basic information about the WhatsApp Business Account associated with the `phoneNumberId`.

#### `async sendMessage(to: string, text: string): Promise<WhatsAppMessageResponse>`

Sends a text message to a specified WhatsApp ID.

#### `onMessage(handler: (message: WhatsAppIncomingMessage) => Promise<void>): void`

Registers a handler function to be called when incoming WhatsApp messages are processed via `handleIncomingWebhook`. This method does not set up a webhook itself.

#### `async handleIncomingWebhook(payload: WhatsAppIncomingMessage): Promise<void>`

Processes an incoming webhook payload from WhatsApp, typically called by an external HTTP server. If a handler is registered with `onMessage`, it will be invoked.

## Contributing

Please refer to the main repository's contributing guidelines.
