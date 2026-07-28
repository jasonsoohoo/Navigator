import { afterEach, describe, expect, it, vi } from "vitest";

import { checkHealth } from "./healthClient";

describe("checkHealth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps a successful response to healthy", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await checkHealth("liveness", "/health/live");

    expect(result.state).toBe("healthy");
    expect(result.statusCode).toBe(204);
    expect(fetchMock).toHaveBeenCalledWith(
      "/health/live",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("maps a non-success response to unhealthy", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        new Response(null, { status: 503, statusText: "Service Unavailable" }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await checkHealth("readiness", "/health/ready");

    expect(result.state).toBe("unhealthy");
    expect(result.statusCode).toBe(503);
    expect(result.message).toContain("HTTP 503 Service Unavailable");
  });

  it("maps a rejected request to unavailable", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError("Network request failed"));
    vi.stubGlobal("fetch", fetchMock);

    const result = await checkHealth("liveness", "/health/live");

    expect(result.state).toBe("unavailable");
    expect(result.message).toBe("Could not reach the Navigator API.");
  });
});
