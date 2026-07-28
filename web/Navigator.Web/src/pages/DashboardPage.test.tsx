import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { DashboardPage } from "./DashboardPage";

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

function getHealthRegion(name: "Liveness" | "Readiness") {
  return screen.getByRole("region", { name });
}

describe("Dashboard health status", () => {
  it("shows both healthy checks and an operational overall status", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    renderDashboard();

    expect(
      within(getHealthRegion("Liveness")).getByText("Loading"),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        within(getHealthRegion("Liveness")).getByText("Healthy"),
      ).toBeInTheDocument();
      expect(
        within(getHealthRegion("Readiness")).getByText("Healthy"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Operational")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("keeps partial results visible and reports a degraded overall status", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(
        new Response(null, { status: 503, statusText: "Service Unavailable" }),
      );
    vi.stubGlobal("fetch", fetchMock);

    renderDashboard();

    await waitFor(() => {
      expect(
        within(getHealthRegion("Liveness")).getByText("Healthy"),
      ).toBeInTheDocument();
      expect(
        within(getHealthRegion("Readiness")).getByText("Unhealthy"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Degraded")).toBeInTheDocument();
  });

  it("shows a readable unavailable state when requests fail", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError("Network request failed"));
    vi.stubGlobal("fetch", fetchMock);

    renderDashboard();

    await waitFor(() => {
      expect(
        within(getHealthRegion("Liveness")).getByText("Unavailable"),
      ).toBeInTheDocument();
      expect(
        within(getHealthRegion("Readiness")).getByText("Unavailable"),
      ).toBeInTheDocument();
    });
    expect(
      screen.getAllByText("Could not reach the Navigator API."),
    ).toHaveLength(2);
  });

  it("requests both checks again and displays updated results on Retry", async () => {
    const user = userEvent.setup();
    let resolveLiveness!: (response: Response) => void;
    let resolveReadiness!: (response: Response) => void;
    const livenessRetry = new Promise<Response>((resolve) => {
      resolveLiveness = resolve;
    });
    const readinessRetry = new Promise<Response>((resolve) => {
      resolveReadiness = resolve;
    });
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError("Initial liveness failure"))
      .mockRejectedValueOnce(new TypeError("Initial readiness failure"))
      .mockImplementationOnce(() => livenessRetry)
      .mockImplementationOnce(() => readinessRetry);
    vi.stubGlobal("fetch", fetchMock);

    renderDashboard();

    await waitFor(() => {
      expect(screen.getAllByText("Unavailable")).toHaveLength(3);
    });

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(screen.getByRole("button", { name: "Retry" })).toBeDisabled();
    act(() => {
      resolveLiveness(new Response(null, { status: 200 }));
      resolveReadiness(new Response(null, { status: 200 }));
    });
    await waitFor(() => {
      expect(
        within(getHealthRegion("Liveness")).getByText("Healthy"),
      ).toBeInTheDocument();
      expect(
        within(getHealthRegion("Readiness")).getByText("Healthy"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Operational")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls.map(([input]) => input)).toEqual([
      "/health/live",
      "/health/ready",
      "/health/live",
      "/health/ready",
    ]);
  });
});
