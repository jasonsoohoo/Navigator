import { Route, Routes } from "react-router-dom";

import { AppShell } from "../layouts/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { DeploymentProfilesPage } from "../pages/DeploymentProfilesPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { RegistriesPage } from "../pages/RegistriesPage";
import { SessionsPage } from "../pages/SessionsPage";
import { SettingsPage } from "../pages/SettingsPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="registries" element={<RegistriesPage />} />
        <Route
          path="deployment-profiles"
          element={<DeploymentProfilesPage />}
        />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
