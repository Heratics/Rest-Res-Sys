import { ReactNode } from "react";
import { Link } from "wouter";
import { ShieldCheck, BadgeCheck } from "lucide-react";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <div className="fixed inset-0 bg-noise z-0" />

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link
            href="/"
            className="font-serif text-2xl tracking-widest text-primary shrink-0"
          >
            BOOMCLUB
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/owner-login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/15 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-primary/70" />
              Owner
            </Link>
            <Link
              href="/employee-login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/15 transition-all"
            >
              <BadgeCheck className="w-4 h-4 text-primary/70" />
              Staff
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 pt-20">{children}</main>

      <footer className="relative z-10 border-t border-white/5 py-12 text-center text-muted-foreground bg-card">
        <div className="container mx-auto px-6">
          <p className="font-serif text-xl text-primary mb-4">BOOMCLUB</p>
          <p className="text-sm mb-8">6th Circle, Amman, Jordan</p>
          <div className="flex justify-center gap-6 text-sm flex-wrap">
            <Link
              href="/owner-login"
              className="hover:text-foreground transition-colors"
            >
              Owner Portal
            </Link>
            <Link
              href="/employee-login"
              className="hover:text-foreground transition-colors"
            >
              Staff Portal
            </Link>
          </div>
          <p className="text-xs mt-12 opacity-50">
            &copy; {new Date().getFullYear()} BOOMCLUB. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
