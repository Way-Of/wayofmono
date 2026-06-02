import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

const TELEGRAM_API_BASE_URL = 'https://api.telegram.org/bot';
const TELEGRAM_FILE_BASE_URL = 'https://api.telegram.org/file/bot';

export interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

export interface SendMessageOpts {
  parse_mode?: 'MarkdownV2' | 'HTML' | 'Markdown';
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  // reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup | ReplyKeyboardRemove | ForceReply;
}

export interface Message {
  message_id: number;
  from?: User;
  sender_chat?: Chat;
  date: number;
  chat: Chat;
  text?: string;
  // Other fields can be added as needed
}

export interface User {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

export interface Chat {
  id: number;
  type: 'private' | 'group' | 'supergroup' | 'channel';
  title?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
}

export interface Update {
  update_id: number;
  message?: Message;
  edited_message?: Message;
  channel_post?: Message;
  edited_channel_post?: Message;
  // Add other update types as needed
}

export interface File {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}

interface ApiResponse<T> {
  ok: boolean;
  result?: T;
  description?: string;
}

export class TelegramBot {
  private token: string;
  private pollingOffset: number = 0;
  private pollingIntervalId: NodeJS.Timeout | null = null;

  constructor(token: string) {
    this.token = token;
  }

  private async callApi<T>(method: string, params?: Record<string, any>): Promise<T> {
    const url = `${TELEGRAM_API_BASE_URL}${this.token}/${method}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Telegram API error (${response.status}): ${errorText}`);
    }

    const jsonResponse: ApiResponse<T> = await response.json() as ApiResponse<T>;
    if (!jsonResponse.ok) {
      throw new Error(`Telegram API error: ${jsonResponse.description}`);
    }
    return jsonResponse.result as T;
  }

  async getMe(): Promise<BotInfo> {
    return this.callApi<BotInfo>('getMe');
  }

  async setWebhook(url: string): Promise<boolean> {
    return this.callApi<boolean>('setWebhook', { url });
  }

  async deleteWebhook(): Promise<boolean> {
    return this.callApi<boolean>('deleteWebhook');
  }

  async startPolling(handler: (update: Update) => Promise<void>, intervalMs: number = 3000): Promise<void> {
    if (this.pollingIntervalId) {
      console.warn('Polling is already active.');
      return;
    }

    const poll = async () => {
      try {
        const updates = await this.callApi<Update[]>('getUpdates', {
          offset: this.pollingOffset + 1,
          timeout: Math.floor(intervalMs / 1000), // convert ms to seconds
        });

        for (const update of updates) {
          this.pollingOffset = Math.max(this.pollingOffset, update.update_id);
          await handler(update);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    this.pollingIntervalId = setInterval(poll, intervalMs);
    console.log(`Started polling with interval ${intervalMs}ms`);
  }

  async stopPolling(): Promise<void> {
    if (this.pollingIntervalId) {
      clearInterval(this.pollingIntervalId);
      this.pollingIntervalId = null;
      console.log('Stopped polling.');
    } else {
      console.warn('Polling is not active.');
    }
  }

  async sendMessage(chatId: string, text: string, opts?: SendMessageOpts): Promise<Message> {
    const params = {
      chat_id: chatId,
      text: text,
      ...opts,
    };
    return this.callApi<Message>('sendMessage', params);
  }

  async getFile(fileId: string): Promise<File> {
    return this.callApi<File>('getFile', { file_id: fileId });
  }

  async downloadFile(filePath: string, dest: string): Promise<void> {
    const url = `${TELEGRAM_FILE_BASE_URL}${this.token}/${filePath}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const fileStream = fs.createWriteStream(dest);
    await new Promise((resolve, reject) => {
      response.body?.pipe(fileStream);
      response.body?.on('error', reject);
      fileStream.on('finish', () => resolve(undefined));
    });
  }
}

export async function setupTelegramBot(token: string): Promise<{ bot: TelegramBot; botInfo: BotInfo }> {
  const bot = new TelegramBot(token);
  const botInfo = await bot.getMe(); // Validate the token
  return { bot, botInfo };
}

