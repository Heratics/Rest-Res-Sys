import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useRestaurantStore } from "@/services/restaurantStore";

export default function Home() {
  const { settings } = useRestaurantStore();

  return (
    <div className="w-full relative flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full h-screen flex items-center justify-center relative overflow-hidden -mt-20 pt-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-background z-0 flex items-center justify-center">
          <div className="w-[150vw] h-[150vw] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background/0 to-background/0 absolute -top-1/2 opacity-70"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-6 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <h2 className="text-primary font-medium tracking-[0.3em] text-sm md:text-base uppercase mb-6">A Culinary Journey</h2>
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-white mb-8 tracking-tighter">
              AURUM
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg md:text-xl font-light mb-12">
              Experience the convergence of classical technique and modern gastronomy in an atmosphere of uncompromised luxury.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/reserve">
                <Button size="lg" className="w-full sm:w-auto min-w-[200px] text-lg font-serif">Reserve a Table</Button>
              </Link>
              <Link href="/my-reservation">
                <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[200px] text-lg font-serif">My Reservation</Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ambiance Section */}
      <section className="w-full py-32 bg-background relative z-10 border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-serif text-4xl md:text-5xl mb-6 text-white">The Atmosphere</h2>
              <div className="w-12 h-0.5 bg-primary mb-8"></div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Step into a world where every detail has been meticulously curated. The warm glow of gold accents against deep charcoal walls creates a sense of intimacy and occasion.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether for a celebratory feast or a quiet, romantic evening, Aurum provides the perfect backdrop for unforgettable moments.
              </p>
            </motion.div>
            
            <motion.div 
              className="relative h-[600px] rounded-2xl overflow-hidden border border-white/10"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-black/80 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(201,168,76,0.1)_25%,transparent_25%,transparent_50%,rgba(201,168,76,0.1)_50%,rgba(201,168,76,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] opacity-20 z-0"></div>
              <div className="w-full h-full bg-card/50 flex flex-col items-center justify-center p-12 text-center relative z-20">
                 <div className="w-24 h-24 border border-primary/30 rounded-full flex items-center justify-center mb-8">
                   <div className="w-20 h-20 border border-primary/60 rounded-full flex items-center justify-center">
                     <span className="font-serif text-primary text-3xl">A</span>
                   </div>
                 </div>
                 <h3 className="font-serif text-2xl text-white mb-2">Dining Hours</h3>
                 <p className="text-muted-foreground mb-8">{settings.openingHours}</p>
                 
                 <h3 className="font-serif text-2xl text-white mb-2">Location</h3>
                 <p className="text-muted-foreground">{settings.address}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}