import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useRestaurantStore } from "@/services/restaurantStore";
import { CheckCircle2 } from "lucide-react";

export default function Settings() {
  const { settings, updateSettings } = useRestaurantStore();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white mb-1">Settings</h1>
        <p className="text-muted-foreground text-sm">Restaurant profile and contact information.</p>
      </div>

      <form onSubmit={handleSave}>
        <Card className="border-white/5">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name</Label>
              <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours">Opening Hours</Label>
              <Input id="hours" value={form.openingHours} onChange={(e) => set("openingHours", e.target.value)} />
            </div>

            <Button type="submit" className="w-full gap-2">
              {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved</> : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
