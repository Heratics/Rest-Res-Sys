import { useState } from "react";
import { useRestaurantStore } from "@/services/restaurantStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Settings() {
  const { settings, updateSettings } = useRestaurantStore();
  const [formData, setFormData] = useState({
    name: settings.name,
    phone: settings.phone,
    address: settings.address,
    openingHours: settings.openingHours,
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateSettings(formData);
      setIsSaving(false);
      toast.success("Settings saved successfully");
    }, 600);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium tracking-tight mb-1">Restaurant Settings</h1>
        <p className="text-muted-foreground">Manage your restaurant identity and details.</p>
      </div>

      <Card className="border-white/5 bg-card">
        <CardHeader className="border-b border-white/5 bg-black/20 pb-6">
          <CardTitle className="font-serif">General Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Restaurant Name</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input 
                id="phone" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openingHours">Opening Hours</Label>
              <Input 
                id="openingHours" 
                value={formData.openingHours}
                onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input 
              id="address" 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-card">
        <CardHeader className="border-b border-white/5 bg-black/20 pb-6">
          <CardTitle className="font-serif">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-6 flex gap-4">
           {/* Theme selector just for visual completeness, we are forcing dark mode */}
           <div className="border-2 border-primary rounded-xl p-4 flex-1 cursor-pointer bg-black/40 text-center relative overflow-hidden">
             <div className="absolute top-2 right-2 w-3 h-3 bg-primary rounded-full"></div>
             <div className="w-full h-20 bg-background rounded-md border border-white/10 mb-4 flex flex-col p-2 gap-2">
               <div className="w-full h-4 bg-white/10 rounded"></div>
               <div className="w-1/2 h-4 bg-white/10 rounded"></div>
             </div>
             <p className="font-medium text-sm">Dark Luxury (Active)</p>
           </div>
           
           <div className="border border-white/10 rounded-xl p-4 flex-1 cursor-pointer bg-white/5 text-center opacity-50 hover:opacity-80 transition-opacity">
             <div className="w-full h-20 bg-white rounded-md border border-black/10 mb-4 flex flex-col p-2 gap-2">
               <div className="w-full h-4 bg-black/10 rounded"></div>
               <div className="w-1/2 h-4 bg-black/10 rounded"></div>
             </div>
             <p className="font-medium text-sm">Light (Coming Soon)</p>
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