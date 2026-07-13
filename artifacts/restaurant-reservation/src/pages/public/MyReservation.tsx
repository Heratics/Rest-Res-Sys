import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { QrCode, LogOut, Calendar, Clock, Users } from "lucide-react";
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
      setError("Please enter a phone number.");
      return;
    }
    setError("");
    login(phone, password);
  };

  const reservation = user ? getReservationByPhone(user.phone) : null;

  const handleCancel = () => {
    if (reservation) {
      updateStatus(reservation.id, "Cancelled");
      setShowCancelConfirm(false);
    }
  };

  // ── LOGGED OUT: show login form ──
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 min-h-[calc(100vh-160px)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <QrCode className="w-7 h-7 text-primary" strokeWidth={1.5} />
                </div>
                <h1 className="font-serif text-3xl mb-2">My Reservation</h1>
                <p className="text-muted-foreground text-sm">Sign in to view your booking details and QR code.</p>
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
                    placeholder="+962 6 555 0101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="pt-4">
                  <Button type="submit" className="w-full" size="lg">
                    View My Reservation
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── LOGGED IN but no reservation found ──
  if (!reservation) {
    return (
      <div className="container mx-auto px-4 min-h-[calc(100vh-160px)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 bg-card border border-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCode className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
          </div>
          <h2 className="font-serif text-2xl mb-3">No Active Reservation</h2>
          <p className="text-muted-foreground text-sm mb-8">
            We couldn't find an active reservation for{" "}
            <span className="text-white">{user.name}</span>. Make a new one to get started.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
            <Button onClick={() => window.location.href = "/reserve"}>
              Reserve a Table
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── LOGGED IN + reservation found ──
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="font-serif text-3xl">My Reservation</h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome back, {user.name}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* QR Code Column */}
          <div className="md:col-span-2">
            <Card className="border-white/5 bg-gradient-to-b from-card to-background text-center overflow-hidden">
              <CardContent className="p-8 flex flex-col items-center">
                <div className="mb-5">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Confirmation</p>
                  <p className="font-mono text-xl text-primary">{reservation.confirmationNumber}</p>
                </div>

                <div
                  className={`p-4 rounded-xl inline-block mb-5 relative ${
                    reservation.status === "Cancelled" ? "bg-gray-800 opacity-50" : "bg-white"
                  }`}
                >
                  <div className="absolute inset-0 border-2 border-primary/20 m-2 rounded" />
                  <QrCode
                    className={`w-40 h-40 ${reservation.status === "Cancelled" ? "text-gray-500" : "text-black"}`}
                    strokeWidth={1}
                  />
                  {reservation.status === "Cancelled" && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-destructive text-destructive-foreground font-bold text-xs px-3 py-1 transform -rotate-12 border border-destructive-foreground/50">
                        CANCELLED
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground max-w-[200px]">
                  Present this QR code to the host upon arrival.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Details Column */}
          <div className="md:col-span-3 space-y-4">
            <Card className="border-white/5">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-8 pb-8 border-b border-white/5">
                  <div>
                    <h2 className="font-serif text-2xl mb-1">{reservation.customer.name}</h2>
                    <p className="text-muted-foreground text-sm">{reservation.customer.phone}</p>
                  </div>
                  <Badge
                    variant={
                      reservation.status === "Confirmed"
                        ? "success"
                        : reservation.status === "Checked In"
                        ? "secondary"
                        : reservation.status === "Cancelled"
                        ? "destructive"
                        : "warning"
                    }
                    className="text-sm px-3 py-1"
                  >
                    {reservation.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-8">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Date</p>
                      <p className="font-medium">{reservation.date}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Time</p>
                      <p className="font-medium">{reservation.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Guests</p>
                      <p className="font-medium">{reservation.guests} People</p>
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 rounded-xl p-5 border border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Payment Method</p>
                    <p className="font-medium">{reservation.paymentMethod}</p>
                  </div>
                  <Badge variant={reservation.paymentStatus === "Verified" ? "success" : "outline"}>
                    {reservation.paymentStatus}
                  </Badge>
                </div>

                {reservation.status !== "Cancelled" && reservation.status !== "Checked In" && (
                  <div className="mt-8 pt-8 border-t border-white/5 flex justify-end">
                    <AnimatePresence mode="wait">
                      {!showCancelConfirm ? (
                        <motion.div key="cancel-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <Button
                            variant="outline"
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                            onClick={() => setShowCancelConfirm(true)}
                          >
                            Cancel Reservation
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="cancel-confirm"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-4 bg-destructive/10 p-4 rounded-lg w-full justify-between border border-destructive/20"
                        >
                          <span className="text-sm font-medium">Are you sure?</span>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowCancelConfirm(false)}>
                              No, Keep it
                            </Button>
                            <Button variant="destructive" size="sm" onClick={handleCancel}>
                              Yes, Cancel
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
