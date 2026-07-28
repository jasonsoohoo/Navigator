import { NavLink, Outlet } from "react-router-dom";

const navigationItems = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/registries", label: "Registries" },
  { to: "/deployment-profiles", label: "Deployment Profiles" },
  { to: "/sessions", label: "Sessions" },
  { to: "/settings", label: "Settings" },
];

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            N
          </span>
          <div>
            <span className="brand__name">Navigator</span>
            <span className="brand__subtitle">GPU Workload Control Plane</span>
          </div>
        </div>

        <nav className="primary-nav" aria-label="Primary navigation">
          <ul>
            {navigationItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link--active" : "nav-link"
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <p className="app-header__stage">Foundation / Stage 0B</p>
      </header>

      <main className="main-content">
        <div className="content-frame">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
