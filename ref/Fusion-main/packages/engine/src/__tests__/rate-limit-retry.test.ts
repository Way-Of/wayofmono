import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { withRateLimitRetry } from "../rate-limit-retry.js";

describe("withRateLimitRetry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the result when fn succeeds on first call", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const promise = withRateLimitRetry(fn);
    const result = await promise;
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on rate limit error and succeeds", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("429 too many requests"))
      .mockResolvedValueOnce("recovered");

    const onRetry = vi.fn();
    const promise = withRateLimitRetry(fn, {
      baseDelayMs: 1000,
      maxDelayMs: 10000,
      onRetry,
    });

    // Advance past the first backoff delay (1000ms base + jitter)
    await vi.advanceTimersByTimeAsync(1500);

    const result = await promise;
    expect(result).toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Number), expect.any(Error));
  });

  it("throws after all retries are exhausted", async () => {
    const rateLimitErr = new Error("rate_limit exceeded");
    const fn = vi.fn().mockRejectedValue(rateLimitErr);
    const onRetry = vi.fn();

    const promise = withRateLimitRetry(fn, {
      maxRetries: 2,
      baseDelayMs: 100,
      maxDelayMs: 1000,
      onRetry,
    });

    // Attach the rejection handler before advancing timers so the rejection
    // is never unhandled when the final retry throws during timer advancement.
    const assertion = expect(promise).rejects.toThrow("rate_limit exceeded");

    // Advance enough to cover all backoff delays
    for (let i = 0; i < 10; i++) {
      await vi.advanceTimersByTimeAsync(500);
    }

    await assertion;
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    expect(onRetry).toHaveBeenCalledTimes(2);
  });

  it("re-throws non-rate-limit errors immediately without retry", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("ENOENT: file not found"));
    const onRetry = vi.fn();

    await expect(
      withRateLimitRetry(fn, { baseDelayMs: 1000, onRetry }),
    ).rejects.toThrow("ENOENT: file not found");

    expect(fn).toHaveBeenCalledTimes(1);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it("applies exponential backoff with increasing delays", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("429"))
      .mockRejectedValueOnce(new Error("429"))
      .mockResolvedValueOnce("ok");

    const delays: number[] = [];
    const onRetry = (_attempt: number, delayMs: number) => {
      delays.push(delayMs);
    };

    // Use deterministic random for jitter
    vi.spyOn(Math, "random").mockReturnValue(0.5); // jitter = 0

    const promise = withRateLimitRetry(fn, {
      baseDelayMs: 1000,
      maxDelayMs: 10000,
      onRetry,
    });

    await vi.advanceTimersByTimeAsync(1100); // 1st delay: 1000ms
    await vi.advanceTimersByTimeAsync(2100); // 2nd delay: 2000ms

    await promise;

    expect(delays).toEqual([1000, 2000]);
    expect(fn).toHaveBeenCalledTimes(3);

    vi.spyOn(Math, "random").mockRestore();
  });

  it("caps delay at maxDelayMs", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("overloaded"))
      .mockResolvedValueOnce("ok");

    const delays: number[] = [];
    vi.spyOn(Math, "random").mockReturnValue(0.5);

    const promise = withRateLimitRetry(fn, {
      baseDelayMs: 100000, // would exceed maxDelayMs
      maxDelayMs: 5000,
      onRetry: (_a, d) => delays.push(d),
    });

    await vi.advanceTimersByTimeAsync(6000);
    await promise;

    // baseDelayMs * 2^0 = 100000, capped to 5000
    expect(delays[0]).toBe(5000);

    vi.spyOn(Math, "random").mockRestore();
  });

  it("cancels backoff sleep when abort signal fires", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("429 rate limited"));
    const ac = new AbortController();

    const promise = withRateLimitRetry(fn, {
      baseDelayMs: 60000,
      maxDelayMs: 120000,
      signal: ac.signal,
    });

    // Let first call fail and start sleeping
    await vi.advanceTimersByTimeAsync(10);

    // Abort during backoff
    ac.abort(new Error("Task paused"));

    await expect(promise).rejects.toThrow("Task paused");
    expect(fn).toHaveBeenCalledTimes(1); // only initial call, no retry
  });

  it("does not retry if abort signal is already aborted", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("too many requests"));
    const ac = new AbortController();
    ac.abort(new Error("Already cancelled"));

    await expect(
      withRateLimitRetry(fn, { signal: ac.signal }),
    ).rejects.toThrow("too many requests");

    // fn called once, then abort check triggers throw before sleep
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("classifies various rate limit error patterns correctly", async () => {
    const patterns = [
      "overloaded",
      "rate limit exceeded",
      "429 Too Many Requests",
      "quota exceeded",
      "billing limit reached",
      "insufficient credit",
    ];

    for (const msg of patterns) {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error(msg))
        .mockResolvedValueOnce("ok");

      const promise = withRateLimitRetry(fn, {
        baseDelayMs: 100,
        maxDelayMs: 100,
      });
      await vi.advanceTimersByTimeAsync(200);
      const result = await promise;
      expect(result).toBe("ok");
      expect(fn).toHaveBeenCalledTimes(2);
    }
  });

  it("handles non-Error thrown values", async () => {
    const fn = vi.fn().mockRejectedValue("string error");

    await expect(
      withRateLimitRetry(fn, { baseDelayMs: 100 }),
    ).rejects.toThrow("string error");

    expect(fn).toHaveBeenCalledTimes(1); // not a rate limit error string
  });

  it("uses default options when none provided", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("429"))
      .mockResolvedValueOnce("ok");

    const promise = withRateLimitRetry(fn);

    // Default baseDelayMs is 30000
    await vi.advanceTimersByTimeAsync(35000);

    const result = await promise;
    expect(result).toBe("ok");
  });
});
