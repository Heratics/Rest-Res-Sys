import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useReservationStore } from "@/services/reservationStore";
import { Check, Copy, QrCode } from "lucide-react";
import { restaurantSettings } from "@/services/mockData";

export default function Reserve() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const { addReservation } = useReservationStore();
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "", // Mocked just for visual completeness
    date: "",
    time: "",
    guests: "2",
    specialRequests: "",
    paymentMethod: "CliQ" as "CliQ" | "Pay Upon Arrival"
  });

  const [reservationResult, setReservationResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const submitReservation = () => {
    const res = addReservation({
      customer: { id: "c_new", name: formData.name, phone: formData.phone },
      date: formData.date,
      time: formData.time,
      guests: parseInt(formData.guests),
      specialRequests: formData.specialRequests,
      status: "Pending",
      paymentMethod: formData.paymentMethod,
      paymentStatus: "Pending"
    });
    setReservationResult(res);
    setStep(4);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl min-h-[calc(100vh-160px)] flex flex-col justify-center">
      <div className="mb-12">
        <h1 className="font-serif text-3xl md:text-5xl text-center mb-6">Reserve a Table</h1>
        
        {/* Step Indicator */}
        <div className="flex justify-center items-center max-w-md mx-auto">
          {[1, 2, 3, 4].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-serif text-sm transition-colors ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
              }`}>
                {s}
              </div>
              {i < 3 && (
                <div className={`h-px flex-1 mx-2 transition-colors ${
                  step > s ? "bg-primary" : "bg-border"
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          {/* STEP 1: Account */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 bg-card p-6 md:p-8 rounded-2xl border border-white/5"
            >
              <div>
                <h2 className="text-xl font-serif mb-2 text-white">Guest Details</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Create an account to access your reservation details and check-in QR code later.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Eleanor Vance" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+962 6 555 0101" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleNext}
                  disabled={!formData.name || !formData.phone || !formData.password}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 bg-card p-6 md:p-8 rounded-2xl border border-white/5"
            >
              <div>
                <h2 className="text-xl font-serif mb-2 text-white">Reservation Details</h2>
                <p className="text-sm text-muted-foreground mb-6">Select your preferred date and time.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="appearance-none [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input 
                    id="time" 
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="appearance-none [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guests">Number of Guests</Label>
                <select 
                  id="guests"
                  value={formData.guests}
                  onChange={(e) => setFormData({...formData, guests: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} {i+1 === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requests">Special Requests (Optional)</Label>
                <textarea 
                  id="requests"
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({...formData, specialRequests: e.target.value})}
                  className="flex min-h-[100px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary resize-none"
                  placeholder="Anniversary, dietary requirements, preferred seating..."
                />
              </div>

              <div className="pt-6 flex gap-4">
                <Button variant="outline" size="lg" className="w-1/3" onClick={handleBack}>Back</Button>
                <Button 
                  className="w-2/3" 
                  size="lg" 
                  onClick={handleNext}
                  disabled={!formData.date || !formData.time}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Payment */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-serif mb-2 text-white">Payment Method</h2>
                <p className="text-sm text-muted-foreground">Select how you would like to secure your reservation.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card 
                  className={`cursor-pointer transition-all ${formData.paymentMethod === 'CliQ' ? 'border-primary ring-1 ring-primary shadow-[0_0_15px_rgba(201,168,76,0.15)]' : 'hover:border-border/80'}`}
                  onClick={() => setFormData({...formData, paymentMethod: 'CliQ'})}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                      <Check className={`w-6 h-6 ${formData.paymentMethod === 'CliQ' ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                    <h3 className="font-serif text-xl mb-2">Pay with CliQ</h3>
                    <p className="text-sm text-muted-foreground mb-6">Secure your reservation instantly via digital payment.</p>
                    
                    <div className="space-y-3 bg-black/40 p-4 rounded-lg border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Alias</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{restaurantSettings.cliqAlias}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleCopy(restaurantSettings.cliqAlias); }} className="text-primary hover:text-primary/80">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Phone</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{restaurantSettings.cliqPhone}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleCopy(restaurantSettings.cliqPhone); }} className="text-primary hover:text-primary/80">
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all ${formData.paymentMethod === 'Pay Upon Arrival' ? 'border-primary ring-1 ring-primary shadow-[0_0_15px_rgba(201,168,76,0.15)]' : 'hover:border-border/80'}`}
                  onClick={() => setFormData({...formData, paymentMethod: 'Pay Upon Arrival'})}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                      <Check className={`w-6 h-6 ${formData.paymentMethod === 'Pay Upon Arrival' ? 'opacity-100' : 'opacity-0'}`} />
                    </div>
                    <h3 className="font-serif text-xl mb-2">Pay Upon Arrival</h3>
                    <p className="text-sm text-muted-foreground">Settle your bill at the restaurant after your dining experience.</p>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-6 flex gap-4">
                <Button variant="outline" size="lg" className="w-1/3" onClick={handleBack}>Back</Button>
                <Button 
                  className="w-2/3" 
                  size="lg" 
                  onClick={submitReservation}
                >
                  {formData.paymentMethod === 'CliQ' ? "I've Sent the Payment" : "Confirm Reservation"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Confirmation */}
          {step === 4 && reservationResult && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card p-8 rounded-2xl border border-white/5 text-center flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-2xl font-serif mb-2 text-white">Reservation Request Sent</h2>
              <p className="text-sm text-muted-foreground mb-8">
                {formData.paymentMethod === 'CliQ' 
                  ? "We are verifying your payment. Your reservation is currently pending."
                  : "Your reservation has been received."}
              </p>

              <div className="w-full max-w-sm bg-black/50 border border-white/10 rounded-xl p-6 mb-8">
                <div className="bg-white p-4 rounded-lg inline-block mb-6 relative">
                  <div className="absolute inset-0 border-2 border-primary/20 m-2 rounded"></div>
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
                  
                  <div className="text-muted-foreground">Status</div>
                  <div className="text-right font-medium text-amber-500">Pending</div>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full max-w-sm"
                onClick={() => setLocation("/my-reservation")}
              >
                View My Reservation
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}