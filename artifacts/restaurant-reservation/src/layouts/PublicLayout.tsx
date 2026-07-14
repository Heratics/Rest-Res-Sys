import { ReactNode, useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, User, LogOut, CalendarPlus, QrCode, ShieldCheck, BadgeCheck } from "lucide-react";
import { useAuthStore } from "@/services/authStore";

export function PublicLayout({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const customerLinks = [
    { href: "/", label: "HOME" },
    { href: "/reserve", label: "RESERVE" },
    { href: "/my-reservation", label: "MY BOOKING" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <div className="fixed inset-0 bg-noise z-0" />

      {/* ── Navbar ── */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="font-serif text-2xl tracking-widest text-primary shrink-0">
            BOOMCLUB
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {/* Customer links */}
            <div className="flex items-center gap-6 text-sm font-medium tracking-wide mr-auto">
              {customerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors ${
                    location === link.href ? "text-primary" : "hover:text-primary text-foreground/80"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="h-5 w-px bg-white/10 mx-3" />

            {/* Staff portal links — visually separated */}
            <div className="flex items-center gap-2">
              <Link
                href="/owner-login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide text-muted-foreground hover:text-white hover:bg-white/5 transition-colors border border-white/5 hover:border-white/10"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-primary/70" />
                OWNER
              </Link>
              <Link
                href="/employee-login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide text-muted-foreground hover:text-white hover:bg-white/5 transition-colors border border-white/5 hover:border-white/10"
              >
                <BadgeCheck className="w-3.5 h-3.5 text-primary/70" />
                STAFF
              </Link>
            </div>

            {/* Customer auth */}
            <div className="ml-2">
              {!isAuthenticated ? (
                <Link
                  href="/my-reservation"
                  className="px-4 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 transition-colors text-sm tracking-wide"
                >
                  LOGIN
                </Link>
              ) : (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-white/10 hover:border-primary/40 transition-colors text-sm"
                  >
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-white max-w-[120px] truncate">{user?.name}</span>
                    <ChevronDown
                      className={`w-3 h-3 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-xs text-muted-foreground">Signed in as</p>
                          <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user?.phone}</p>
                        </div>
                        <div className="py-1">
                          <Link href="/my-reservation" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors">
                            <QrCode className="w-4 h-4 text-primary" />My Reservation
                          </Link>
                          <Link href="/reserve" onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-white/5 transition-colors">
                            <CalendarPlus className="w-4 h-4 text-primary" />New Reservation
                          </Link>
                          <div className="border-t border-white/5 my-1" />
                          <button onClick={() => { setDropdownOpen(false); logout(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                            <LogOut className="w-4 h-4" />Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-white transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-md overflow-hidden"
            >
              <nav className="container mx-auto px-6 py-6 flex flex-col gap-1">
                {customerLinks.map((link) => (
                  <Link key={link.href} href={link.href}
                    className={`py-3 text-sm font-medium tracking-wide border-b border-white/5 transition-colors ${
                      location === link.href ? "text-primary" : "text-foreground/80 hover:text-primary"
                    }`}>
                    {link.label}
                  </Link>
                ))}

                <div className="pt-4 pb-2">
                  <p className="text-xs text-muted-foreground/50 uppercase tracking-widest mb-3">Staff Access</p>
                  <Link href="/owner-login"
                    className="flex items-center gap-2 py-3 text-sm text-muted-foreground hover:text-primary border-b border-white/5 transition-colors">
                    <ShieldCheck className="w-4 h-4 text-primary/70" />Owner Login
                  </Link>
                  <Link href="/employee-login"
                    className="flex items-center gap-2 py-3 text-sm text-muted-foreground hover:text-primary transition-colors">
                    <BadgeCheck className="w-4 h-4 text-primary/70" />Staff Login
                  </Link>
                </div>

                {!isAuthenticated ? (
                  <Link href="/my-reservation"
                    className="mt-3 py-3 text-center rounded-lg border border-primary/40 text-primary text-sm">
                    Customer Login
                  </Link>
                ) : (
                  <div className="mt-3 space-y-1">
                    <div className="py-3 border-b border-white/5">
                      <p className="text-xs text-muted-foreground">Signed in as</p>
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                    </div>
                    <Link href="/my-reservation" className="flex items-center gap-3 py-3 text-sm hover:text-primary transition-colors">
                      <QrCode className="w-4 h-4 text-primary" />My Reservation
                    </Link>
                    <Link href="/reserve" className="flex items-center gap-3 py-3 text-sm hover:text-primary transition-colors">
                      <CalendarPlus className="w-4 h-4 text-primary" />New Reservation
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-3 py-3 text-sm text-destructive">
                      <LogOut className="w-4 h-4" />Logout
                    </button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 relative z-10 pt-20">{children}</main>

      <footer className="relative z-10 border-t border-white/5 py-12 text-center text-muted-foreground bg-card">
        <div className="container mx-auto px-6">
          <p className="font-serif text-xl text-primary mb-4">BOOMCLUB</p>
          <p className="text-sm mb-8">14 Rue de Rivoli, 75001 Paris</p>
          <div className="flex justify-center gap-6 text-sm flex-wrap">
            <Link href="/" className="hover:text-foreground transition-colors">Instagram</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/owner-login" className="hover:text-foreground transition-colors">Owner Portal</Link>
            <Link href="/employee-login" className="hover:text-foreground transition-colors">Staff Portal</Link>
          </div>
          <p className="text-xs mt-12 opacity-50">&copy; {new Date().getFullYear()} BOOMCLUB. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
