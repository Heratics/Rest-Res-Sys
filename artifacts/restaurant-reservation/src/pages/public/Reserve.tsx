import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useReservationStore } from "@/services/reservationStore";
import { useAuthStore } from "@/services/authStore";
import { Check, Copy, QrCode, LogIn, UserPlus, ChevronRight } from "lucide-react";
import { restaurantSettings } from "@/services/mockData";

// Auth sub-step states for logged-out users
type AuthView = "choose" | "login" | "register";

// Main wizard steps (1 = reservation details, 2 = payment, 3 = confirmation)
// Step 0 is the auth gate shown only to logged-out users
type WizardStep = 0 | 1 | 2 | 3;

export default function Reserve() {
  const [, setLocation] = useLocation();
  const { addReservation } = useReservationStore();
  const { user, isAuthenticated, login, register } = useAuthStore();

  // If already authenticated, skip the auth gate
  const [step, setStep] = useState<WizardStep>(isAuthenticated ? 1 : 0);
  const [authView, setAuthView] = useState<AuthView>("choose");

  // Auth form fields
  const [authData, setAuthData] = useState({ name: "", phone: "", password: "" });
  const [authError, setAuthError] = useState("");

  // Reservation form fields
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: "2",
    specialRequests: "",
    paymentMethod: "CliQ" as "CliQ" | "Pay Upon Arrival",
  });

  const [reservationResult, setReservationResult] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // --- Auth handlers ---
  const handleLogin = () => {
    setAuthError("");
    if (!authData.phone || !authData.password) {
      setAuthError("Please fill in all fields.");
      return;
    }
    login(authData.phone, authData.password);
    setStep(1);
  };

  const handleRegister = () => {
    setAuthError("");
    if (!authData.name || !authData.phone || !authData.password) {
      setAuthError("Please fill in all fields.");
      return;
    }
    register(authData.name, authData.phone, authData.password);
    setStep(1);
  };

  // --- Reservation submission ---
  const submitReservation = () => {
    const customerName = user?.name ?? authData.name ?? "Guest";
    const customerPhone = user?.phone ?? authData.phone ?? "";
    const res = addReservation({
      customer: { id: "c_new", name: customerName, phone: customerPhone },
      date: formData.date,
      time: formData.time,
      guests: parseInt(formData.guests),
      specialRequests: formData.specialRequests,
      status: "Pending",
      paymentMethod: formData.paymentMethod,
      paymentStatus: "Pending",
    });
    setReservationResult(res);
    setStep(3);
  };

  // Compute total visible steps for the progress indicator
  // Logged-in users see 3 steps (details, payment, confirmation)
  // Logged-out users see 4 steps (auth gate counts as step 1)
  const totalSteps = isAuthenticated || step >= 1 ? 3 : 4;
  const displayStep = isAuthenticated
    ? step // 1,2,3
    : step === 0
    ? 1
    : step; // offset to 1-indexed

  const stepVariants = {
    initial: { opacity: 0, x: 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl min-h-[calc(100vh-160px)] flex flex-col justify-center">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-serif text-3xl md:text-5xl text-center mb-6">Reserve a Table</h1>

        {/* Step indicator — only shown from step 1 onward */}
        {step >= 1 && (
          <div className="flex justify-center items-center max-w-sm mx-auto">
            {[1, 2, 3].map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm transition-colors ${
                    step >= s
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border text-muted-foreground"
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {i < 2 && (
                  <div
                    className={`h-px flex-1 mx-2 transition-colors ${step > s ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="relative flex-1">
        <AnimatePresence mode="wait">

          {/* ── STEP 0: Auth Gate (logged-out only) ── */}
          {step === 0 && (
            <motion.div key="step0" {...stepVariants}>

              {/* Sub-view: Choose */}
              {authView === "choose" && (
                <div className="space-y-6">
                  <div className="text-center mb-10">
                    <h2 className="font-serif text-3xl mb-3 text-white">Welcome</h2>
                    <p className="text-muted-foreground">Have you reserved with us before?</p>
                    <p className="text-sm text-muted-foreground/70 mt-2 max-w-sm mx-auto">
                      Create an account once so you can access your reservation and QR code anytime.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setAuthView("login")}
                      className="group bg-card border border-white/10 hover:border-primary/50 rounded-2xl p-8 text-left transition-all hover:shadow-[0_0_20px_rgba(201,168,76,0.1)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-5 text-primary group-hover:bg-primary/20 transition-colors">
                        <LogIn className="w-6 h-6" />
                      </div>
                      <h3 className="font-serif text-xl text-white mb-2">Log In</h3>
                      <p className="text-sm text-muted-foreground">I already have an account</p>
                      <div className="mt-5 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Continue <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </button>

                    <button
                      onClick={() => setAuthView("register")}
                      className="group bg-primary hover:bg-primary/90 border border-primary rounded-2xl p-8 text-left transition-all shadow-[0_0_25px_rgba(201,168,76,0.2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div className="w-12 h-12 bg-black/20 rounded-full flex items-center justify-center mb-5 text-primary-foreground">
                        <UserPlus className="w-6 h-6" />
                      </div>
                      <h3 className="font-serif text-xl text-primary-foreground mb-2">Create Account</h3>
                      <p className="text-sm text-primary-foreground/70">First time? Set up in seconds</p>
                      <div className="mt-5 flex items-center text-primary-foreground text-sm font-medium">
                        Get started <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-view: Login */}
              {authView === "login" && (
                <div className="bg-card border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
                  <div>
                    <button
                      onClick={() => { setAuthView("choose"); setAuthError(""); }}
                      className="text-muted-foreground hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
                    >
                      ← Back
                    </button>
                    <h2 className="font-serif text-2xl text-white mb-1">Welcome Back</h2>
                    <p className="text-sm text-muted-foreground">Sign in to continue to your reservation.</p>
                  </div>

                  {authError && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                      {authError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-phone">Phone Number</Label>
                      <Input
                        id="login-phone"
                        value={authData.phone}
                        onChange={(e) => setAuthData({ ...authData, phone: e.target.value })}
                        placeholder="+962 6 555 0101"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={authData.password}
                        onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button className="w-full" size="lg" onClick={handleLogin}>
                      Log In &amp; Continue
                    </Button>
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    No account yet?{" "}
                    <button
                      onClick={() => { setAuthView("register"); setAuthError(""); }}
                      className="text-primary hover:underline"
                    >
                      Create one
                    </button>
                  </p>
                </div>
              )}

              {/* Sub-view: Register */}
              {authView === "register" && (
                <div className="bg-card border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
                  <div>
                    <button
                      onClick={() => { setAuthView("choose"); setAuthError(""); }}
                      className="text-muted-foreground hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
                    >
                      ← Back
                    </button>
                    <h2 className="font-serif text-2xl text-white mb-1">Create Account</h2>
                    <p className="text-sm text-muted-foreground">
                      Your account lets you access your reservation and QR code anytime.
                    </p>
                  </div>

                  {authError && (
                    <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                      {authError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Full Name</Label>
                      <Input
                        id="reg-name"
                        value={authData.name}
                        onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                        placeholder="e.g. Eleanor Vance"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-phone">Phone Number</Label>
                      <Input
                        id="reg-phone"
                        value={authData.phone}
                        onChange={(e) => setAuthData({ ...authData, phone: e.target.value })}
                        placeholder="+962 6 555 0101"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        value={authData.password}
                        onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button className="w-full" size="lg" onClick={handleRegister}>
                      Create Account &amp; Continue
                    </Button>
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      onClick={() => { setAuthView("login"); setAuthError(""); }}
                      className="text-primary hover:underline"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 1: Reservation Details ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              {...stepVariants}
              className="bg-card border border-white/5 rounded-2xl p-6 md:p-8 space-y-6"
            >
              <div>
                <h2 className="font-serif text-2xl text-white mb-1">Reservation Details</h2>
                {user && (
                  <p className="text-sm text-muted-foreground">
                    Booking for <span className="text-primary">{user.name}</span> — {user.phone}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="appearance-none [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="appearance-none [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests">Number of Guests</Label>
                <select
                  id="guests"
                  value={formData.guests}
                  onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i + 1 === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <textarea
                  id="requests"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="flex min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                  placeholder="Anniversary, dietary requirements, preferred seating..."
                />
              </div>

              <div className="pt-2 flex gap-4">
                {!isAuthenticated && (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-1/3"
                    onClick={() => setStep(0)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  className={!isAuthenticated ? "w-2/3" : "w-full"}
                  size="lg"
                  onClick={() => setStep(2)}
                  disabled={!formData.date || !formData.time}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Payment ── */}
          {step === 2 && (
            <motion.div key="step2" {...stepVariants} className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="font-serif text-2xl text-white mb-2">Payment Method</h2>
                <p className="text-sm text-muted-foreground">Select how you would like to secure your reservation.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* CliQ */}
                <Card
                  className={`cursor-pointer transition-all ${
                    formData.paymentMethod === "CliQ"
                      ? "border-primary ring-1 ring-primary shadow-[0_0_15px_rgba(201,168,76,0.15)]"
                      : "hover:border-border/80"
                  }`}
                  onClick={() => setFormData({ ...formData, paymentMethod: "CliQ" })}
                >
                  <CardContent className="p-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                      {formData.paymentMethod === "CliQ" ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" />
                      )}
                    </div>
                    <h3 className="font-serif text-xl mb-2">Pay with CliQ</h3>
                    <p className="text-sm text-muted-foreground mb-5">
                      Secure your reservation instantly via digital payment.
                    </p>

                    <div className="space-y-3 bg-black/40 p-4 rounded-lg border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Alias</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{restaurantSettings.cliqAlias}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(restaurantSettings.cliqAlias, "alias");
                            }}
                            className="text-primary hover:text-primary/70 transition-colors"
                          >
                            {copied === "alias" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Phone</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{restaurantSettings.cliqPhone}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(restaurantSettings.cliqPhone, "phone");
                            }}
                            className="text-primary hover:text-primary/70 transition-colors"
                          >
                            {copied === "phone" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {formData.paymentMethod === "CliQ" && (
                      <p className="mt-4 text-xs text-muted-foreground border-t border-white/5 pt-4">
                        After sending payment, click "I've Sent the Payment" below. The restaurant will verify and confirm your reservation.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Pay Upon Arrival */}
                <Card
                  className={`cursor-pointer transition-all ${
                    formData.paymentMethod === "Pay Upon Arrival"
                      ? "border-primary ring-1 ring-primary shadow-[0_0_15px_rgba(201,168,76,0.15)]"
                      : "hover:border-border/80"
                  }`}
                  onClick={() => setFormData({ ...formData, paymentMethod: "Pay Upon Arrival" })}
                >
                  <CardContent className="p-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                      {formData.paymentMethod === "Pay Upon Arrival" ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border-2 border-muted-foreground" />
                      )}
                    </div>
                    <h3 className="font-serif text-xl mb-2">Pay Upon Arrival</h3>
                    <p className="text-sm text-muted-foreground">
                      Settle your bill at the restaurant after your dining experience. No deposit required.
                    </p>
                    <p className="mt-5 text-xs text-muted-foreground border-t border-white/5 pt-4">
                      Your reservation will be reviewed and confirmed by our team.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-4 flex gap-4">
                <Button variant="outline" size="lg" className="w-1/3" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="w-2/3" size="lg" onClick={submitReservation}>
                  {formData.paymentMethod === "CliQ" ? "I've Sent the Payment" : "Confirm Reservation"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Confirmation ── */}
          {step === 3 && reservationResult && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-white/5 rounded-2xl p-8 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-primary" />
              </div>

              <h2 className="font-serif text-2xl mb-2 text-white">Reservation Request Sent</h2>
              <p className="text-sm text-muted-foreground mb-8 max-w-sm">
                {formData.paymentMethod === "CliQ"
                  ? "We are verifying your payment. Your reservation will be confirmed shortly."
                  : "Your reservation has been received and is pending confirmation."}
              </p>

              <div className="w-full max-w-sm bg-black/50 border border-white/10 rounded-xl p-6 mb-8">
                <div className="bg-white p-4 rounded-lg inline-block mb-6 relative">
                  <div className="absolute inset-0 border-2 border-primary/20 m-2 rounded" />
                  <QrCode className="w-32 h-32 text-black" strokeWidth={1} />
                </div>

                <div className="text-primary font-mono text-lg mb-6">{reservationResult.confirmationNumber}</div>

                <div className="grid grid-cols-2 gap-y-4 text-sm text-left">
                  <div className="text-muted-foreground">Date</div>
                  <div className="text-right font-medium">{reservationResult.date}</div>

                  <div className="text-muted-foreground">Time</div>
                  <div className="text-right font-medium">{reservationResult.time}</div>

                  <div className="text-muted-foreground">Guests</div>
                  <div className="text-right font-medium">{reservationResult.guests}</div>

                  <div className="text-muted-foreground">Payment</div>
                  <div className="text-right font-medium">{reservationResult.paymentMethod}</div>

                  <div className="text-muted-foreground">Status</div>
                  <div className="text-right font-medium text-amber-500">Pending</div>
                </div>
              </div>

              <Button size="lg" className="w-full max-w-sm" onClick={() => setLocation("/my-reservation")}>
                View My Reservation
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
