import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShieldCheck, BadgeCheck } from "lucide-react";
import { useRestaurantStore } from "@/services/restaurantStore";

export default function Home() {
  const { settings } = useRestaurantStore();

  return (
    <div className="w-full relative flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full h-screen flex items-center justify-center relative overflow-hidden -mt-20 pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-background z-0 flex items-center justify-center">
          <div className="w-[150vw] h-[150vw] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background/0 to-background/0 absolute -top-1/2 opacity-70" />
        </div>

        <div className="container relative z-10 mx-auto px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            {/* Logo */}
            <motion.img
              src="/boom-logo.png"
              alt="BooM Club Logo"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              className="w-48 h-48 md:w-60 md:h-60 object-contain mb-6 drop-shadow-[0_0_40px_rgba(201,168,76,0.25)]"
            />

            <p className="text-primary font-medium tracking-[0.3em] text-xs md:text-sm uppercase mb-4">
              Amman · 6th Circle
            </p>

            <p className="text-muted-foreground max-w-md mx-auto text-base md:text-lg font-light mb-12">
              Where the night comes alive. Amman's premier nightclub experience — music, energy, and unforgettable moments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/owner-login">
                <Button size="lg" className="w-full sm:w-auto min-w-[200px] text-base font-serif gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  Owner Portal
                </Button>
              </Link>
              <Link href="/employee-login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px] text-base font-serif gap-2">
                  <BadgeCheck className="w-5 h-5" />
                  Staff Portal
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="w-full py-24 bg-background relative z-10 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { label: "Location", value: settings.address },
              { label: "Hours",    value: settings.openingHours },
              { label: "Contact",  value: settings.phone },
            ].map(({ label, value }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-2"
              >
                <p className="text-xs uppercase tracking-widest text-primary/70 font-medium">{label}</p>
                <p className="text-white/70 text-sm">{value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
