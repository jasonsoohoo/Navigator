import { useEffect, useState } from "react";

import { checkHealth } from "../api/healthClient";
import {
  createPendingHealthCheck,
  summarizeApiHealth,
  type HealthCheckResult,
} from "../api/healthModels";
import { HealthStatus } from "../components/HealthStatus";

const livenessEndpoint = "/health/live";
const readinessEndpoint = "/health/ready";

async function requestHealthChecks(): Promise<
  [HealthCheckResult, HealthCheckResult]
> {
  return Promise.all([
    checkHealth("liveness", livenessEndpoint),
    checkHealth("readiness", readinessEndpoint),
  ]);
}

export function DashboardPage() {
  const [liveness, setLiveness] = useState(() =>
    createPendingHealthCheck("liveness", livenessEndpoint, "loading"),
  );
  const [readiness, setReadiness] = useState(() =>
    createPendingHealthCheck("readiness", readinessEndpoint, "loading"),
  );
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    void requestHealthChecks().then(([liveResult, readyResult]) => {
      if (isMounted) {
        setLiveness(liveResult);
        setReadiness(readyResult);
        setIsChecking(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = summarizeApiHealth(liveness, readiness);

  async function retryHealthChecks() {
    if (isChecking) {
      return;
    }

    setIsChecking(true);
    setLiveness(
      createPendingHealthCheck("liveness", livenessEndpoint, "retrying"),
    );
    setReadiness(
      createPendingHealthCheck("readiness", readinessEndpoint, "retrying"),
    );

    const [liveResult, readyResult] = await requestHealthChecks();
    setLiveness(liveResult);
    setReadiness(readyResult);
    setIsChecking(false);
  }

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">System overview</p>
          <h1>Dashboard</h1>
          <p className="page-summary">
            Current connectivity between the browser client and Navigator API.
          </p>
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={() => void retryHealthChecks()}
          disabled={isChecking}
        >
          Retry
        </button>
      </div>

      <section className="api-health" aria-labelledby="api-health-title">
        <div className="api-health__summary" aria-live="polite" aria-atomic="true">
          <div>
            <p className="section-label">Control plane service</p>
            <h2 id="api-health-title">Navigator API</h2>
          </div>
          <p
            className={`overall-status overall-status--${summary.overallState}`}
          >
            <span className="overall-status__indicator" aria-hidden="true" />
            {summary.overallLabel}
          </p>
        </div>

        <div className="health-grid" aria-live="polite">
          <HealthStatus label="Liveness" result={summary.liveness} />
          <HealthStatus label="Readiness" result={summary.readiness} />
        </div>
      </section>
    </div>
  );
}
