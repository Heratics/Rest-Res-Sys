import { useState, useEffect } from "react";
import { useReservationStore } from "@/services/reservationStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, ScanLine, CheckCircle2, User, Clock, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function QrScanner() {
  const { reservations, updateStatus } = useReservationStore();
  const [scanning, setScanning] = useState(true);
  const [scannedRes, setScannedRes] = useState<any>(null);

  // Mock scan effect
  useEffect(() => {
    if (!scanning) return;
    
    const timer = setTimeout(() => {
      // Randomly pick a confirmed reservation after 2 seconds
      const confirmed = reservations.find((r: any) => r.status === 'Confirmed' || r.status === 'Pending');
      if (confirmed) {
        setScannedRes(confirmed);
        setScanning(false);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [scanning, reservations]);

  const handleCheckIn = () => {
    if (scannedRes) {
      updateStatus(scannedRes.id, 'Checked In');
      setScannedRes(null);
      setScanning(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-medium tracking-tight mb-2">QR Scanner</h1>
        <p className="text-muted-foreground">Scan guest QR codes for instant check-in.</p>
      </div>

      <Card className="border-white/5 bg-card overflow-hidden">
        <CardContent className="p-0">
          <AnimatePresence mode="wait">
            {scanning ? (
              <motion.div 
                key="scanner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative aspect-square md:aspect-[4/3] bg-black flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-noise opacity-20"></div>
                
                {/* Scanner Frame */}
                <div className="relative w-64 h-64">
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-primary rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-primary rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary rounded-br-xl"></div>
                  
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute left-0 right-0 h-[2px] bg-primary shadow-[0_0_15px_rgba(227,190,89,0.8)] z-10"
                  />
                  
                  <QrCode className="w-full h-full text-white/5 p-8" />
                </div>
                
                <div className="absolute bottom-6 flex items-center gap-2 text-sm text-primary">
                  <ScanLine className="w-4 h-4 animate-pulse" /> Scanning for QR Code...
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-serif text-white mb-1">Reservation Found</h2>
                  <p className="text-primary font-mono">{scannedRes.confirmationNumber}</p>
                </div>

                <div className="bg-black/40 rounded-xl p-6 border border-white/5 space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground leading-tight">Guest Name</p>
                      <p className="font-medium text-lg">{scannedRes.customer.name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground leading-tight">Time</p>
                        <p className="font-medium">{scannedRes.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground leading-tight">Guests</p>
                        <p className="font-medium">{scannedRes.guests} Pax</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => { setScannedRes(null); setScanning(true); }}
                  >
                    Scan Another
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={handleCheckIn}
                  >
                    Check In Guest
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}