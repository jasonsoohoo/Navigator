import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">404</p>
          <h1>Page Not Found</h1>
          <p className="page-summary">
            The requested Navigator route does not exist.
          </p>
        </div>
      </div>
      <Link className="text-link" to="/">
        Return to Dashboard
      </Link>
    </div>
  );
}
