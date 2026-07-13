import { ReactNode } from "react";
import { Link } from "wouter";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <div className="fixed inset-0 bg-noise z-0"></div>
      
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="font-serif text-2xl tracking-widest text-primary flex items-center gap-2">
            AURUM
          </Link>
          <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide">
            <Link href="/" className="hover:text-primary transition-colors">HOME</Link>
            <Link href="/reserve" className="hover:text-primary transition-colors">RESERVATIONS</Link>
            <Link href="/my-reservation" className="hover:text-primary transition-colors">MY BOOKING</Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 relative z-10 pt-20">
        {children}
      </main>
      
      <footer className="relative z-10 border-t border-white/5 py-12 text-center text-muted-foreground bg-card">
        <div className="container mx-auto px-6">
          <p className="font-serif text-xl text-primary mb-4">AURUM</p>
          <p className="text-sm mb-8">14 Rue de Rivoli, 75001 Paris</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/" className="hover:text-foreground transition-colors">Instagram</Link>
            <Link href="/" className="hover:text-foreground transition-colors">Contact</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Owner Portal</Link>
          </div>
          <p className="text-xs mt-12 opacity-50">&copy; {new Date().getFullYear()} Aurum Restaurant. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}