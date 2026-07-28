export function DeploymentProfilesPage() {
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Launch configuration</p>
          <h1>Deployment Profiles</h1>
          <p className="page-summary">
            Reusable workload deployment settings belong to a later Navigator
            stage.
          </p>
        </div>
      </div>
      <p className="placeholder-note">
        Deployment profile creation and editing are not available in Stage 0B.
      </p>
    </div>
  );
}
