import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Navigator application", () => {
  beforeEach(() => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });

  it("renders Navigator branding and all primary navigation links", () => {
    renderRoute("/registries");

    expect(screen.getByText("Navigator")).toBeInTheDocument();
    expect(screen.getByText("GPU Workload Control Plane")).toBeInTheDocument();

    const navigation = screen.getByRole("navigation", {
      name: "Primary navigation",
    });
    expect(navigation).toHaveTextContent("Dashboard");
    expect(navigation).toHaveTextContent("Registries");
    expect(navigation).toHaveTextContent("Deployment Profiles");
    expect(navigation).toHaveTextContent("Sessions");
    expect(navigation).toHaveTextContent("Settings");
  });

  it("renders the Dashboard route", () => {
    renderRoute("/");

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });

  it("renders a placeholder route", () => {
    renderRoute("/deployment-profiles");

    expect(
      screen.getByRole("heading", { name: "Deployment Profiles" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/not available in Stage 0B/i)).toBeInTheDocument();
  });

  it("renders the Not Found page for an unknown route", () => {
    renderRoute("/not-a-route");

    expect(
      screen.getByRole("heading", { name: "Page Not Found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Return to Dashboard" }),
    ).toHaveAttribute("href", "/");
  });
});
