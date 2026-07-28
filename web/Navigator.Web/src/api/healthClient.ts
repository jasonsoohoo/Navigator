import type { HealthCheckName, HealthCheckResult } from "./healthModels";

export async function checkHealth(
  name: HealthCheckName,
  endpoint: string,
): Promise<HealthCheckResult> {
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "text/plain",
      },
    });

    if (response.ok) {
      return {
        name,
        endpoint,
        state: "healthy",
        message: "Endpoint responded successfully.",
        statusCode: response.status,
        statusText: response.statusText,
      };
    }

    const statusDescription = response.statusText
      ? `${response.status} ${response.statusText}`
      : `${response.status}`;

    return {
      name,
      endpoint,
      state: "unhealthy",
      message: `Navigator API returned HTTP ${statusDescription}.`,
      statusCode: response.status,
      statusText: response.statusText,
    };
  } catch {
    return {
      name,
      endpoint,
      state: "unavailable",
      message: "Could not reach the Navigator API.",
    };
  }
}
