import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Route, Switch, Router as WouterRouter, Redirect } from "wouter";

import { StoreProvider } from "@/services/StoreContext";
import { useOwnerAuth, useEmployeeAuth } from "@/services/authStore";

// Layouts
import { PublicLayout } from "@/layouts/PublicLayout";
import { OwnerLayout } from "@/layouts/OwnerLayout";
import { EmployeeLayout } from "@/layouts/EmployeeLayout";

// Public
import Home from "@/pages/public/Home";

// Auth pages
import OwnerLogin from "@/pages/owner/OwnerLogin";
import EmployeeLogin from "@/pages/employee/EmployeeLogin";

// Shared dashboard pages
import DashboardOverview from "@/pages/dashboard/DashboardOverview";
import NewReservation from "@/pages/dashboard/NewReservation";
import ReservationsPage from "@/pages/dashboard/ReservationsPage";
import FloorPlan from "@/pages/dashboard/FloorPlan";

// Owner-only pages
import Settings from "@/pages/dashboard/Settings";
import Employees from "@/pages/owner/Employees";

// Role-specific dashboards
import DoormanDashboard from "@/pages/doorman/DoormanDashboard";
import WaiterDashboard from "@/pages/waiter/WaiterDashboard";

const queryClient = new QueryClient();

// ─── Route Guards ─────────────────────────────────────────────────────────────

function OwnerRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useOwnerAuth();
  if (!isAuthenticated) return <Redirect to="/owner-login" />;
  return <OwnerLayout>{children}</OwnerLayout>;
}

function EmployeeRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useEmployeeAuth();
  if (!isAuthenticated) return <Redirect to="/employee-login" />;
  return <EmployeeLayout>{children}</EmployeeLayout>;
}

// ─── Role-aware employee dashboard ───────────────────────────────────────────

function EmployeeDashboard() {
  const { employee } = useEmployeeAuth();
  if (employee?.role === "Waiter") return <WaiterDashboard />;
  // Owner (staff-level) and Doorman both see the Doorman dashboard
  return <DoormanDashboard />;
}

// ─── 404 ─────────────────────────────────────────────────────────────────────

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-serif text-primary mb-2">404</h1>
        <p className="text-muted-foreground">Page not found.</p>
      </div>
    </div>
  );
}

// ─── Router ──────────────────────────────────────────────────────────────────

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={() => <PublicLayout><Home /></PublicLayout>} />

      {/* Auth */}
      <Route path="/owner-login"    component={OwnerLogin} />
      <Route path="/employee-login" component={EmployeeLogin} />

      {/* ── Owner Dashboard ── */}
      <Route path="/owner"                component={() => <OwnerRoute><DashboardOverview /></OwnerRoute>} />
      <Route path="/owner/reservations"   component={() => <OwnerRoute><ReservationsPage /></OwnerRoute>} />
      <Route path="/owner/floor-plan"     component={() => <OwnerRoute><FloorPlan /></OwnerRoute>} />
      <Route path="/owner/employees"      component={() => <OwnerRoute><Employees /></OwnerRoute>} />
      <Route path="/owner/settings"       component={() => <OwnerRoute><Settings /></OwnerRoute>} />

      {/* ── Employee Dashboard (Doorman / Waiter / Owner-staff) ── */}
      <Route path="/employee"                 component={() => <EmployeeRoute><EmployeeDashboard /></EmployeeRoute>} />
      <Route path="/employee/new-reservation" component={() => <EmployeeRoute><NewReservation /></EmployeeRoute>} />
      <Route path="/employee/reservations"    component={() => <EmployeeRoute><ReservationsPage /></EmployeeRoute>} />
      <Route path="/employee/floor-plan"      component={() => <EmployeeRoute><FloorPlan /></EmployeeRoute>} />

      {/* Legacy redirects */}
      <Route path="/dashboard"  component={() => <Redirect to="/owner" />} />

      <Route component={NotFound} />
    </Switch>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </StoreProvider>
    </QueryClientProvider>
  );
}

export default App;
