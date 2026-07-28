export type HealthCheckName = "liveness" | "readiness";

export type HealthCheckState =
  | "loading"
  | "healthy"
  | "unhealthy"
  | "unavailable"
  | "retrying";

export interface HealthCheckResult {
  name: HealthCheckName;
  endpoint: string;
  state: HealthCheckState;
  message: string;
  statusCode?: number;
  statusText?: string;
}

export type ApiOverallState =
  | "checking"
  | "operational"
  | "degraded"
  | "unavailable";

export interface ApiHealthSummary {
  liveness: HealthCheckResult;
  readiness: HealthCheckResult;
  overallState: ApiOverallState;
  overallLabel: string;
}

export function createPendingHealthCheck(
  name: HealthCheckName,
  endpoint: string,
  state: "loading" | "retrying",
): HealthCheckResult {
  return {
    name,
    endpoint,
    state,
    message:
      state === "loading"
        ? "Waiting for the Navigator API."
        : "Checking the Navigator API again.",
  };
}

export function summarizeApiHealth(
  liveness: HealthCheckResult,
  readiness: HealthCheckResult,
): ApiHealthSummary {
  const states = [liveness.state, readiness.state];

  if (states.every((state) => state === "healthy")) {
    return {
      liveness,
      readiness,
      overallState: "operational",
      overallLabel: "Operational",
    };
  }

  if (states.some((state) => state === "loading" || state === "retrying")) {
    return {
      liveness,
      readiness,
      overallState: "checking",
      overallLabel: "Checking",
    };
  }

  if (states.every((state) => state === "unavailable")) {
    return {
      liveness,
      readiness,
      overallState: "unavailable",
      overallLabel: "Unavailable",
    };
  }

  return {
    liveness,
    readiness,
    overallState: "degraded",
    overallLabel: "Degraded",
  };
}
