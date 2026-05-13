export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  signal?: AbortSignal;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 2000,
  maxDelayMs: 60000,
  signal: undefined as AbortSignal | undefined,
};

export function isRetryableError(status: number, errorText: string): boolean {
  if ([429, 500, 502, 503, 504].includes(status)) {
    return true;
  }
  return /rate.?limit|overloaded|service.?unavailable|upstream.?connect|connection.?refused|fetch failed|network.?error|timed? ?out/i.test(
    errorText,
  );
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Request was aborted"));
      return;
    }
    const timeout = setTimeout(resolve, ms);
    const onAbort = () => {
      clearTimeout(timeout);
      reject(new Error("Request was aborted"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export interface FetcherOptions extends RetryOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export async function fetchWithRetry(
  url: string,
  options: FetcherOptions,
): Promise<Response> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    if (config.signal?.aborted) {
      throw new Error("Request was aborted");
    }

    try {
      const response = await fetch(url, {
        method: options.method ?? "POST",
        headers: options.headers,
        body: options.body,
        signal: config.signal,
      });

      if (response.ok) {
        return response;
      }

      if (attempt < config.maxRetries) {
        const errorText = await response.text().catch(() => "");
        if (isRetryableError(response.status, errorText)) {
          const delayMs = Math.min(
            config.baseDelayMs * Math.pow(2, attempt),
            config.maxDelayMs,
          );
          await delay(delayMs, config.signal);
          continue;
        }
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError" || error.message === "Request was aborted") {
          throw new Error("Request was aborted");
        }
      }
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < config.maxRetries) {
        const delayMs = Math.min(
          config.baseDelayMs * Math.pow(2, attempt),
          config.maxDelayMs,
        );
        await delay(delayMs, config.signal);
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error("Failed after retries");
}
