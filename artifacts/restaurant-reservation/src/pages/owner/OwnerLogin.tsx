import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";
import { useOwnerAuth } from "@/services/authStore";

export default function OwnerLogin() {
  const { login } = useOwnerAuth();
  const [, setLocation] = useLocation();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!credentials.username || !credentials.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));
    login(credentials.username, credentials.password);
    setLocation("/owner");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 relative">
      <div className="fixed inset-0 bg-noise z-0" />

      {/* Subtle background glow */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <p className="font-serif text-3xl tracking-widest text-primary mb-1">AURUM</p>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Owner Portal</p>
        </div>

        <Card className="border-white/5 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-serif text-2xl text-white mb-1">Owner Login</h1>
              <p className="text-sm text-muted-foreground text-center">
                Access is restricted to authorized owners only.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 text-center">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="owner-username">Username or Email</Label>
                <Input
                  id="owner-username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="owner"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="owner-password">Password</Label>
                <Input
                  id="owner-password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In to Owner Dashboard"}
                </Button>
              </div>
            </form>

            <p className="text-center text-xs text-muted-foreground/50 mt-6">
              Mock mode — any credentials are accepted
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to public site
          </a>
        </div>
      </motion.div>
    </div>
  );
}
