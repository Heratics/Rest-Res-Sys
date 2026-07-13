import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Route, Switch, Router as WouterRouter, useLocation, Redirect } from "wouter";

import { StoreProvider } from "@/services/StoreContext";
import { useOwnerAuth, useEmployeeAuth } from "@/services/authStore";

// Layouts
import { PublicLayout } from "@/layouts/PublicLayout";
import { OwnerLayout } from "@/layouts/OwnerLayout";
import { EmployeeLayout } from "@/layouts/EmployeeLayout";

// Customer pages
import Home from "@/pages/public/Home";
import Reserve from "@/pages/public/Reserve";
import MyReservation from "@/pages/public/MyReservation";

// Auth pages
import OwnerLogin from "@/pages/owner/OwnerLogin";
import EmployeeLogin from "@/pages/employee/EmployeeLogin";

// Owner pages (shared with employees where applicable)
import DashboardOverview from "@/pages/dashboard/DashboardOverview";
import Reservations from "@/pages/dashboard/Reservations";
import Calendar from "@/pages/dashboard/Calendar";
import Tables from "@/pages/dashboard/Tables";
import QrScanner from "@/pages/dashboard/QrScanner";
import Payments from "@/pages/dashboard/Payments";
import Settings from "@/pages/dashboard/Settings";
import Employees from "@/pages/owner/Employees";

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
      {/* ── Public / Customer ── */}
      <Route path="/" component={() => <PublicLayout><Home /></PublicLayout>} />
      <Route path="/reserve" component={() => <PublicLayout><Reserve /></PublicLayout>} />
      <Route path="/my-reservation" component={() => <PublicLayout><MyReservation /></PublicLayout>} />

      {/* ── Auth pages (standalone, no layout wrapper) ── */}
      <Route path="/owner-login" component={OwnerLogin} />
      <Route path="/employee-login" component={EmployeeLogin} />

      {/* ── Owner Dashboard ── */}
      <Route path="/owner" component={() => <OwnerRoute><DashboardOverview /></OwnerRoute>} />
      <Route path="/owner/reservations" component={() => <OwnerRoute><Reservations /></OwnerRoute>} />
      <Route path="/owner/calendar" component={() => <OwnerRoute><Calendar /></OwnerRoute>} />
      <Route path="/owner/tables" component={() => <OwnerRoute><Tables /></OwnerRoute>} />
      <Route path="/owner/qr-scanner" component={() => <OwnerRoute><QrScanner /></OwnerRoute>} />
      <Route path="/owner/payments" component={() => <OwnerRoute><Payments /></OwnerRoute>} />
      <Route path="/owner/settings" component={() => <OwnerRoute><Settings /></OwnerRoute>} />
      <Route path="/owner/employees" component={() => <OwnerRoute><Employees /></OwnerRoute>} />

      {/* ── Legacy /dashboard/* → redirect to /owner/* ── */}
      <Route path="/dashboard" component={() => <Redirect to="/owner" />} />
      <Route path="/dashboard/reservations" component={() => <Redirect to="/owner/reservations" />} />
      <Route path="/dashboard/calendar" component={() => <Redirect to="/owner/calendar" />} />
      <Route path="/dashboard/tables" component={() => <Redirect to="/owner/tables" />} />
      <Route path="/dashboard/qr-scanner" component={() => <Redirect to="/owner/qr-scanner" />} />
      <Route path="/dashboard/payments" component={() => <Redirect to="/owner/payments" />} />
      <Route path="/dashboard/settings" component={() => <Redirect to="/owner/settings" />} />

      {/* ── Employee Dashboard ── */}
      <Route path="/employee" component={() => <EmployeeRoute><DashboardOverview /></EmployeeRoute>} />
      <Route path="/employee/reservations" component={() => <EmployeeRoute><Reservations /></EmployeeRoute>} />
      <Route path="/employee/calendar" component={() => <EmployeeRoute><Calendar /></EmployeeRoute>} />
      <Route path="/employee/tables" component={() => <EmployeeRoute><Tables /></EmployeeRoute>} />
      <Route path="/employee/qr-scanner" component={() => <EmployeeRoute><QrScanner /></EmployeeRoute>} />

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
