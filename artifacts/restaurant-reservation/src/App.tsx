import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { StoreProvider } from '@/services/StoreContext';

import Home from '@/pages/public/Home';
import Reserve from '@/pages/public/Reserve';
import MyReservation from '@/pages/public/MyReservation';

import DashboardOverview from '@/pages/dashboard/DashboardOverview';
import Reservations from '@/pages/dashboard/Reservations';
import Calendar from '@/pages/dashboard/Calendar';
import Tables from '@/pages/dashboard/Tables';
import QrScanner from '@/pages/dashboard/QrScanner';
import Payments from '@/pages/dashboard/Payments';
import Settings from '@/pages/dashboard/Settings';

const queryClient = new QueryClient();

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

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <PublicLayout><Home /></PublicLayout>} />
      <Route path="/reserve" component={() => <PublicLayout><Reserve /></PublicLayout>} />
      <Route path="/my-reservation" component={() => <PublicLayout><MyReservation /></PublicLayout>} />
      
      <Route path="/dashboard" component={() => <DashboardLayout><DashboardOverview /></DashboardLayout>} />
      <Route path="/dashboard/reservations" component={() => <DashboardLayout><Reservations /></DashboardLayout>} />
      <Route path="/dashboard/calendar" component={() => <DashboardLayout><Calendar /></DashboardLayout>} />
      <Route path="/dashboard/tables" component={() => <DashboardLayout><Tables /></DashboardLayout>} />
      <Route path="/dashboard/qr-scanner" component={() => <DashboardLayout><QrScanner /></DashboardLayout>} />
      <Route path="/dashboard/payments" component={() => <DashboardLayout><Payments /></DashboardLayout>} />
      <Route path="/dashboard/settings" component={() => <DashboardLayout><Settings /></DashboardLayout>} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </StoreProvider>
    </QueryClientProvider>
  );
}

export default App;
