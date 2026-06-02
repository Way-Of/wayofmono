# @wayofmono/telegram

This package provides a first-party TypeScript SDK for interacting with the Telegram Bot API. It aims to replace the external `pi-telegram` extension and unify Telegram integration within the WayOfMono ecosystem.

## Features

- **Telegram Bot API Client**: Provides a `TelegramBot` class to interact with the Telegram Bot API.
- **Token Validation**: `setupTelegramBot(token)` function to validate bot tokens.
- **Message Sending**: `sendMessage` method with Markdown support.
- **Webhook Management**: `setWebhook` and `deleteWebhook` methods.
- **Long Polling**: `startPolling` and `stopPolling` for receiving updates.
- **File Handling**: `getFile` and `downloadFile` methods for media.

## Installation

```bash
pnpm add @wayofmono/telegram
# or
npm install @wayofmono/telegram
# or
yarn add @wayofmono/telegram
```

## Usage

```typescript
import { setupTelegramBot } from '@wayofmono/telegram';

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN environment variable is not set.');
    process.exit(1);
  }

  try {
    const { bot, botInfo } = await setupTelegramBot(token);
    console.log(`Bot connected: ${botInfo.username}`);

    // Example: Send a message
    // await bot.sendMessage('<YOUR_CHAT_ID>', 'Hello from WayOfMono Telegram Bot!');

    // Example: Start polling for updates
    // bot.startPolling(async (update) => {
    //   if (update.message) {
    //     console.log(`Received message from ${update.message.from?.username}: ${update.message.text}`);
    //     // await bot.sendMessage(update.message.chat.id.toString(), `You said: ${update.message.text}`);
    //   }
    // });

  } catch (error) {
    console.error('Failed to set up Telegram Bot:', error);
  }
}

main();
```

## API

### `setupTelegramBot(token: string): Promise<{ bot: TelegramBot; botInfo: BotInfo }>`

Validates the provided bot token using `getMe` and returns a `TelegramBot` instance along with the `BotInfo`.

### `class TelegramBot`

#### `constructor(token: string)`

Initializes the TelegramBot instance with the provided token.

#### `async getMe(): Promise<BotInfo>`

Returns basic information about the bot.

#### `async setWebhook(url: string): Promise<boolean>`

Specifies a URL to receive incoming updates via an outgoing webhook.

#### `async deleteWebhook(): Promise<boolean>`

Removes webhook integration.

#### `async startPolling(handler: (update: Update) => Promise<void>, intervalMs?: number): Promise<void>`

Starts long polling for updates.

#### `async stopPolling(): Promise<void>`

Stops the active long polling.

#### `async sendMessage(chatId: string, text: string, opts?: SendMessageOpts): Promise<Message>`

Sends a text message. `opts` can include `parse_mode`, `disable_web_page_preview`, etc.

#### `async getFile(fileId: string): Promise<File>`

Returns basic information about a file and prepares it for downloading.

#### `async downloadFile(filePath: string, dest: string): Promise<void>`

Downloads a file from Telegram servers.

## Contributing

Please refer to the main repository's contributing guidelines.
