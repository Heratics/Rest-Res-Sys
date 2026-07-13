import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { QrCode, LogOut, Calendar, Clock, Users, X } from "lucide-react";
import { useAuthStore } from "@/services/authStore";
import { useReservationStore } from "@/services/reservationStore";

export default function MyReservation() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const { getReservationByPhone, updateStatus } = useReservationStore();
  
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError("Please enter a phone number");
      return;
    }
    const res = getReservationByPhone(phone);
    if (!res) {
      setError("No reservation found for this number");
      return;
    }
    setError("");
    login(phone, password); // Mock login
  };

  const reservation = user ? getReservationByPhone(user.phone) : null;

  const handleCancel = () => {
    if (reservation) {
      updateStatus(reservation.id, "Cancelled");
      setShowCancelConfirm(false);
    }
  };

  if (!isAuthenticated || !reservation) {
    return (
      <div className="container mx-auto px-4 min-h-[calc(100vh-160px)] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl mb-2">Guest Access</h1>
                <p className="text-muted-foreground text-sm">Sign in to view your reservation details.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 text-center">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="login-phone">Phone Number</Label>
                  <Input 
                    id="login-phone" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +962 6 555 0101 (mock user)" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Any password works" 
                  />
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full" size="lg">View Reservation</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex justify-between items-center mb-12">
        <h1 className="font-serif text-3xl">My Booking</h1>
        <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-white">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Left Column - QR Code */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-white/5 bg-gradient-to-b from-card to-background text-center overflow-hidden">
            <CardContent className="p-8 flex flex-col items-center">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Confirmation</p>
                <p className="font-mono text-xl text-primary">{reservation.confirmationNumber}</p>
              </div>
              
              <div className={`p-4 rounded-xl inline-block mb-6 relative ${reservation.status === 'Cancelled' ? 'bg-gray-800 opacity-50' : 'bg-white'}`}>
                <div className="absolute inset-0 border-2 border-primary/20 m-2 rounded"></div>
                <QrCode className={`w-40 h-40 ${reservation.status === 'Cancelled' ? 'text-gray-500' : 'text-black'}`} strokeWidth={1} />
                
                {reservation.status === 'Cancelled' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-destructive text-destructive-foreground font-bold px-4 py-1 transform -rotate-12 border-2 border-destructive-foreground">
                      CANCELLED
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground max-w-[200px]">
                Present this QR code to the host upon arrival at the restaurant.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="md:col-span-3 space-y-6">
          <Card className="border-white/5">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-8 pb-8 border-b border-white/5">
                <div>
                  <h2 className="font-serif text-2xl mb-1">{reservation.customer.name}</h2>
                  <p className="text-muted-foreground">{reservation.customer.phone}</p>
                </div>
                <Badge variant={
                  reservation.status === 'Confirmed' ? 'success' :
                  reservation.status === 'Checked In' ? 'secondary' :
                  reservation.status === 'Cancelled' ? 'destructive' : 'warning'
                } className="text-sm px-3 py-1">
                  {reservation.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-8">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="font-medium">{reservation.date}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Time</p>
                    <p className="font-medium">{reservation.time}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Guests</p>
                    <p className="font-medium">{reservation.guests} People</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 rounded-xl p-5 border border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                  <p className="font-medium">{reservation.paymentMethod}</p>
                </div>
                <Badge variant={reservation.paymentStatus === 'Verified' ? 'success' : 'outline'}>
                  {reservation.paymentStatus}
                </Badge>
              </div>

              {reservation.status !== 'Cancelled' && reservation.status !== 'Checked In' && (
                <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
                  {!showCancelConfirm ? (
                    <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30" onClick={() => setShowCancelConfirm(true)}>
                      Cancel Reservation
                    </Button>
                  ) : (
                    <div className="flex items-center gap-4 bg-destructive/10 p-4 rounded-lg w-full justify-between border border-destructive/20">
                      <span className="text-sm text-destructive-foreground font-medium">Are you sure?</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowCancelConfirm(false)}>No, Keep it</Button>
                        <Button variant="destructive" size="sm" onClick={handleCancel}>Yes, Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}