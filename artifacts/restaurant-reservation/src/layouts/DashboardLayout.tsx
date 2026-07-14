import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Calendar as CalendarIcon, Users, QrCode, CreditCard, Settings, LogOut, Menu } from "lucide-react";

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { label: "Reservations", path: "/dashboard/reservations", icon: Users },
    { label: "Calendar", path: "/dashboard/calendar", icon: CalendarIcon },
    { label: "Tables", path: "/dashboard/tables", icon: LayoutDashboard },
    { label: "QR Scanner", path: "/dashboard/qr-scanner", icon: QrCode },
    { label: "Payments", path: "/dashboard/payments", icon: CreditCard },
    { label: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-foreground">
      <div className="fixed inset-0 bg-noise z-0"></div>
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card relative z-20">
        <span className="font-serif text-xl tracking-widest text-primary">BOOMCLUB</span>
        <button className="p-2"><Menu className="w-5 h-5" /></button>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border relative z-20">
        <div className="p-8 pb-12 flex justify-center">
          <Link href="/dashboard" className="font-serif text-2xl tracking-widest text-primary cursor-pointer">
            BOOMCLUB
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" 
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <Link href="/">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all cursor-pointer">
              <LogOut className="w-4 h-4" />
              Exit Dashboard
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative z-10 overflow-y-auto">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}