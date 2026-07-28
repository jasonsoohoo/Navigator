import type { HealthCheckResult } from "../api/healthModels";

interface HealthStatusProps {
  label: string;
  result: HealthCheckResult;
}

const stateLabels: Record<HealthCheckResult["state"], string> = {
  loading: "Loading",
  healthy: "Healthy",
  unhealthy: "Unhealthy",
  unavailable: "Unavailable",
  retrying: "Retrying",
};

export function HealthStatus({ label, result }: HealthStatusProps) {
  const headingId = `health-${result.name}`;

  return (
    <section
      className={`health-check health-check--${result.state}`}
      aria-labelledby={headingId}
    >
      <div className="health-check__heading">
        <div>
          <h3 id={headingId}>{label}</h3>
          <code>{result.endpoint}</code>
        </div>
        <p className="health-check__state">
          <span className="health-check__indicator" aria-hidden="true" />
          {stateLabels[result.state]}
        </p>
      </div>
      <p className="health-check__message">{result.message}</p>
    </section>
  );
}
