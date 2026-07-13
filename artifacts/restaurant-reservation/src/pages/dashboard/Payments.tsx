import { useState } from "react";
import { useRestaurantStore } from "@/services/restaurantStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Check } from "lucide-react";

export default function Payments() {
  const { settings, updateSettings } = useRestaurantStore();
  const [formData, setFormData] = useState({
    cliqAlias: settings.cliqAlias,
    cliqPhone: settings.cliqPhone,
    depositRequired: settings.depositRequired,
    allowPayUponArrival: settings.allowPayUponArrival,
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateSettings(formData);
      setIsSaving(false);
      toast.success("Payment settings updated successfully");
    }, 600);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight mb-1">Payment Settings</h1>
        <p className="text-muted-foreground">Configure accepted payment methods and requirements.</p>
      </div>

      <Card className="border-white/5 bg-card">
        <CardHeader className="border-b border-white/5 bg-black/20 pb-6">
          <CardTitle className="font-serif">CliQ Integration</CardTitle>
          <CardDescription>Details for customers to send digital payments.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6 pt-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cliqAlias">CliQ Alias</Label>
              <Input 
                id="cliqAlias" 
                value={formData.cliqAlias}
                onChange={(e) => setFormData({...formData, cliqAlias: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cliqPhone">CliQ Phone Number</Label>
              <Input 
                id="cliqPhone" 
                value={formData.cliqPhone}
                onChange={(e) => setFormData({...formData, cliqPhone: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-card">
        <CardHeader className="border-b border-white/5 bg-black/20 pb-6">
          <CardTitle className="font-serif">Payment Policies</CardTitle>
          <CardDescription>Rules applied to new reservations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6 pt-6">
          <div className="flex items-center justify-between py-2">
            <div>
              <Label className="text-base">Require Deposit</Label>
              <p className="text-sm text-muted-foreground">Require partial payment to secure booking.</p>
            </div>
            <Switch 
              checked={formData.depositRequired} 
              onCheckedChange={(checked) => setFormData({...formData, depositRequired: checked})} 
            />
          </div>
          
          <div className="flex items-center justify-between py-2 border-t border-white/5 pt-6">
            <div>
              <Label className="text-base">Allow Pay Upon Arrival</Label>
              <p className="text-sm text-muted-foreground">Give customers the option to skip upfront payment.</p>
            </div>
            <Switch 
              checked={formData.allowPayUponArrival} 
              onCheckedChange={(checked) => setFormData({...formData, allowPayUponArrival: checked})} 
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}